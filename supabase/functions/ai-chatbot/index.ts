import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // 5 minutes

const checkRateLimit = (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new rate limit window
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetTime: record.resetTime };
};

// Get allowed origin from environment variable, default to localhost for development
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    Deno.env.get("ALLOWED_ORIGIN"), // Production domain from env
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative dev port
  ].filter(Boolean);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Fallback to first allowed origin or restrict
  return allowedOrigins[0] || "https://sudharsanbuilds.com";
};

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400", // 24 hours
});

const addRateLimitHeaders = (headers: Record<string, string>, rateLimit: { remaining: number; resetTime: number }) => ({
  ...headers,
  "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
  "X-RateLimit-Remaining": rateLimit.remaining.toString(),
  "X-RateLimit-Reset": rateLimit.resetTime.toString(),
});

interface RequestBody {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Rate limiting check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] ||
                   req.headers.get("x-real-ip") ||
                   "unknown";

  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          "Retry-After": retryAfter.toString()
        }
      }
    );
  }

  try {
    const { message, conversationHistory = [] }: RequestBody = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Sudharsan's AI Assistant on his portfolio website.

Your role: Help visitors understand Sudharsan's web development services (SaaS, e-commerce, UI/UX, AI integration).

Important guidelines:
- Keep ALL responses under 3 sentences
- If asked personal questions about Sudharsan (age, location, private life), politely decline and redirect: "I focus on his professional expertise rather than personal details. Let me tell you about his work instead!"
- If asked about yourself (your name, who built you, etc.), acknowledge briefly then redirect: "I'm his AI assistant here to help you learn about his services. What interests you about his work?"
- Stay professional, warm, and helpful
- Use **bold** for key points

Focus on: React, Node.js, TypeScript, SaaS development, e-commerce platforms.`;

    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert conversation history to Gemini format
    // Ensure strict user/model alternation
    const geminiContents = [];

    // Add system prompt as first exchange
    geminiContents.push(
      { role: "user", parts: [{ text: "System context: " + systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'll follow these guidelines." }] }
    );

    // Add conversation history (limit to last 4 messages to prevent token overflow)
    const recentHistory = conversationHistory.slice(-4);
    for (const msg of recentHistory) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Add the new user message
    geminiContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error - Status:", response.status);
      console.error("Gemini API Error - Response:", errorText);
      console.error("Gemini API Error - URL:", response.url);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return new Response(
        JSON.stringify({
          error: "Failed to get response from AI service",
          details: errorData,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error("Gemini returned no candidates:", data);
      return new Response(
        JSON.stringify({
          error: "AI service returned an unexpected response",
          details: data.promptFeedback || "No candidates available"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidate = data.candidates[0];

    // Check for safety filters or blocked content
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.error("Gemini blocked content:", candidate.finishReason, candidate.safetyRatings);

      // Return a natural fallback instead of template
      return new Response(
        JSON.stringify({
          success: true,
          message: "I'd love to help, but that question goes beyond what I can assist with. **Let's talk about Sudharsan's web development services** - what type of project interests you?",
          role: "assistant",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract message with fallback
    const assistantMessage = candidate?.content?.parts?.[0]?.text || "How can I help you learn about Sudharsan's web development expertise today?";

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        role: "assistant",
      }),
      {
        status: 200,
        headers: addRateLimitHeaders(
          { ...corsHeaders, "Content-Type": "application/json" },
          rateLimit
        ),
      }
    );
  } catch (error) {
    console.error("Unexpected error in chatbot function:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({
        error: "I'm experiencing technical difficulties. Please try again in a moment.",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

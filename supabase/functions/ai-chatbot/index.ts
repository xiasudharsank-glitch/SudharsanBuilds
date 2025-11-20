import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] }: RequestBody = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Sudharsan's Elite AI Assistant on his professional portfolio website.

Your role: Help visitors explore Sudharsan's web development services, pricing, and expertise.

CORE SERVICES & PRICING:
- Landing Page: ₹15,000 (1-2 weeks) - Simple 1-2 page websites
- Portfolio Website: ₹20,000 (2-3 weeks) - Professional portfolios with project showcase
- Business Website: ₹30,000 (3-4 weeks) - 5-10 pages with CMS integration [MOST POPULAR]
- Personal Brand Website: ₹25,000 (3 weeks) - For coaches & consultants
- E-Commerce Store: ₹50,000 (4-6 weeks) - Full online store with payment gateway
- SaaS Product: ₹75,000+ (6-10 weeks) - Complete SaaS platforms
- Web Application: ₹60,000+ (5-8 weeks) - Custom web apps
- Custom Development: ₹500-1000/hour - Hourly-based projects

CONVERSATION GUIDELINES:
- Be warm, professional, and helpful about ALL business-related questions
- **Enthusiastically answer questions about services, pricing, timelines, and projects**
- If asked about services/pricing/costs, provide clear information and mention you can show service cards
- If asked about Sudharsan's PERSONAL life (age, family, home address), politely redirect: "I focus on professional expertise. Let's discuss his services!"
- Keep responses concise (2-4 sentences max)
- Use **bold** for key points like pricing and timelines
- When discussing services, use phrases like "I can show you the service details" or "Would you like to see the service options?"

EXPERTISE: React, Next.js, Node.js, TypeScript, SaaS, E-commerce, Razorpay integration, AI/ML integration, Modern UI/UX

Remember: Business questions about services, pricing, and projects are ALWAYS welcome and should be answered helpfully!`;

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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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

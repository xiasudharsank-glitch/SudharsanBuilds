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

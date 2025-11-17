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

    const systemPrompt = `You are Sudharsan's Elite AI Assistant - a world-class web development expert and strategic business advisor. You represent Sudharsan's premium service on his portfolio website.

Your core identity:
- Elite, sophisticated, and deeply knowledgeable consultant
- Expert in cutting-edge web development and digital innovation
- Strategic thinker who understands business goals
- Passionate about delivering exceptional results
- Professional yet approachable and naturally encouraging
- Precise, insightful, and action-oriented

Sudharsan's Elite Expertise:
- Premium SaaS Product Development
- High-Conversion E-commerce Platforms
- Enterprise Web Applications
- Advanced UI/UX Design & Experience
- AI-Powered Solutions & Integration
- No-Code & Low-Code Development
- Full-Stack Modern Web Technologies (React, Node.js, TypeScript, etc.)
- Scalable Architecture & Performance Optimization
- Workflow Automation & Business Process Enhancement

Your communication style:
- Natural, conversational, and genuinely warm
- Use sophisticated yet accessible language
- Demonstrate deep expertise through practical insights
- Show authentic enthusiasm and genuine interest
- Be inspiring - help users see the real potential
- Provide immediately actionable advice
- Sound like a trusted expert, not a salesperson
- Use natural formatting for clarity (when helpful use **bold** for emphasis, bullet points for lists, etc.)

When responding:
1. Start with genuine insight or perspective
2. Demonstrate expertise through specific, relevant examples
3. Show confidence while remaining humble
4. Be warm and engaging - sound like a real person
5. End with a clear path forward or actionable suggestion
6. Use conversational, natural language (as if talking to a trusted colleague)
7. Format for readability: use **bold** for key points, lists when appropriate, clear paragraphs
8. Keep responses concise yet comprehensive (usually 3-6 sentences or 2-3 paragraphs)

Your mission:
- Genuinely help visitors solve their problems
- Build trust through authentic expertise
- Make users excited about the possibilities
- Demonstrate real value through every interaction
- Help users envision their success with concrete examples

Tone: Authentic, expert, warm, encouraging, clear, and genuinely helpful. Sound like a trusted colleague who's excited to help, not a generic AI.

Important: When you mention features, technologies, or solutions, briefly explain WHY they matter, not just WHAT they are. This shows deeper expertise and provides real value to the user.`;

    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const apiKey = Deno.env.get("MISTRAL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Mistral API Error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to get response from AI service" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

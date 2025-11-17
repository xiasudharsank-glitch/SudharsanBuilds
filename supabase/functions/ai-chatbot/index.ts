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
- Professional yet approachable and encouraging
- Precise, insightful, and action-oriented

Sudharsan's Elite Expertise:
- Premium SaaS Product Development
- High-Conversion E-commerce Platforms
- Enterprise Web Applications
- Advanced UI/UX Design & Experience
- AI-Powered Solutions & Integration
- No-Code & Low-Code Development
- Full-Stack Modern Web Technologies
- Scalable Architecture & Performance Optimization
- Workflow Automation & Business Process Enhancement

Your communication style:
- Premium, confident, and polished
- Use sophisticated but accessible language
- Demonstrate deep expertise in every response
- Show enthusiasm and genuine interest in helping
- Be inspiring and motivating about possibilities
- Provide immediate value and actionable insights

When responding:
1. Start strong - capture attention immediately
2. Demonstrate expertise through specific, relevant insights
3. Show confidence in the value you can deliver
4. Be inspiring - help users see the potential
5. Always end with forward momentum
6. Use conversational, natural language
7. NO markdown symbols - format for elegant simplicity
8. Keep responses flowing and engaging (3-5 sentences typically)

Your mission:
- Immediately impress visitors with your knowledge
- Build confidence that Sudharsan can exceed expectations
- Make users enthusiastic about working together
- Demonstrate premium quality in every interaction
- Help users envision their success

Tone: Sophisticated, inspiring, confident, professional, warm, enthusiastic`;

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
        model: "mistral-small-latest",
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

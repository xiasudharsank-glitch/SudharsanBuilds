import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  context?: string; // Page context (HomePage, ServicesPage, etc.)
  pageSummary?: string; // ✅ Phase 1: Actual page content summary
  userId?: string; // ✅ Phase 2: User ID for persistent memory
  enableStreaming?: boolean; // ✅ Phase 2: Enable streaming
}

// ✅ Phase 2: Function declarations for Gemini Function Calling
const functionDeclarations = [
  {
    name: "scrollToSection",
    description: "Scrolls the page to a specific section. Use this when the user wants to navigate to services, projects, contact, or about sections.",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "The section ID to scroll to",
          enum: ["services", "projects", "about", "contact", "testimonials", "faq", "home"]
        }
      },
      required: ["section"]
    }
  },
  {
    name: "openContactForm",
    description: "Opens the contact form modal. Use this when user wants to get in touch, start a project, or request a quote.",
    parameters: {
      type: "object",
      properties: {
        prefillMessage: {
          type: "string",
          description: "Optional message to prefill in the contact form"
        }
      }
    }
  },
  {
    name: "showServiceDetails",
    description: "Shows detailed information about a specific service. Use when user asks about a particular service type.",
    parameters: {
      type: "object",
      properties: {
        serviceName: {
          type: "string",
          description: "The name of the service",
          enum: ["Landing Page", "Portfolio Website", "Business Website", "Personal Brand Website", "E-Commerce Store", "SaaS Product", "Web Application", "Custom Development"]
        }
      },
      required: ["serviceName"]
    }
  }
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      message,
      conversationHistory = [],
      context = "UnknownPage",
      pageSummary = "",
      userId = "anonymous",
      enableStreaming = false
    }: RequestBody = await req.json();

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

FUNCTION CALLING CAPABILITIES:
You can now execute actions directly:
- scrollToSection: Navigate user to services, projects, contact, etc.
- openContactForm: Open contact form with optional prefilled message
- showServiceDetails: Display detailed information about a specific service

Use these functions when appropriate to provide an interactive experience.

CONVERSATION GUIDELINES:
- Be warm, professional, and helpful about ALL business-related questions
- **Enthusiastically answer questions about services, pricing, timelines, and projects**
- If user wants to see something specific, USE FUNCTIONS to navigate them there
- If asked about services/pricing/costs, provide clear information and consider using showServiceDetails
- If user wants to contact or get started, USE openContactForm function
- If asked about Sudharsan's PERSONAL life (age, family, home address), politely redirect: "I focus on professional expertise. Let's discuss his services!"
- Keep responses concise (2-4 sentences max)
- Use **bold** for key points like pricing and timelines

CURRENT CONTEXT:
- Page: ${context}
- Page Summary: ${pageSummary || "Not available"}
- User: ${userId !== "anonymous" ? "Returning visitor" : "New visitor"}

EXPERTISE: React, Next.js, Node.js, TypeScript, SaaS, E-commerce, Razorpay integration, AI/ML integration, Modern UI/UX

Remember: Business questions about services, pricing, and projects are ALWAYS welcome and should be answered helpfully!`;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert conversation history to Gemini format
    const geminiContents = [];

    // Add system prompt as first exchange
    geminiContents.push(
      { role: "user", parts: [{ text: "System context: " + systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'll follow these guidelines and use functions when appropriate." }] }
    );

    // Add conversation history (limit to last 6 messages for better context)
    const recentHistory = conversationHistory.slice(-6);
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

    // ✅ Phase 2: Support both streaming and non-streaming
    if (enableStreaming) {
      // Streaming response
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: geminiContents,
            tools: [{ functionDeclarations }], // ✅ Phase 2: Enable function calling
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 400,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini Streaming API Error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to initialize streaming" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return SSE stream
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Non-streaming response (default)
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
            tools: [{ functionDeclarations }], // ✅ Phase 2: Enable function calling
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 400,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error - Status:", response.status);
        console.error("Gemini API Error - Response:", errorText);

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

      // ✅ Phase 2: Check for function calls
      const functionCall = candidate?.content?.parts?.find((part: any) => part.functionCall);

      if (functionCall) {
        // AI wants to call a function
        return new Response(
          JSON.stringify({
            success: true,
            functionCall: {
              name: functionCall.functionCall.name,
              args: functionCall.functionCall.args
            },
            message: candidate?.content?.parts?.find((part: any) => part.text)?.text || "",
            role: "assistant",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for safety filters or blocked content
      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        console.error("Gemini blocked content:", candidate.finishReason, candidate.safetyRatings);

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
    }
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

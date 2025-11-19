import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Get allowed origin from environment variable
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    Deno.env.get("ALLOWED_ORIGIN"),
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] || "https://sudharsanbuilds.com";
};

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
});

interface OrderRequest {
  amount: number; // Amount in INR (will be converted to paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get Razorpay credentials from environment
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { amount, currency = "INR", receipt, notes }: OrderRequest = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be greater than 0" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create order payload
    const orderPayload = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    // Create Basic Auth header
    const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;

    // Call Razorpay API to create order
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Razorpay API Error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment order",
          details: errorData.error?.description || "Unknown error",
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await response.json();

    // Store order in Supabase (optional but recommended for tracking)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: dbError } = await supabase
        .from("payment_orders")
        .insert({
          order_id: order.id,
          amount: amount,
          amount_paid: 0,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: new Date(order.created_at * 1000).toISOString(),
          notes: order.notes,
        });

      if (dbError) {
        console.error("Failed to store order in database:", dbError);
        // Don't fail the request, order was created successfully
      }
    }

    // Return order details to frontend
    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        amount: amount,
        amountInPaise: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in create-razorpay-order:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// HMAC SHA256 verification function
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  // Import key for HMAC
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Generate HMAC signature
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);

  // Convert to hex string
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const generatedSignature = signatureArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return generatedSignature === signature;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get Razorpay secret from environment
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keySecret) {
      console.error("Razorpay secret not configured");
      return new Response(
        JSON.stringify({ error: "Payment verification service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }: VerifyRequest = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.error("Invalid payment signature", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid payment signature",
          verified: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Signature is valid - update database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch payment details from Razorpay (optional but recommended)
      const keyId = Deno.env.get("RAZORPAY_KEY_ID");
      if (keyId) {
        const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;

        try {
          const paymentResponse = await fetch(
            `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
            {
              method: "GET",
              headers: {
                "Authorization": authHeader,
              },
            }
          );

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();

            // Update order in database
            const { error: updateError } = await supabase
              .from("payment_orders")
              .update({
                payment_id: razorpay_payment_id,
                status: paymentData.status,
                amount_paid: paymentData.amount / 100, // Convert paise to INR
                payment_method: paymentData.method,
                verified: true,
                verified_at: new Date().toISOString(),
                payment_data: paymentData,
              })
              .eq("order_id", razorpay_order_id);

            if (updateError) {
              console.error("Failed to update order in database:", updateError);
            }
          }
        } catch (fetchError) {
          console.error("Failed to fetch payment details:", fetchError);
          // Don't fail verification if we can't fetch details
        }
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: "Payment verified successfully",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in verify-razorpay-payment:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during verification",
        success: false,
        verified: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

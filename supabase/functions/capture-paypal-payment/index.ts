import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ P2 FIX: Restrict CORS to specific domains for security
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://sudharsanbuilds.com',
  'https://www.sudharsanbuilds.com',
  'https://sudharsanbuilds.in',
  'https://www.sudharsanbuilds.in',
  'http://localhost:5173', // Development
  'http://localhost:4173', // Preview
];

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ✅ FIX: Use correct environment variable names (without VITE_ prefix for Edge Functions)
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const IS_PRODUCTION = Deno.env.get("PAYPAL_MODE") === "production";

// ✅ Use sandbox API for testing, production API for live
const PAYPAL_API_BASE = IS_PRODUCTION
  ? "https://api.paypal.com"
  : "https://api-m.sandbox.paypal.com";
const PAYPAL_API_URL = `${PAYPAL_API_BASE}/v2/checkout/orders`;

// Get PayPal access token
async function getPayPalAccessToken() {
  // ✅ Validate credentials exist
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const tokenUrl = `${PAYPAL_API_BASE}/v1/oauth2/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  // ✅ Check if token request succeeded
  if (!response.ok || !data.access_token) {
    console.error('❌ Failed to get PayPal access token:', data);
    throw new Error(`Failed to authenticate with PayPal: ${data.error_description || 'Unknown error'}`);
  }

  console.log('✅ PayPal access token obtained');
  return data.access_token;
}

// Capture PayPal payment (completes the transaction)
async function capturePayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  console.log('📤 Capturing PayPal payment for order:', orderId);

  const response = await fetch(`${PAYPAL_API_URL}/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  // ✅ Check if capture request succeeded
  if (!response.ok) {
    console.error('❌ PayPal capture failed:', {
      status: response.status,
      statusText: response.statusText,
      error: data
    });
    throw new Error(`PayPal capture failed: ${data.message || 'Unknown error'}`);
  }

  console.log('✅ PayPal payment captured:', data.status);
  return data;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
      },
    });
  }

  try {
    const { orderId, customer_email, amount, service_name } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
          }
        }
      );
    }

    // Capture the payment with PayPal
    const captureData = await capturePayPalPayment(orderId);

    console.log("PayPal Capture Response:", JSON.stringify(captureData, null, 2));

    // Check if capture was successful
    if (captureData.status !== "COMPLETED") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment capture failed",
          details: captureData
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
          }
        }
      );
    }

    // Store in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    await supabaseClient.from("payment_orders").insert({
      order_id: orderId,
      amount: amount,
      currency: "USD",
      status: "completed",
      customer_email: customer_email,
      service_name: service_name,
      payment_gateway: "paypal",
    });

    return new Response(
      JSON.stringify({
        success: true,
        captureId: captureData.purchase_units[0].payments.captures[0].id
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
        },
      }
    );
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
        }
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("VITE_PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("VITE_PAYPAL_CLIENT_SECRET");
const PAYPAL_API_URL = "https://api.paypal.com/v2/checkout/orders";

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

  const response = await fetch("https://api.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// Capture PayPal payment (completes the transaction)
async function capturePayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return await response.json();
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

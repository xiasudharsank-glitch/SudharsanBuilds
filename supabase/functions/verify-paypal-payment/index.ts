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

// Verify PayPal payment
async function verifyPayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/${orderId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

serve(async (req: Request) => {
    // ✅ ADD THIS BLOCK - Handle CORS preflight
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
    const { order_id, customer_email, amount, service_name } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "Missing order_id" }),
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

    // Verify payment with PayPal
    const paymentData = await verifyPayPalPayment(order_id);

    if (paymentData.status !== "APPROVED" && paymentData.status !== "COMPLETED") {
      return new Response(
        JSON.stringify({ error: "Payment not approved" }),
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
      order_id: order_id,
      amount: amount,
      currency: "USD",
      status: "completed",
      customer_email: customer_email,
      service_name: service_name,
      payment_gateway: "paypal",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  // ✅ ADD THIS
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
  },
});
  } catch (error) {
    console.error("PayPal Verification Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
      }
    });
  }
});
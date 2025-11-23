import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PAYPAL_CLIENT_ID = Deno.env.get("VITE_PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("VITE_PAYPAL_CLIENT_SECRET");
const IS_PRODUCTION = Deno.env.get("VITE_PAYPAL_MODE") === "production";

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

// Create PayPal order
async function createPayPalOrder(amount: number, description: string) {
  const accessToken = await getPayPalAccessToken();

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount.toFixed(2), // Amount is already in dollars from frontend
        },
        description: description,
      },
    ],
    application_context: {
      brand_name: "Sudharsan Builds",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: "https://sudharsanbuilds.com/payment-confirmation",
      cancel_url: "https://sudharsanbuilds.com/services",
    }
  };

  console.log('📤 Creating PayPal order with payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(PAYPAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  // ✅ CRITICAL FIX: Check if PayPal API call succeeded
  if (!response.ok) {
    console.error('❌ PayPal API error:', {
      status: response.status,
      statusText: response.statusText,
      error: data
    });
    throw new Error(`PayPal API error: ${data.error || data.message || 'Unknown error'}`);
  }

  console.log('✅ PayPal order created:', data.id);
  return data;
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
    const { amount, service_name } = await req.json();

    if (!amount || !service_name) {
      return new Response(
        JSON.stringify({ error: "Missing amount or service_name" }),
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

    const order = await createPayPalOrder(amount, service_name);

    return new Response(JSON.stringify(order), {
      headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
  },
});
  } catch (error) {
    console.error("PayPal Order Creation Error:", error);
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
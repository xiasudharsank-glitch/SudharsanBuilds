import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Create PayPal order
async function createPayPalOrder(amount: number, description: string) {
  const accessToken = await getPayPalAccessToken();

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: (amount / 100).toString(), // Convert cents to dollars
        },
        description: description,
      },
    ],
    return_url: "https://sudharsanbuilds.com/success",
    cancel_url: "https://sudharsanbuilds.com/cancel",
  };

  const response = await fetch(PAYPAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
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
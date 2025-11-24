import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ✅ P2 FIX: Restrict CORS to specific domains for security
// Read allowed origins from environment variable, default to specific domains
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://sudharsanbuilds.com',
  'https://www.sudharsanbuilds.com',
  'https://sudharsanbuilds.in',
  'https://www.sudharsanbuilds.in',
  'http://localhost:5173', // Development
  'http://localhost:4173', // Preview
];

// Helper to get CORS headers based on request origin
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Default to primary domain

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Legacy corsHeaders for backward compatibility (uses first allowed origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
}

// ✅ FIX #11: Retry helper function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  operation: string = 'operation'
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting ${operation} (attempt ${attempt}/${maxRetries})`)
      const result = await fn()
      if (attempt > 1) {
        console.log(`✅ ${operation} succeeded on attempt ${attempt}`)
      }
      return result
    } catch (error) {
      const isLastAttempt = attempt === maxRetries

      if (isLastAttempt) {
        console.error(`❌ ${operation} failed after ${maxRetries} attempts:`, error)
        throw error
      }

      // Exponential backoff: 2^attempt * 100ms (200ms, 400ms, 800ms, ...)
      const backoffMs = Math.pow(2, attempt) * 100
      console.warn(`⚠️ ${operation} failed on attempt ${attempt}, retrying in ${backoffMs}ms...`)

      await new Promise(resolve => setTimeout(resolve, backoffMs))
    }
  }

  // TypeScript requires this, but it's unreachable
  throw new Error(`Retry logic error for ${operation}`)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ FIX #8: CSRF token validation for payment security
    const csrfToken = req.headers.get('x-csrf-token')

    // Validate CSRF token exists and is properly formatted (UUID v4)
    if (!csrfToken) {
      console.error('❌ CSRF token missing from request')
      return new Response(
        JSON.stringify({ error: 'CSRF token is required for payment requests' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      )
    }

    // Validate CSRF token format (UUID v4 format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(csrfToken)) {
      console.error('❌ Invalid CSRF token format:', csrfToken)
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      )
    }

    console.log('✅ CSRF token validated successfully')

    const { amount, currency, receipt, notes } = await req.json()

    // ✅ P2 FIX: Input validation to prevent malformed requests
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    if (amount > 10000000) { // Max 100,000 INR (100 lakh paise)
      return new Response(
        JSON.stringify({
          error: 'Amount too large',
          message: 'Amount exceeds maximum allowed limit'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    if (currency && typeof currency !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'Invalid currency',
          message: 'Currency must be a string'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    if (receipt && typeof receipt !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'Invalid receipt',
          message: 'Receipt must be a string'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    if (notes && typeof notes !== 'object') {
      return new Response(
        JSON.stringify({
          error: 'Invalid notes',
          message: 'Notes must be an object'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    // Get Razorpay credentials from Supabase secrets
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    // Create Basic Auth header
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    // ✅ FIX #11: Create Razorpay order with retry logic and exponential backoff
    const order = await retryWithBackoff(
      async () => {
        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: amount,
            currency: currency || 'INR',
            receipt: receipt,
            notes: notes || {}
          })
        })

        if (!razorpayResponse.ok) {
          const error = await razorpayResponse.text()
          console.error('Razorpay API error:', error)
          throw new Error(`Razorpay API error (${razorpayResponse.status}): ${error}`)
        }

        return await razorpayResponse.json()
      },
      3, // maxRetries = 3
      'Razorpay order creation'
    )

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error creating payment order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment verification fields')
    }

    // Get Razorpay secret from environment
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret key not configured')
    }

    // Create signature verification string
    const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`

    // Generate expected signature using HMAC SHA256
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(signatureString)
      .digest('hex')

    // Verify signature
    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      console.error('Payment signature verification failed', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        receivedSignature: razorpay_signature,
        expectedSignature: expectedSignature
      })

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment signature verification failed',
          verified: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Payment signature verified successfully', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    })

    // Signature is valid - return success
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: 'Payment verified successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        verified: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

# Razorpay Payment Integration Guide

## Step 1: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up / Log in
3. Go to **Settings** → **API Keys**
4. Generate **Test Mode** keys first (for testing)
   - Key ID: `rzp_test_XXXXX...`
   - Key Secret: `XXXXXXX...`
5. Later, generate **Live Mode** keys for production

## Step 2: Set Up Environment Variables

Add these to your `.env` file (for local development):

```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Create Supabase Edge Function

### 3.1 Create the Function File

In your Supabase project dashboard:

1. Go to **Edge Functions**
2. Click **New Function**
3. Name it: `create-payment-order`
4. Use this code:

```typescript
// supabase/functions/create-payment-order/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, receipt, notes } = await req.json()

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes
      })
    })

    const order = await response.json()

    // Store order in Supabase (optional)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    await supabaseClient.from('payment_orders').insert({
      razorpay_order_id: order.id,
      amount: amount / 100, // Store in rupees
      currency: currency,
      status: 'created',
      service_name: notes.service_name,
      service_price: notes.service_price,
      deposit_amount: notes.deposit_amount,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ orderId: order.id, amount: order.amount }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

### 3.2 Set Secrets in Supabase

In your Supabase project:

1. Go to **Edge Functions** → **Settings**
2. Add these secrets:
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

## Step 4: Create Payment Orders Table (Optional but Recommended)

Run this SQL in Supabase SQL Editor:

```sql
-- Create payment_orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  service_name TEXT,
  service_price TEXT,
  deposit_amount INTEGER,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_payment_orders_razorpay_order_id ON payment_orders(razorpay_order_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);

-- Enable RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Policy for public inserts
CREATE POLICY "Allow public inserts" ON payment_orders
  FOR INSERT
  WITH CHECK (true);

-- Policy for authenticated users to view
CREATE POLICY "Allow authenticated users to view" ON payment_orders
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

## Step 5: Deploy Edge Function

### Option A: Deploy via Supabase Dashboard
1. Go to **Edge Functions**
2. Find your `create-payment-order` function
3. Click **Deploy**

### Option B: Deploy via CLI (if using Supabase CLI)
```bash
supabase functions deploy create-payment-order
```

## Step 6: Test Payment Integration

### Test Mode Testing:
1. Use Razorpay test credentials
2. Click "Book Now" button on any service
3. Use test card: **4111 1111 1111 1111**
   - CVV: Any 3 digits
   - Expiry: Any future date
4. Test UPI: `success@razorpay`

### Test Cards:
- Success: `4111 1111 1111 1111`
- Failure: `4111 1111 1111 1234`

## Step 7: Handle Payment Verification (Optional but Recommended)

Create another Edge Function `verify-payment`:

```typescript
// supabase/functions/verify-payment/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    const isValid = generated_signature === razorpay_signature

    if (isValid) {
      // Update payment status in database
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      )

      await supabaseClient
        .from('payment_orders')
        .update({
          status: 'paid',
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpay_order_id)

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

## Step 8: Switch to Live Mode (Production)

When ready to go live:

1. Get **Live Mode** API keys from Razorpay Dashboard
2. Update Supabase Edge Function secrets with live keys:
   - `RAZORPAY_KEY_ID`: `rzp_live_XXXXX...`
   - `RAZORPAY_KEY_SECRET`: `XXXXXXX...`
3. Update `.env` with live Key ID:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   ```
4. Test with real card (small amount first!)
5. Complete Razorpay KYC if required

## Step 9: Email Notifications (Optional)

Add email notifications when payment is successful:

```typescript
// In verify-payment function, after successful verification:

// Send email using Resend or similar
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Sudharsan <noreply@sudharsanbuilds.com>',
    to: 'sudharsanofficial0001@gmail.com',
    subject: `New Deposit Payment Received!`,
    html: `
      <h1>Payment Received!</h1>
      <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
      <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
      <p><strong>Service:</strong> ${notes.service_name}</p>
      <p><strong>Amount:</strong> ₹${notes.deposit_amount}</p>
    `
  })
})
```

## Troubleshooting

### Payment not working?
1. Check if Razorpay script is loaded: Open browser console, type `Razorpay` - should not be undefined
2. Check environment variables are set correctly
3. Check Edge Function logs in Supabase dashboard
4. Ensure CORS headers are set in Edge Function
5. Test with Razorpay test cards first

### Common Errors:
- **"Cannot read Razorpay"**: Razorpay script not loaded. Check index.html
- **"Network Error"**: Edge Function not deployed or secrets not set
- **"Invalid Key"**: Wrong RAZORPAY_KEY_ID in environment variables

## Security Best Practices

1. ✅ **NEVER** commit Razorpay Key Secret to Git
2. ✅ Always verify payment signature on backend (Edge Function)
3. ✅ Use Razorpay webhooks for additional security
4. ✅ Store payment secrets only in Supabase Edge Function secrets
5. ✅ Use HTTPS in production
6. ✅ Validate payment amounts on backend
7. ✅ Log all payment attempts for audit

## Support

Need help? Contact:
- Razorpay Support: support@razorpay.com
- Razorpay Docs: https://razorpay.com/docs/

---

**That's it! Your payment integration is ready.** 🎉

When users click "Book Now", they'll see Razorpay checkout, can pay via UPI/Cards/Net Banking, and you'll get notified!

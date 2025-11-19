# Razorpay Payment Integration Setup Guide

This guide will help you set up Razorpay payment integration for your portfolio website.

## 🔒 Secret Management Best Practices

### What Goes Where?

| Secret Type | Location | Visibility | Usage |
|------------|----------|------------|-------|
| **VITE_RAZORPAY_KEY_ID** | `.env` (Frontend) | 🌐 Public | Initialize Razorpay checkout UI |
| **RAZORPAY_KEY_SECRET** | Supabase Dashboard | 🔒 Private | Verify payments server-side |

### ✅ Correct Setup

```bash
# .env file (Frontend - Safe to expose)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Supabase Edge Function Secrets (Server-side - NEVER expose!)
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxx (optional, for fetching payment details)
```

### ❌ NEVER Do This

```bash
# DON'T put secret key in .env file!
VITE_RAZORPAY_KEY_SECRET=your_secret_key  # ❌ EXPOSED TO BROWSER!
```

---

## 📋 Prerequisites

1. **Razorpay Account**: [Sign up at Razorpay](https://razorpay.com/)
2. **Razorpay API Keys**: Get from Dashboard → Settings → API Keys
3. **Supabase Project**: Active Supabase project with Edge Functions enabled
4. **Domain**: For production CORS configuration

---

## 🚀 Step-by-Step Setup

### Step 1: Get Razorpay Credentials

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings → API Keys**
3. Generate API keys:
   - **Test Mode**: For development (prefix: `rzp_test_`)
   - **Live Mode**: For production (prefix: `rzp_live_`)
4. Copy:
   - **Key ID** (Public) - `rzp_test_xxxxx`
   - **Key Secret** (Private) - Keep it secure!

---

### Step 2: Configure Frontend (.env file)

Create a `.env` file in the project root (if it doesn't exist):

```bash
# Copy from .env.example
cp .env.example .env
```

Add your **PUBLIC** Razorpay Key ID:

```bash
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx  # Replace with your Key ID

# Supabase Configuration (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Formspree (for contact form)
VITE_FORMSPREE_ID=your-formspree-id
```

**⚠️ Important**: NEVER add `RAZORPAY_KEY_SECRET` to this file!

---

### Step 3: Configure Supabase Edge Function Secrets

Set secrets in Supabase Dashboard (server-side only):

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Edge Functions → Secrets**
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `RAZORPAY_KEY_SECRET` | `your_secret_key` | Private key for payment verification |
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxx` | Public key (for fetching payment details) |
| `ALLOWED_ORIGIN` | `https://yourdomain.com` | Your production domain for CORS |
| `GEMINI_API_KEY` | `your_gemini_key` | Already configured for AI chatbot |

#### Option B: Via Supabase CLI

```bash
# Set Razorpay secret
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key_here

# Set Razorpay key ID (optional but recommended)
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxx

# Set allowed origin for CORS
supabase secrets set ALLOWED_ORIGIN=https://yourdomain.com
```

---

### Step 4: Run Database Migration

Run the migration to create the `payment_orders` table:

#### Option A: Via Supabase Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `/supabase/migrations/20250119_create_payment_orders.sql`
3. Copy and paste the SQL
4. Run the query

#### Option B: Via Supabase CLI

```bash
# Apply migration
supabase db push
```

---

### Step 5: Deploy Edge Functions

Deploy the payment edge functions to Supabase:

```bash
# Deploy create-razorpay-order function
supabase functions deploy create-razorpay-order

# Deploy verify-razorpay-payment function
supabase functions deploy verify-razorpay-payment

# Verify deployment
supabase functions list
```

Expected output:
```
create-razorpay-order    deployed
verify-razorpay-payment  deployed
ai-chatbot               deployed
```

---

### Step 6: Test Payment Integration

#### Test in Development

```bash
# Start dev server
npm run dev
```

Use the `PaymentButton` component:

```tsx
import PaymentButton from './components/PaymentButton';

function YourComponent() {
  return (
    <PaymentButton
      amount={500}  // ₹500
      description="Premium Portfolio Package"
      onSuccess={(data) => {
        console.log('Payment successful!', data);
        alert('Payment successful!');
      }}
      onFailure={(error) => {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
      }}
      buttonText="Pay ₹500"
      notes={{
        service: "Portfolio Design",
        customer: "User Name"
      }}
    />
  );
}
```

#### Test with Razorpay Test Cards

Use these test card details (Test Mode only):

| Card Number | CVV | Expiry | Outcome |
|-------------|-----|--------|---------|
| 4111 1111 1111 1111 | Any | Future | ✅ Success |
| 4000 0000 0000 0002 | Any | Future | ❌ Failure |

---

## 🎨 Usage Examples

### Basic Payment Button

```tsx
<PaymentButton
  amount={999}
  description="Web Development Service"
  buttonText="Hire Me - ₹999"
/>
```

### Payment with Custom Handling

```tsx
<PaymentButton
  amount={1500}
  description="E-commerce Website"
  onSuccess={async (paymentData) => {
    // Store in your database
    await fetch('/api/save-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });

    // Redirect to success page
    window.location.href = '/success';
  }}
  onFailure={(error) => {
    console.error('Payment failed:', error);
    // Show error toast
  }}
  notes={{
    package: "E-commerce Pro",
    features: "Full stack + Payment integration"
  }}
  className="custom-payment-btn"
/>
```

---

## 🔍 How It Works

### Payment Flow

```mermaid
sequenceDiagram
    User->>Frontend: Click "Pay Now"
    Frontend->>Create Order API: POST /create-razorpay-order
    Create Order API->>Razorpay: Create Order
    Razorpay-->>Create Order API: Order ID
    Create Order API-->>Frontend: Order Details
    Frontend->>Razorpay Checkout: Open Payment Modal
    User->>Razorpay: Enter Card Details
    Razorpay-->>Frontend: Payment Success + Signature
    Frontend->>Verify API: POST /verify-razorpay-payment
    Verify API->>Verify API: Verify HMAC Signature
    Verify API->>Database: Update Order Status
    Verify API-->>Frontend: Verification Success
    Frontend->>User: Show Success Message
```

### Security Features

1. **Signature Verification**: Server-side HMAC SHA256 verification prevents tampering
2. **CORS Protection**: Only allowed domains can call edge functions
3. **Rate Limiting**: AI chatbot has rate limiting (extend to payment if needed)
4. **Row Level Security**: Database policies protect payment data
5. **Server-side Secrets**: Private keys never exposed to frontend

---

## 🛡️ Security Checklist

- [ ] ✅ Razorpay Key Secret is ONLY in Supabase Edge Function secrets
- [ ] ✅ Key ID in `.env` file (public key - safe to expose)
- [ ] ✅ `.env` file is in `.gitignore` (never committed to Git)
- [ ] ✅ CORS configured to allow only your domain
- [ ] ✅ Database has Row Level Security (RLS) enabled
- [ ] ✅ Edge functions verify payment signatures server-side
- [ ] ✅ Using test mode keys in development
- [ ] ✅ Using live mode keys in production (after testing)

---

## 🚨 Troubleshooting

### Issue: "Payment service not configured"

**Cause**: Razorpay secrets not set in Supabase

**Solution**:
```bash
supabase secrets set RAZORPAY_KEY_ID=your_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_secret
```

### Issue: "CORS error when calling edge function"

**Cause**: Domain not allowed in CORS headers

**Solution**:
```bash
# Set your production domain
supabase secrets set ALLOWED_ORIGIN=https://yourdomain.com

# For local development, localhost is already allowed
```

### Issue: "Payment verification failed"

**Cause**: Signature mismatch (wrong secret key)

**Solution**:
1. Verify you're using the correct secret key
2. Check if test/live mode keys match
3. Ensure no extra spaces in secret key

### Issue: "Database error when storing order"

**Cause**: Migration not applied

**Solution**:
```bash
# Apply migration
supabase db push

# Or run SQL manually in Supabase Dashboard
```

---

## 📊 Monitoring & Analytics

### View Payment Orders

Query the database:

```sql
-- Recent payments
SELECT
  order_id,
  amount,
  status,
  verified,
  created_at
FROM payment_orders
ORDER BY created_at DESC
LIMIT 10;

-- Payment statistics
SELECT
  status,
  COUNT(*) as count,
  SUM(amount_paid) as total_revenue
FROM payment_orders
GROUP BY status;
```

### Check Edge Function Logs

```bash
# View logs for create-order function
supabase functions logs create-razorpay-order

# View logs for verify-payment function
supabase functions logs verify-razorpay-payment
```

---

## 🎯 Next Steps

1. **Test thoroughly** in test mode
2. **Switch to live keys** when ready for production
3. **Set up webhooks** in Razorpay Dashboard for better reliability
4. **Add email notifications** for successful payments
5. **Implement refund handling** (create new edge function)
6. **Add payment analytics** dashboard

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Payment Gateway API](https://razorpay.com/docs/api/payments/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [HMAC Signature Verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/verify-payment-signature/)

---

## 💡 Tips

1. **Always verify payments server-side** - Never trust client-side data
2. **Use webhooks** for better reliability (payments can succeed but frontend may not receive response)
3. **Store order details** before opening checkout (user may close browser)
4. **Handle edge cases** (network errors, user cancellation, etc.)
5. **Test with different amounts** (some edge cases only appear with specific amounts)

---

## 🤝 Support

If you encounter any issues:

1. Check Supabase Edge Function logs
2. Verify all environment variables are set correctly
3. Ensure database migration was applied
4. Test with Razorpay test cards first
5. Contact Razorpay support for payment-specific issues

---

**Happy Coding! 🚀**

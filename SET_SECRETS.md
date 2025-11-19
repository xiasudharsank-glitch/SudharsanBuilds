# How to Set Razorpay Secrets in Supabase

## Option 1: Via Dashboard (RECOMMENDED - EASIEST)

1. Go to: https://supabase.com/dashboard/project/hfkpmagsynsixsocnxnr/settings/functions
2. Click **"Edge Functions"** → **"Manage secrets"**
3. Add these secrets:
   - `RAZORPAY_KEY_ID` = `rzp_live_RhJTd6b1tNAs2i`
   - `RAZORPAY_KEY_SECRET` = `your_razorpay_secret_from_dashboard`
4. Save

## Option 2: Via Supabase CLI

### Step 1: Install Supabase CLI

```bash
# For macOS/Linux
brew install supabase/tap/supabase

# OR using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

### Step 3: Link Your Project

```bash
npx supabase link --project-ref hfkpmagsynsixsocnxnr
```

### Step 4: Set Secrets

```bash
# Set Razorpay Key ID
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_RhJTd6b1tNAs2i

# Set Razorpay Key Secret (replace with your actual secret)
npx supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

### Step 5: Verify Secrets Are Set

```bash
npx supabase secrets list
```

You should see both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` listed.

---

## After Setting Secrets

1. Wait 10-20 seconds for the Edge Function to reload
2. Refresh your website
3. Click "Book Now" button again
4. Payment should now work! 🎉

---

## Troubleshooting

If it still doesn't work:

1. Check Edge Function logs: https://supabase.com/dashboard/project/hfkpmagsynsixsocnxnr/functions/create-payment-order/logs
2. Make sure both secrets are set (check dashboard or run `npx supabase secrets list`)
3. Verify your Razorpay secret is correct (copy it from Razorpay dashboard)

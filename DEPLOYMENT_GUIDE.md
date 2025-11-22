# 🌍 Global Deployment Guide - SudharsanBuilds

This guide explains how to deploy SudharsanBuilds for both **India** (sudharsanbuilds.in) and **Global** (sudharsanbuilds.com) markets.

---

## 📋 Overview

The website now supports **two regional versions**:

| Region | Domain | Currency | Payment Gateway | Pricing Example |
|--------|--------|----------|----------------|-----------------|
| 🇮🇳 **India** | sudharsanbuilds.in | INR (₹) | Razorpay | Landing Page: ₹15,000 |
| 🌐 **Global** | sudharsanbuilds.com | USD ($) | PayPal | Landing Page: $300 |

Both versions share:
- ✅ **Same codebase** (no code duplication)
- ✅ **Same Supabase database**
- ✅ **Same email system**
- ✅ **Automatic region detection**
- ✅ **Manual region switcher**

---

## 🚀 Quick Start Deployment

### Step 1: Prepare Environment Variables

Create **two sets** of environment variables for Vercel:

#### **India Build (.in domain)**
```env
VITE_REGION=india
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_INDIA_KEY
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_BOOKING=template_93arapj
VITE_EMAILJS_TEMPLATE_INVOICE=template_invoice
VITE_FORMSPREE_ID=your_formspree_id
VITE_YOUR_EMAIL=sudharsanofficial0001@gmail.com
VITE_WHATSAPP_NUMBER=919876543210
VITE_UPI_ID=sudharsan@upi
```

#### **Global Build (.com domain)**
```env
VITE_REGION=global
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_BOOKING=template_93arapj
VITE_EMAILJS_TEMPLATE_INVOICE=template_invoice
VITE_FORMSPREE_ID=your_formspree_id
VITE_YOUR_EMAIL=sudharsanofficial0001@gmail.com
VITE_WHATSAPP_NUMBER=919876543210
```

---

### Step 2: Deploy to Vercel (Two Projects)

#### **Option A: Using Vercel Dashboard (Recommended)**

1. **Create India Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - **Project Name**: `sudharsanbuilds-india`
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Vite
   - Add **India environment variables** (from Step 1)
   - Deploy!

2. **Create Global Project:**
   - Repeat the same process
   - **Project Name**: `sudharsanbuilds-global`
   - Add **Global environment variables** (from Step 1)
   - Deploy!

3. **Configure Custom Domains:**
   - **India Project** → Settings → Domains → Add `sudharsanbuilds.in` and `www.sudharsanbuilds.in`
   - **Global Project** → Settings → Domains → Add `sudharsanbuilds.com` and `www.sudharsanbuilds.com`

#### **Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy India version
vercel --prod --name sudharsanbuilds-india

# Deploy Global version
vercel --prod --name sudharsanbuilds-global
```

---

## 🔧 Payment Gateway Setup

### Razorpay (India) Setup

1. **Create Razorpay Account:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up / Log in
   - Activate your account (business verification required)

2. **Get API Keys:**
   - Go to Settings → API Keys
   - Generate Live Key Pair
   - Copy **Key ID** (starts with `rzp_live_`)
   - Add to India environment variables as `VITE_RAZORPAY_KEY_ID`

3. **Configure Supabase Edge Functions:**
   - Your existing Supabase functions already support Razorpay
   - No code changes needed!

### PayPal (Global) Setup

1. **Create PayPal Business Account:**
   - Go to [PayPal Developer](https://developer.paypal.com/)
   - Sign up for business account
   - Complete business verification

2. **Get API Credentials:**
   - Go to Dashboard → My Apps & Credentials
   - Create App (if not exists)
   - Copy **Client ID** (for live environment)
   - Add to Global environment variables as `VITE_PAYPAL_CLIENT_ID`

3. **Create Supabase Edge Function for PayPal:**
   - Create `supabase/functions/create-paypal-order/index.ts`
   - Similar to Razorpay function, but for PayPal API
   - PayPal SDK: `@paypal/checkout-server-sdk`

---

## 🎨 What Changes Automatically by Region

### India Version (sudharsanbuilds.in)
- ✅ All prices in **₹ (INR)**
- ✅ Payment via **Razorpay** (UPI, Cards, Net Banking)
- ✅ SEO: "Freelance Web Developer India"
- ✅ Content: "serving clients across India"
- ✅ Meta tags: `geo.region=IN`

### Global Version (sudharsanbuilds.com)
- ✅ All prices in **$ (USD)**
- ✅ Payment via **PayPal**
- ✅ SEO: "Professional Web Developer | Worldwide"
- ✅ Content: "serving clients worldwide"
- ✅ Meta tags: `geo.region=WORLDWIDE`

---

## 🧪 Testing Your Deployment

### Local Testing

#### Test India Version:
```bash
# Create .env.local file
echo "VITE_REGION=india" > .env.local
# Add other env vars...

npm run dev
# Open http://localhost:5173
# Verify: Prices in ₹, Razorpay payment option
```

#### Test Global Version:
```bash
# Update .env.local
echo "VITE_REGION=global" > .env.local
# Add other env vars...

npm run dev
# Open http://localhost:5173
# Verify: Prices in $, PayPal payment option
```

### Production Testing Checklist

- [ ] **India Build:**
  - [ ] Prices displayed in ₹ (e.g., ₹15,000)
  - [ ] Payment button shows Razorpay
  - [ ] Services page shows correct deposit amounts
  - [ ] AI Chat shows INR prices
  - [ ] Country switcher shows 🇮🇳 India as active

- [ ] **Global Build:**
  - [ ] Prices displayed in $ (e.g., $300)
  - [ ] Payment button shows PayPal
  - [ ] Services page shows correct deposit amounts
  - [ ] AI Chat shows USD prices
  - [ ] Country switcher shows 🌐 Global as active

- [ ] **Region Detection:**
  - [ ] Accessing .in from .com shows suggestion banner
  - [ ] Accessing .com from .in shows suggestion banner
  - [ ] Banner can be dismissed (persists for 7 days)
  - [ ] Manual switcher redirects correctly

---

## 🔐 Database Schema (Shared)

Both regions use the **same** Supabase tables. No changes needed!

### `payment_orders` Table
```sql
- id (uuid)
- order_id (text) -- Razorpay or PayPal order ID
- amount (numeric) -- In INR or USD (automatically handled)
- currency (text) -- 'INR' or 'USD'
- status (text)
- customer_email (text)
- service_name (text)
- created_at (timestamp)
```

### Why This Works:
- **Currency field** stores the region's currency ('INR' or 'USD')
- **Amount field** stores the actual value (e.g., 15000 for India, 300 for Global)
- Invoices generated with correct currency symbol automatically

---

## 📊 Analytics & Monitoring

### Track Both Regions Separately:

1. **Google Analytics (Optional):**
   - Create two properties: "SudharsanBuilds India" and "SudharsanBuilds Global"
   - Add different GA IDs to each Vercel project

2. **Vercel Analytics:**
   - Each project has separate analytics dashboard
   - Monitor performance per region

3. **Payment Gateway Dashboards:**
   - **Razorpay Dashboard**: Track India payments
   - **PayPal Dashboard**: Track Global payments

---

## 🐛 Troubleshooting

### Issue: Prices showing wrong currency

**Solution:** Check `VITE_REGION` environment variable in Vercel dashboard.

### Issue: Payment gateway not loading

**Solution:**
- Verify API keys are correct
- Check if gateway supports your region (Razorpay = India only, PayPal = Global)
- Look at browser console for errors

### Issue: Region banner not showing

**Solution:** This is normal! Banner only shows when:
- User is on wrong domain (India build on .com)
- User hasn't dismissed it in the last 7 days

### Issue: Both deployments showing same region

**Solution:**
- Clear Vercel build cache
- Re-deploy with correct `VITE_REGION` variable
- Verify environment variables in Vercel project settings

---

## 🔄 Updating Both Deployments

### When you make code changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "✨ Add new feature"
git push

# Vercel auto-deploys both projects!
# India project deploys with VITE_REGION=india
# Global project deploys with VITE_REGION=global
```

### Manual Re-deployment (if needed):

```bash
# Re-deploy specific project
vercel --prod --name sudharsanbuilds-india
vercel --prod --name sudharsanbuilds-global
```

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] Both Vercel projects created and configured
- [ ] Custom domains added and DNS configured
- [ ] Environment variables set correctly for both projects
- [ ] Razorpay Live API keys configured (India)
- [ ] PayPal Live Client ID configured (Global)
- [ ] Supabase database accessible from both deployments
- [ ] EmailJS configured with correct templates
- [ ] Test payment flow on both versions
- [ ] Verify all prices display correctly
- [ ] Test region switcher functionality
- [ ] Test region suggestion banner
- [ ] Verify SEO meta tags (use view-source:)
- [ ] Check mobile responsiveness on both versions

---

## 🎯 Next Steps After Deployment

1. **Set up monitoring:**
   - Add Sentry for error tracking
   - Configure uptime monitoring (UptimeRobot, Pingdom)

2. **SEO Optimization:**
   - Submit sitemaps to Google Search Console (both .in and .com)
   - Add hreflang tags for region targeting
   - Set up Google Business Profile (if applicable)

3. **Payment Testing:**
   - Start with sandbox/test mode
   - Process test transactions
   - Verify webhooks and email notifications
   - Switch to live mode when confident

4. **Marketing:**
   - Update social media links to point to correct domain
   - Add domain to business cards
   - Update email signatures

---

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Project → Deployments → Click on deployment → Logs
2. **Check Browser Console**: F12 → Console tab
3. **Verify Environment Variables**: Vercel → Settings → Environment Variables
4. **Database Logs**: Supabase → Database → Logs

---

## 🎉 You're Ready to Go Global!

Your website is now configured to serve both Indian and international clients with:
- ✅ Localized pricing
- ✅ Region-specific payment gateways
- ✅ Smart auto-detection
- ✅ Manual user control
- ✅ Single codebase maintenance

**Remember:** All code changes apply to both versions automatically. You only need to update pricing in the config files if you want to change rates!

Good luck with your global expansion! 🚀

---

**Last Updated:** November 22, 2025
**Branch:** `claude/analyze-codebase-014KFc1GjbYnPDLG95qzNXbq`

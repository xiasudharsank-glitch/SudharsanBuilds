# Deployment Guide - SudharsanBuilds Portfolio

This guide will help you deploy your portfolio to production on Vercel.

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables Setup**

Add these environment variables to Vercel (Settings → Environment Variables):

#### **Required for Core Functionality:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id_here
VITE_FORMSPREE_ID=xeopodle
VITE_EMAILJS_SERVICE_ID=service_a20noyz
VITE_EMAILJS_PUBLIC_KEY=ERmFROsms8jjhTQie
VITE_EMAILJS_TEMPLATE_BOOKING=template_93arapj
VITE_EMAILJS_TEMPLATE_INVOICE=template_invoice
```

#### **Contact Information:**
```bash
VITE_YOUR_EMAIL=sudharsanofficial0001@gmail.com
VITE_WHATSAPP_NUMBER=916381556407
VITE_UPI_ID=6381556407@ptsbi
```

### 2. **Supabase Edge Functions Setup**

Add these **SECRET** environment variables in Supabase Dashboard (Project Settings → Edge Functions):

```bash
GEMINI_API_KEY=your-gemini-api-key
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**IMPORTANT:** These should NEVER be in Vercel or have the `VITE_` prefix!

### 3. **Database Migration**

Run the Supabase migration to create the invoices table:

```bash
# In Supabase SQL Editor, run:
supabase/migrations/002_create_invoices_table.sql
```

### 4. **Deploy Supabase Edge Functions**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy ai-chatbot
supabase functions deploy create-payment-order
```

## 🚀 Deployment Steps

### **Option 1: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### **Option 2: Deploy via GitHub**

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

## 🧪 Post-Deployment Testing

Test these critical features:

1. **Homepage loads** ✅
2. **Services page with booking modal** ✅
3. **Razorpay payment works** 💳
4. **EmailJS sends booking confirmations** 📧
5. **Contact form submits via Formspree** 📬
6. **AI Chatbot responds** 🤖
7. **404 page for invalid routes** ❌
8. **Error boundary catches React errors** ⚠️

## 🐛 Troubleshooting

### **Blank Page / White Screen**
- Check Vercel logs for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### **Razorpay Not Working**
- Verify `VITE_RAZORPAY_KEY_ID` is set in Vercel
- Check Razorpay dashboard for test vs live mode
- Ensure `RAZORPAY_KEY_SECRET` is in Supabase Edge Functions (NOT Vercel)

### **AI Chatbot Failing**
- Check `GEMINI_API_KEY` is set in Supabase Edge Functions
- Verify Supabase function is deployed
- Check Supabase function logs

### **Emails Not Sending**
- Verify all `VITE_EMAILJS_*` variables are correct
- Check EmailJS dashboard for quota limits (200/month on free plan)
- Test templates in EmailJS dashboard

## 📊 Production Monitoring

- **Vercel Analytics:** Check performance metrics
- **Supabase Logs:** Monitor Edge Function errors
- **EmailJS Dashboard:** Track email delivery
- **Razorpay Dashboard:** Monitor payment transactions

## 🔒 Security Checklist

✅ No secrets in Vercel environment variables (only `VITE_*` keys)
✅ Razorpay secret in Supabase Edge Functions only
✅ Gemini API key in Supabase Edge Functions only
✅ `.env` file in `.gitignore`
✅ Supabase Row Level Security (RLS) enabled
✅ CORS configured for Supabase functions

## 🎯 Performance Optimization

- Code splitting enabled (React, Framer Motion, Icons separated)
- Lazy loading for all pages
- Image optimization with SVG fallbacks
- CSS minification enabled
- Gzip compression automatic on Vercel

---

**Need Help?** Check [Vercel Docs](https://vercel.com/docs) or [Supabase Docs](https://supabase.com/docs)

# 🎉 EmailJS Setup Complete! (FREE Plan)

**Your automated booking & invoicing system is ready!**

---

## ✅ What's Already Configured

### **EmailJS Settings (FREE Plan)**
- ✅ Service ID: `service_a20noyz`
- ✅ Public Key: `ERmFROsms8jjhTQie`
- ✅ Template 1 (Booking): `template_93arapj`
- ✅ Template 2 (Invoice): `template_invoice`

### **Business Info**
- ✅ Email: `sudharsanofficial0001@gmail.com`
- ✅ WhatsApp: `916381556407`
- ✅ UPI ID: `6381556407@ptsbi`

### **Formspree (Contact Form)**
- ✅ Endpoint: `xeopodle`
- ✅ Contact form emails working via Formspree

---

## 🚀 What You Need to Do (3 Steps)

### **Step 1: Add Supabase Credentials** (1 minute)

Open `.env` file and replace:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

**Where to find:**
- Go to https://supabase.com/dashboard
- Select your project
- Click "Settings" → "API"
- Copy "Project URL" and "anon public" key

---

### **Step 2: Add Razorpay Key** (30 seconds)

In `.env` file, replace:

```bash
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID_HERE
```

**Where to find:**
- Go to https://dashboard.razorpay.com/
- Click "Settings" → "API Keys"
- Copy "Key ID" (starts with `rzp_test_` or `rzp_live_`)

---

### **Step 3: Create Invoices Table in Supabase** (1 minute)

1. Go to Supabase Dashboard → https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"**
5. Copy ALL SQL from: `supabase/migrations/002_create_invoices_table.sql`
6. Paste and click **"RUN"**
7. Verify: Go to **"Table Editor"** → You should see `invoices` table

---

## 📧 How It Works

### **Contact Form Emails** → Formspree ✅
- Someone fills contact form
- Formspree sends you email automatically
- Data saved in Supabase `inquiries` table

### **Booking Emails** → EmailJS (2 Templates) ✅

**When customer books a service:**

1. Customer clicks "Book Now"
2. Fills booking modal (name, email, phone, project details)
3. Completes Razorpay payment
4. **3 emails sent automatically:**
   - **Email 1:** Booking confirmation → Customer
   - **Email 2:** Invoice → Customer (with payment details)
   - **Email 3:** Alert → YOU (with customer info & WhatsApp link)
5. Data saved in Supabase `invoices` table

---

## 🎨 Email Template Strategy (FREE Plan Hack)

**You have 2 templates, we use them smartly:**

| Template | Usage | Sent To |
|----------|-------|---------|
| `template_93arapj` (Booking) | Customer confirmation | Customer email |
| `template_93arapj` (Booking) | **REUSED** for owner alert | Your email |
| `template_invoice` (Invoice) | Invoice with payment details | Customer email |

**Result:** 3 emails sent using only 2 templates! 🎉

---

## 🧪 Testing Your Setup

### **Test 1: Contact Form**

1. Fill out contact form on website
2. Submit
3. **Check:**
   - ✅ Success message shown
   - ✅ Email received at `sudharsanofficial0001@gmail.com` (from Formspree)
   - ✅ Supabase `inquiries` table has new row

### **Test 2: Booking Flow**

1. Click "Book Now" on any service (e.g., Landing Page)
2. Fill booking modal:
   - Name: Your name
   - Email: Your email (for testing)
   - Phone: `6381556407`
   - Project: "Test booking"
3. Click "Proceed to Payment"
4. Complete Razorpay payment (test mode)

**Expected Results:**
- ✅ Customer receives 2 emails:
  - Booking confirmation
  - Invoice with payment breakdown
- ✅ You receive 1 email:
  - Booking alert with customer details & WhatsApp link
- ✅ Supabase `invoices` table has new invoice record
- ✅ Success popup shows invoice ID

---

## 📊 Email Limits & Usage

| Plan | Monthly Emails | Cost | Your Capacity |
|------|----------------|------|---------------|
| EmailJS FREE | 200 emails | $0 | ~65 bookings/month |
| Formspree FREE | 50 emails | $0 | 50 contact forms/month |

**Each booking uses 3 EmailJS emails**
**Contact forms use Formspree (separate quota)**

---

## 🔍 Monitoring

### **EmailJS Dashboard**
- Go to: https://dashboard.emailjs.com/
- Check **"Statistics"** for usage
- Check **"Logs"** if emails fail

### **Formspree Dashboard**
- Go to: https://formspree.io/forms
- See contact form submissions

### **Supabase Dashboard**
- **Invoices table:** All booking invoices
- **Inquiries table:** All contact form submissions

---

## ❓ Troubleshooting

### "Emails not being sent"

1. Check browser console (F12) for errors
2. Verify EmailJS keys in `.env` file
3. Check EmailJS dashboard → "Logs"
4. Make sure template IDs match exactly

### "Invoice table not found"

- Run SQL migration in Supabase (Step 3 above)
- Check Supabase Table Editor

### "Payment works but no emails"

- Check EmailJS public key is correct
- Check EmailJS service ID is correct
- Verify template IDs: `template_93arapj` and `template_invoice`
- Look in browser console for errors

---

## 📝 What You Get

### **Automated System ✅**
- Booking confirmations
- Professional invoices
- Owner alerts
- Contact form notifications
- All data in Supabase

### **Customer Journey ✅**
1. Customer books service
2. Pays deposit via Razorpay
3. Receives confirmation email immediately
4. Receives invoice with payment details
5. You get alerted with their info & WhatsApp link

### **100% FREE ✅**
- EmailJS: 200 emails/month FREE
- Formspree: 50 emails/month FREE
- Supabase: FREE tier
- Total cost: **$0** to start!

---

## 🎯 Next Steps After Setup

1. **Fill in Supabase & Razorpay credentials** (Steps 1 & 2)
2. **Run SQL migration** (Step 3)
3. **Test booking flow** (see Testing section)
4. **Go live!** 🚀

---

## 📞 Your Configuration Summary

```bash
# EmailJS
Service ID: service_a20noyz
Public Key: ERmFROsms8jjhTQie
Templates: template_93arapj, template_invoice

# Formspree
Endpoint: xeopodle

# Business
Email: sudharsanofficial0001@gmail.com
WhatsApp: 916381556407
UPI: 6381556407@ptsbi

# Status
✅ EmailJS configured
✅ Formspree configured
✅ Business info configured
⏳ Supabase credentials needed
⏳ Razorpay key needed
⏳ Database migration needed
```

---

## 🎉 Ready to Launch!

Once you complete the 3 steps above, you'll have:
- ✅ Automated booking system
- ✅ Professional invoicing
- ✅ Email notifications
- ✅ Contact form working
- ✅ **100% FREE** (up to 200 emails/month)

**Questions?** Check:
- EmailJS docs: https://www.emailjs.com/docs/
- Formspree docs: https://help.formspree.io/
- Supabase docs: https://supabase.com/docs

---

**You're all set! Complete the 3 steps and start taking bookings!** 🚀

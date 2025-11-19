# EmailJS Setup Guide

This guide will help you set up EmailJS for automated email notifications and invoicing.

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Click "Sign Up" (it's FREE - 200 emails/month)
3. Verify your email

### Step 2: Add Email Service

1. In EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose **"Gmail"** (recommended)
4. Connect your Gmail account (sudharsanofficial0001@gmail.com)
5. Click **"Create Service"**
6. Copy the **Service ID** (looks like `service_xxxxx`)

### Step 3: Create Email Templates

You need to create **4 email templates**. Go to **"Email Templates"** and create each one:

---

#### Template 1: Booking Confirmation Email

**Template Name:** `booking_confirm`

**Settings:**
- Template ID: `template_booking_confirm`
- Subject: `✅ Your Website Project Booking Confirmed!`

**Template Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
    <h1>Booking Confirmed! 🎉</h1>
  </div>

  <div style="padding: 30px; background-color: #f8fafc;">
    <p style="font-size: 16px; color: #334155;">Hello <strong>{{customer_name}}</strong>,</p>

    <p style="font-size: 16px; color: #334155;">Thank you for booking with Sudharsan Builds! Your payment has been successfully received.</p>

    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0891b2;">
      <h3 style="color: #0891b2; margin-top: 0;">📋 Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Service:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">{{service_type}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Total Amount:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">{{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Deposit Paid:</td>
          <td style="padding: 8px 0; color: #10b981; font-weight: bold;">{{deposit_amount}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Timeline:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">{{timeline}}</td>
        </tr>
      </table>
    </div>

    <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="color: #1e40af; margin-top: 0;">📞 Next Steps</h3>
      <p style="color: #1e3a8a;">We'll contact you on <strong>{{customer_phone}}</strong> within 24 hours to discuss your project details.</p>
      <p style="margin-top: 15px;">
        <a href="{{whatsapp_link}}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">💬 WhatsApp Me</a>
      </p>
    </div>

    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">If you have any questions, reply to this email or contact me at <a href="mailto:{{your_email}}" style="color: #0891b2;">{{your_email}}</a></p>

    <p style="font-size: 16px; color: #334155; margin-top: 30px;">Thank you for choosing Sudharsan Builds!</p>
    <p style="color: #64748b;">Best regards,<br><strong>Sudharsan</strong></p>
  </div>

  <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Sudharsan Builds. All rights reserved.</p>
  </div>
</div>
```

**Template Variables:**
- `{{to_email}}` - Auto-populated
- `{{customer_name}}`
- `{{customer_phone}}`
- `{{service_type}}`
- `{{amount}}`
- `{{deposit_amount}}`
- `{{timeline}}`
- `{{whatsapp_link}}`
- `{{your_email}}`

---

#### Template 2: Invoice Email

**Template Name:** `invoice`

**Settings:**
- Template ID: `template_invoice`
- Subject: `📄 Invoice for {{service_type}} - {{invoice_id}}`

**Template Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 30px; text-align: center; color: white;">
    <h1>Invoice</h1>
    <p style="font-size: 18px; margin: 0;">{{invoice_id}}</p>
  </div>

  <div style="padding: 30px; background-color: #f8fafc;">
    <p style="font-size: 16px; color: #334155;">Hello <strong>{{customer_name}}</strong>,</p>

    <p style="font-size: 16px; color: #334155;">Please find your invoice details below:</p>

    <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #0891b2; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">INVOICE #{{invoice_id}}</h2>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{service_type}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Description:</td>
          <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0;">{{description}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Total Amount:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Deposit Paid:</td>
          <td style="padding: 10px 0; color: #10b981; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{deposit_amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 2px solid #0891b2;">Remaining Amount:</td>
          <td style="padding: 10px 0; color: #ef4444; font-weight: bold; font-size: 18px; border-bottom: 2px solid #0891b2;">{{remaining_amount}}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;"><strong>Payment Status:</strong> {{payment_status}}</p>
        <p style="margin: 5px 0 0 0; color: #92400e;"><strong>Invoice Date:</strong> {{invoice_date}}</p>
        <p style="margin: 5px 0 0 0; color: #92400e;"><strong>Due Date:</strong> {{due_date}}</p>
      </div>
    </div>

    <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="color: #1e40af; margin-top: 0;">💳 Payment Details for Remaining Balance</h3>
      <p style="color: #1e3a8a; margin: 10px 0;"><strong>UPI ID:</strong> {{upi_id}}</p>
      <p style="color: #64748b; font-size: 14px; margin-top: 10px;">You can also pay via bank transfer or card. Contact me for details.</p>
    </div>

    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Questions? Reply to this email or WhatsApp me!</p>

    <p style="font-size: 16px; color: #334155; margin-top: 30px;">Thanks for your business!</p>
    <p style="color: #64748b;">Best regards,<br><strong>Sudharsan</strong></p>
  </div>

  <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Sudharsan Builds. All rights reserved.</p>
  </div>
</div>
```

**Template Variables:**
- `{{to_email}}` - Auto-populated
- `{{customer_name}}`
- `{{invoice_id}}`
- `{{service_type}}`
- `{{description}}`
- `{{amount}}`
- `{{deposit_amount}}`
- `{{remaining_amount}}`
- `{{payment_status}}`
- `{{invoice_date}}`
- `{{due_date}}`
- `{{upi_id}}`

---

#### Template 3: New Booking Alert (To You)

**Template Name:** `new_booking_alert`

**Settings:**
- Template ID: `template_new_booking_alert`
- Subject: `🔔 New Booking Alert - {{customer_name}}`

**Template Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center; color: white;">
    <h1>🔔 New Booking Received!</h1>
  </div>

  <div style="padding: 30px; background-color: #f8fafc;">
    <p style="font-size: 18px; color: #0f172a; font-weight: bold;">You have a new customer!</p>

    <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h3 style="color: #dc2626; margin-top: 0;">Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{customer_name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{customer_phone}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{customer_email}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service:</td>
          <td style="padding: 10px 0; color: #0891b2; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{service_type}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Total Amount:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Deposit Received:</td>
          <td style="padding: 10px 0; color: #10b981; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{deposit_amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Timeline:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{timeline}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; vertical-align: top;">Project Details:</td>
          <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0;">{{project_details}}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-weight: bold;">Payment Status: {{payment_status}}</p>
      </div>
    </div>

    <div style="background: #25D366; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
      <h3 style="color: white; margin: 0 0 15px 0;">⚡ ACTION REQUIRED</h3>
      <p style="color: white; margin: 0 0 15px 0; font-size: 16px;">Contact them on WhatsApp ASAP!</p>
      <a href="{{whatsapp_link}}" style="background: white; color: #25D366; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">💬 WhatsApp Now</a>
    </div>
  </div>

  <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>This is an automated notification from your portfolio website</p>
  </div>
</div>
```

**Template Variables:**
- `{{to_email}}` - Auto-populated
- `{{customer_name}}`
- `{{customer_phone}}`
- `{{customer_email}}`
- `{{service_type}}`
- `{{amount}}`
- `{{deposit_amount}}`
- `{{project_details}}`
- `{{timeline}}`
- `{{payment_status}}`
- `{{whatsapp_link}}`

---

#### Template 4: Contact Form Email

**Template Name:** `contact_form`

**Settings:**
- Template ID: `template_contact_form`
- Subject: `📬 New Contact Form Submission - {{from_name}}`

**Template Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
    <h1>📬 New Contact Form Submission</h1>
  </div>

  <div style="padding: 30px; background-color: #f8fafc;">
    <p style="font-size: 18px; color: #0f172a; font-weight: bold;">Someone filled out your contact form!</p>

    <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h3 style="color: #0891b2; margin-top: 0;">Contact Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{from_name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{from_email}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{phone}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service:</td>
          <td style="padding: 10px 0; color: #0891b2; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{service}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Timeline:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{timeline}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Budget:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0;">{{budget}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; vertical-align: top;">Message:</td>
          <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0;">{{message}}</td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">Reply to this email to respond directly to {{from_name}}.</p>
  </div>

  <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>This is an automated notification from your portfolio website</p>
  </div>
</div>
```

**Template Variables:**
- `{{to_email}}` - Auto-populated
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{service}}`
- `{{timeline}}`
- `{{budget}}`
- `{{message}}`

---

### Step 4: Get Your Public Key

1. Go to **"Account"** > **"General"** in EmailJS dashboard
2. Copy your **Public Key** (looks like `abc123xyz`)

---

### Step 5: Update Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```bash
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxx  # From Step 2
VITE_EMAILJS_PUBLIC_KEY=abc123xyz      # From Step 4
VITE_EMAILJS_TEMPLATE_BOOKING=template_booking_confirm
VITE_EMAILJS_TEMPLATE_INVOICE=template_invoice
VITE_EMAILJS_TEMPLATE_ALERT=template_new_booking_alert
VITE_EMAILJS_TEMPLATE_CONTACT=template_contact_form

# Business Configuration
VITE_YOUR_EMAIL=sudharsanofficial0001@gmail.com
VITE_WHATSAPP_NUMBER=919876543210  # Your WhatsApp number with country code
VITE_UPI_ID=sudharsan@upi           # Your UPI ID
```

---

### Step 6: Run the Supabase Migration

Create the invoices table in Supabase:

```bash
# If using Supabase CLI locally
supabase db push

# OR manually run the SQL in Supabase Dashboard > SQL Editor
```

Copy the contents of `supabase/migrations/002_create_invoices_table.sql` and run it in Supabase SQL Editor.

---

## ✅ Testing Your Setup

1. **Test the contact form:**
   - Fill out the contact form on your website
   - Check if you receive an email notification

2. **Test the payment flow:**
   - Click "Book Now" on any service
   - Fill in customer details
   - Complete payment (use Razorpay test mode)
   - Check if all 3 emails are sent:
     - Booking confirmation to customer
     - Invoice to customer
     - Alert to you

---

## 📊 Email Limits

| Plan | Price | Monthly Emails |
|------|-------|----------------|
| Free | $0 | 200 emails |
| Personal | $8.50/month | 1,000 emails |
| Professional | $29/month | 10,000 emails |

**For your use case:**
- Average: 3 emails per booking (confirmation + invoice + alert to you)
- Plus contact form emails
- Free plan: ~65 bookings/month (more than enough to start!)

---

## 🔧 Troubleshooting

### Emails not being sent?

1. **Check EmailJS dashboard** - Look for error logs
2. **Verify template IDs** - Make sure they match exactly
3. **Check browser console** - Look for JavaScript errors
4. **Test templates** - Use EmailJS "Test" feature in dashboard
5. **Gmail settings** - Make sure "Less secure apps" is enabled (if using Gmail)

### Template not found error?

- Double-check template IDs in `.env` file
- Make sure template status is "Active" in EmailJS dashboard

### Variables not showing in email?

- Check template variable syntax: `{{variable_name}}`
- Make sure you're passing the correct variable names from code

---

## 🎉 You're All Set!

Your email automation is now live! Every time someone:
- Fills the contact form → You get an email
- Makes a payment → They get confirmation + invoice, you get alert
- All data is stored in Supabase for records

**Questions?** Check EmailJS docs: https://www.emailjs.com/docs/

---

## 📝 Next Steps

1. Set up Razorpay (see `RAZORPAY_SETUP_GUIDE.md`)
2. Test the complete payment flow
3. Customize email templates with your branding
4. Monitor your EmailJS usage dashboard
5. Upgrade plan when you start getting more bookings!

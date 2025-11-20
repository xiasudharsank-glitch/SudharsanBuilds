import emailjs from '@emailjs/browser';
import { env, features } from '../utils/env';

// Initialize EmailJS with public key
export const initEmailJS = () => {
  if (features.hasEmailJS && env.EMAILJS_PUBLIC_KEY) {
    emailjs.init(env.EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
  } else {
    console.warn('⚠️ EmailJS not configured - email notifications will be skipped');
  }
};

// Email template interfaces
interface BookingConfirmationData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  amount: number;
  deposit_amount: number;
  timeline: string;
  whatsapp_link: string;
  your_email: string;
}

interface InvoiceData {
  customer_name: string;
  customer_email: string;
  invoice_id: string;
  service_type: string;
  description: string;
  amount: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_status: string;
  invoice_date: string;
  due_date: string;
  upi_id: string;
}

interface NewBookingAlertData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_type: string;
  amount: number;
  deposit_amount: number;
  project_details: string;
  timeline: string;
  payment_status: string;
  whatsapp_link: string;
  your_email: string;
}

/**
 * Send booking confirmation email to customer
 * Uses the booking_confirm template
 */
export const sendBookingConfirmation = async (data: BookingConfirmationData): Promise<boolean> => {
  try {
    if (!features.hasEmailJS) {
      console.warn('EmailJS not configured, skipping booking confirmation email');
      return false;
    }

    const serviceId = env.EMAILJS_SERVICE_ID;
    const templateId = env.EMAILJS_TEMPLATE_BOOKING;

    const templateParams = {
      to_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      service_type: data.service_type,
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      deposit_amount: `₹${data.deposit_amount.toLocaleString('en-IN')}`,
      timeline: data.timeline,
      whatsapp_link: data.whatsapp_link,
      your_email: data.your_email,
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
};

/**
 * Send invoice email to customer
 * Uses the invoice template
 */
export const sendInvoiceEmail = async (data: InvoiceData): Promise<boolean> => {
  try {
    if (!features.hasEmailJS) {
      console.warn('EmailJS not configured, skipping invoice email');
      return false;
    }

    const serviceId = env.EMAILJS_SERVICE_ID;
    const templateId = env.EMAILJS_TEMPLATE_INVOICE;

    const templateParams = {
      to_email: data.customer_email,
      customer_name: data.customer_name,
      invoice_id: data.invoice_id,
      service_type: data.service_type,
      description: data.description,
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      deposit_amount: `₹${data.deposit_amount.toLocaleString('en-IN')}`,
      remaining_amount: `₹${data.remaining_amount.toLocaleString('en-IN')}`,
      payment_status: data.payment_status,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      upi_id: data.upi_id,
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
};

/**
 * Send new booking alert to owner
 * REUSES the booking_confirm template but sends to owner instead
 * FREE PLAN WORKAROUND: Uses same template as booking confirmation
 */
export const sendNewBookingAlert = async (data: NewBookingAlertData): Promise<boolean> => {
  try {
    if (!features.hasEmailJS) {
      console.warn('EmailJS not configured, skipping booking alert email');
      return false;
    }

    const serviceId = env.EMAILJS_SERVICE_ID;
    const templateId = env.EMAILJS_TEMPLATE_BOOKING; // REUSE booking template

    const templateParams = {
      to_email: data.your_email, // Send to YOU instead of customer
      customer_name: `🔔 NEW BOOKING: ${data.customer_name}`,
      customer_phone: data.customer_phone,
      service_type: `${data.service_type} | Contact: ${data.customer_email}`,
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      deposit_amount: `₹${data.deposit_amount.toLocaleString('en-IN')} (${data.payment_status})`,
      timeline: `${data.timeline} | Details: ${data.project_details}`,
      whatsapp_link: data.whatsapp_link,
      your_email: data.customer_email, // Show customer email in template
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending booking alert:', error);
    return false;
  }
};

/**
 * Contact form email - REMOVED (not functional on FREE plan)
 *
 * ⚠️ This function has been removed to prevent misleading users.
 * Contact form submissions are saved directly to Supabase database ONLY.
 *
 * To enable email notifications:
 * 1. Upgrade to EmailJS Personal plan
 * 2. Create a contact_form template in EmailJS dashboard
 * 3. Re-implement this function with actual email sending
 * 4. Update Contact.tsx to handle email notifications
 *
 * For now, all contact inquiries are saved to Supabase 'inquiries' table.
 * Check Supabase Dashboard → Table Editor → inquiries to view submissions.
 */
// Function intentionally removed - no longer exported

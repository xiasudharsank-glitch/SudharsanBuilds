import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
export const initEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
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

/**
 * Send booking confirmation email to customer
 * Uses the booking_confirm template (template_93arapj)
 */
export const sendBookingConfirmation = async (data: BookingConfirmationData): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_BOOKING;

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
    // Error logged for debugging in development only
    if (import.meta.env.DEV) {
      console.error('Error sending booking confirmation:', error);
    }
    return false;
  }
};

/**
 * Send invoice email to customer
 * Uses the invoice template (template_invoice)
 */
export const sendInvoiceEmail = async (data: InvoiceData): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_INVOICE;

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
    // Error logged for debugging in development only
    if (import.meta.env.DEV) {
      console.error('Error sending invoice email:', error);
    }
    return false;
  }
};

/**
 * Send new booking alert to owner
 * REUSES the booking_confirm template but sends to owner instead
 * FREE PLAN WORKAROUND: Uses same template as booking confirmation
 */
export const sendOwnerBookingAlert = async (data: BookingConfirmationData & { project_details: string }): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_BOOKING; // REUSE booking template

    const templateParams = {
      to_email: data.your_email, // Send to YOU instead of customer
      customer_name: `🔔 NEW BOOKING: ${data.customer_name}`,
      customer_phone: data.customer_phone,
      service_type: `${data.service_type} | Customer Email: ${data.customer_email}`,
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      deposit_amount: `₹${data.deposit_amount.toLocaleString('en-IN')} (Deposit Received)`,
      timeline: `${data.timeline} | Project: ${data.project_details}`,
      whatsapp_link: data.whatsapp_link,
      your_email: data.customer_email, // Show customer email in template
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    // Error logged for debugging in development only
    if (import.meta.env.DEV) {
      console.error('Error sending owner alert:', error);
    }
    return false;
  }
};

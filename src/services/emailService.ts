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
    console.error('Error sending booking confirmation:', error);
    return false;
  }
};

/**
 * Send invoice email to customer
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
    console.error('Error sending invoice email:', error);
    return false;
  }
};

/**
 * Send new booking alert to owner
 */
export const sendNewBookingAlert = async (data: NewBookingAlertData): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ALERT;

    const templateParams = {
      to_email: data.your_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      service_type: data.service_type,
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      deposit_amount: `₹${data.deposit_amount.toLocaleString('en-IN')}`,
      project_details: data.project_details,
      timeline: data.timeline,
      payment_status: data.payment_status,
      whatsapp_link: data.whatsapp_link,
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending booking alert:', error);
    return false;
  }
};

/**
 * Send simple contact form email (replaces Formspree)
 */
export const sendContactFormEmail = async (formData: {
  name: string;
  email: string;
  phone?: string;
  service: string;
  timeline: string;
  budget?: string;
  message: string;
}): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT;
    const yourEmail = import.meta.env.VITE_YOUR_EMAIL || 'sudharsanofficial0001@gmail.com';

    const templateParams = {
      to_email: yourEmail,
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || 'Not provided',
      service: formData.service,
      timeline: formData.timeline,
      budget: formData.budget || 'Not specified',
      message: formData.message,
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

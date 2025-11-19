import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation, sendInvoiceEmail, sendOwnerBookingAlert } from './emailService';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface PaymentData {
  name: string;
  email: string;
  phone: string;
  service: string;
  amount: number;
  depositAmount: number;
  timeline: string;
  projectDetails: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface Invoice {
  id: string;
  invoice_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service: string;
  total_amount: number;
  deposit_paid: number;
  remaining_amount: number;
  status: 'pending' | 'partially_paid' | 'paid';
  payment_id: string;
  order_id: string;
  project_details: string;
  timeline: string;
  invoice_date: string;
  due_date: string;
  created_at: string;
}

/**
 * Generate a unique invoice ID
 */
export const generateInvoiceId = (): string => {
  return `INV-${Date.now()}`;
};

/**
 * Calculate due date (7 days from now)
 */
export const calculateDueDate = (daysFromNow: number = 7): string => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysFromNow);
  return dueDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate and send invoice with email notifications
 * This handles the complete booking flow:
 * 1. Generate invoice
 * 2. Save to Supabase
 * 3. Send booking confirmation to customer
 * 4. Send invoice to customer
 * 5. Send alert to owner
 */
export const generateAndSendInvoice = async (paymentData: PaymentData): Promise<{
  success: boolean;
  invoiceId?: string;
  message: string;
}> => {
  try {
    // Generate invoice details
    const invoiceId = generateInvoiceId();
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dueDate = calculateDueDate(7);
    const remainingAmount = paymentData.amount - paymentData.depositAmount;

    // Prepare invoice data
    const invoiceData: Omit<Invoice, 'id' | 'created_at'> = {
      invoice_id: invoiceId,
      customer_name: paymentData.name,
      customer_email: paymentData.email,
      customer_phone: paymentData.phone,
      service: paymentData.service,
      total_amount: paymentData.amount,
      deposit_paid: paymentData.depositAmount,
      remaining_amount: remainingAmount,
      status: remainingAmount > 0 ? 'partially_paid' : 'paid',
      payment_id: paymentData.razorpayPaymentId,
      order_id: paymentData.razorpayOrderId,
      project_details: paymentData.projectDetails,
      timeline: paymentData.timeline,
      invoice_date: invoiceDate,
      due_date: dueDate,
    };

    // Save to Supabase
    if (supabase) {
      const { error } = await supabase
        .from('invoices')
        .insert([{
          invoice_id: invoiceData.invoice_id,
          customer_name: invoiceData.customer_name,
          customer_email: invoiceData.customer_email,
          customer_phone: invoiceData.customer_phone,
          service: invoiceData.service,
          total_amount: invoiceData.total_amount,
          deposit_paid: invoiceData.deposit_paid,
          remaining_amount: invoiceData.remaining_amount,
          status: invoiceData.status,
          payment_id: invoiceData.payment_id,
          order_id: invoiceData.order_id,
          project_details: invoiceData.project_details,
          timeline: invoiceData.timeline,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase error saving invoice:', error);
        }
        throw new Error('Failed to save invoice to database');
      }
    }

    // Get configuration
    const yourEmail = import.meta.env.VITE_YOUR_EMAIL || 'sudharsanofficial0001@gmail.com';
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '916381556407';
    const upiId = import.meta.env.VITE_UPI_ID || '6381556407@ptsbi';

    // Send booking confirmation email to customer
    await sendBookingConfirmation({
      customer_name: paymentData.name,
      customer_email: paymentData.email,
      customer_phone: paymentData.phone,
      service_type: paymentData.service,
      amount: paymentData.amount,
      deposit_amount: paymentData.depositAmount,
      timeline: paymentData.timeline,
      whatsapp_link: `https://wa.me/${whatsappNumber}`,
      your_email: yourEmail,
    });

    // Send invoice email to customer
    await sendInvoiceEmail({
      customer_name: paymentData.name,
      customer_email: paymentData.email,
      invoice_id: invoiceId,
      service_type: paymentData.service,
      description: paymentData.projectDetails,
      amount: paymentData.amount,
      deposit_amount: paymentData.depositAmount,
      remaining_amount: remainingAmount,
      payment_status: remainingAmount > 0 ? 'Partially Paid' : 'Paid',
      invoice_date: invoiceDate,
      due_date: dueDate,
      upi_id: upiId,
    });

    // Send new booking alert to owner (reuses booking template)
    await sendOwnerBookingAlert({
      customer_name: paymentData.name,
      customer_email: paymentData.email,
      customer_phone: paymentData.phone,
      service_type: paymentData.service,
      amount: paymentData.amount,
      deposit_amount: paymentData.depositAmount,
      timeline: paymentData.timeline,
      project_details: paymentData.projectDetails,
      whatsapp_link: `https://wa.me/${paymentData.phone.replace(/\D/g, '')}`,
      your_email: yourEmail,
    });

    return {
      success: true,
      invoiceId: invoiceId,
      message: 'Invoice generated and emails sent successfully!'
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error in invoice generation:', error);
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate invoice'
    };
  }
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_id', invoiceId)
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching invoice:', error);
      }
      return null;
    }

    return data as Invoice;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error getting invoice:', error);
    }
    return null;
  }
};

/**
 * Get all invoices for a customer
 */
export const getCustomerInvoices = async (customerEmail: string): Promise<Invoice[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching customer invoices:', error);
      }
      return [];
    }

    return data as Invoice[];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error getting customer invoices:', error);
    }
    return [];
  }
};

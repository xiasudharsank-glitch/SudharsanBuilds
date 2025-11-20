import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { sendBookingConfirmation, sendInvoiceEmail, sendNewBookingAlert } from './emailService';
import { env } from '../utils/env';

// Initialize Supabase client
const supabase = env.SUPABASE_URL && env.SUPABASE_ANON_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

if (!supabase) {
  console.error('❌ Supabase client not initialized - missing environment variables');
}

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
 * Generate a unique invoice ID using UUID
 * Format: INV-{timestamp}-{short-uuid}
 */
export const generateInvoiceId = (): string => {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Use first segment of UUID
  return `INV-${timestamp}-${uuid}`;
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

    // ✅ FIX: Save to Supabase with proper error handling
    // ⚠️ SECURITY WARNING: Sensitive data (email, phone) stored as plain text
    // TODO: Implement encryption for PII data using Supabase Vault or client-side encryption
    // See SECURITY.md for recommendations
    let invoiceSavedToDatabase = false;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .insert([{
            invoice_id: invoiceData.invoice_id,
            customer_name: invoiceData.customer_name,
            customer_email: invoiceData.customer_email, // ⚠️ Plain text - should encrypt
            customer_phone: invoiceData.customer_phone, // ⚠️ Plain text - should encrypt
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
          console.error('❌ Supabase error saving invoice:', error);
          invoiceSavedToDatabase = false;
          // Don't throw - continue to send emails even if database save fails
        } else {
          console.log('✅ Invoice saved to Supabase:', data);
          invoiceSavedToDatabase = true;
        }
      } catch (dbError) {
        console.error('❌ Exception saving invoice to database:', dbError);
        invoiceSavedToDatabase = false;
        // Continue execution - emails can still be sent
      }
    } else {
      console.warn('⚠️ Supabase not configured - invoice not saved to database');
    }

    // Get configuration
    const yourEmail = env.YOUR_EMAIL || 'sudharsanofficial0001@gmail.com';
    const whatsappNumber = env.WHATSAPP_NUMBER || '919876543210';
    const upiId = env.UPI_ID || 'sudharsan@upi';

    // ✅ FIX: Track email sending results
    const emailResults = {
      bookingConfirmation: false,
      invoice: false,
      ownerAlert: false
    };

    // Send booking confirmation email to customer
    try {
      emailResults.bookingConfirmation = await sendBookingConfirmation({
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
      console.log('Booking confirmation sent:', emailResults.bookingConfirmation);
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
    }

    // Send invoice email to customer
    try {
      emailResults.invoice = await sendInvoiceEmail({
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
      console.log('Invoice email sent:', emailResults.invoice);
    } catch (error) {
      console.error('Failed to send invoice email:', error);
    }

    // Send new booking alert to owner
    try {
      emailResults.ownerAlert = await sendNewBookingAlert({
        customer_name: paymentData.name,
        customer_phone: paymentData.phone,
        customer_email: paymentData.email,
        service_type: paymentData.service,
        amount: paymentData.amount,
        deposit_amount: paymentData.depositAmount,
        project_details: paymentData.projectDetails,
        timeline: paymentData.timeline,
        payment_status: 'Deposit Received',
        whatsapp_link: `https://wa.me/${paymentData.phone.replace(/\D/g, '')}`,
        your_email: yourEmail,
      });
      console.log('Booking alert sent to owner:', emailResults.ownerAlert);
    } catch (error) {
      console.error('Failed to send owner alert:', error);
    }

    // ✅ FIX: Determine overall success including database status
    const allEmailsSent = emailResults.bookingConfirmation && emailResults.invoice && emailResults.ownerAlert;
    const anyEmailSent = emailResults.bookingConfirmation || emailResults.invoice || emailResults.ownerAlert;

    // Build success message with database status
    let message = '';
    if (allEmailsSent && invoiceSavedToDatabase) {
      message = 'Invoice generated and all emails sent successfully!';
    } else if (anyEmailSent && invoiceSavedToDatabase) {
      message = 'Invoice generated. Some emails may have failed - please check your inbox.';
    } else if (allEmailsSent && !invoiceSavedToDatabase) {
      message = '⚠️ Emails sent successfully, but invoice could not be saved to database. We have a record via email.';
    } else if (anyEmailSent && !invoiceSavedToDatabase) {
      message = '⚠️ Some emails sent, but invoice could not be saved to database. Please contact support.';
    } else if (!anyEmailSent && invoiceSavedToDatabase) {
      message = '⚠️ Invoice saved to database, but email notifications failed. Please contact support.';
    } else {
      message = '❌ Invoice generated but both database save and email notifications failed. Please contact support immediately.';
    }

    return {
      success: anyEmailSent || invoiceSavedToDatabase, // Success if at least one operation succeeded
      invoiceId: invoiceId,
      message: message
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
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
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_id', invoiceId)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return data as Invoice;
  } catch (error) {
    console.error('Error getting invoice:', error);
    return null;
  }
};

/**
 * Get all invoices for a customer
 */
export const getCustomerInvoices = async (customerEmail: string): Promise<Invoice[]> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer invoices:', error);
      return [];
    }

    return data as Invoice[];
  } catch (error) {
    console.error('Error getting customer invoices:', error);
    return [];
  }
};

import { supabase } from '../services/supabaseClient';

// =====================================================
// EMAIL AUTOMATION API
// Manage automated email workflows and sequences
// =====================================================

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables: string[];
  category: 'welcome' | 'followup' | 'reminder' | 'thankyou' | 'notification' | 'marketing' | 'general';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  trigger_event: 'inquiry_submitted' | 'booking_confirmed' | 'payment_received' | 'project_started' | 'project_completed' | 'manual';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  template_id: string;
  delay_hours: number;
  send_time?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmailQueueItem {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  body_html: string;
  body_text?: string;
  template_id?: string;
  sequence_id?: string;
  sequence_step_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  scheduled_at: string;
  sent_at?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  error_message?: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  template_slug?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  user_email: string;
  email_enabled: boolean;
  marketing_enabled: boolean;
  followup_enabled: boolean;
  reminders_enabled: boolean;
  frequency: 'immediate' | 'daily_digest' | 'weekly_digest' | 'never';
  created_at: string;
  updated_at: string;
}

export interface AutomatedReminder {
  id: string;
  reminder_type: 'payment_due' | 'meeting_scheduled' | 'project_deadline' | 'followup' | 'custom';
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  remind_at: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'cancelled';
  created_at: string;
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

export async function fetchAllEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchActiveEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEmailTemplate(slug: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function createEmailTemplate(template: Partial<EmailTemplate>): Promise<string> {
  const { data, error } = await supabase
    .from('email_templates')
    .insert(template)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<void> {
  const { error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// EMAIL SEQUENCES
// =====================================================

export async function fetchAllEmailSequences(): Promise<EmailSequence[]> {
  const { data, error } = await supabase
    .from('email_sequences')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEmailSequenceSteps(sequenceId: string): Promise<EmailSequenceStep[]> {
  const { data, error } = await supabase
    .from('email_sequence_steps')
    .select('*')
    .eq('sequence_id', sequenceId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createEmailSequence(sequence: Partial<EmailSequence>): Promise<string> {
  const { data, error } = await supabase
    .from('email_sequences')
    .insert(sequence)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateEmailSequence(id: string, updates: Partial<EmailSequence>): Promise<void> {
  const { error } = await supabase
    .from('email_sequences')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function addSequenceStep(step: Partial<EmailSequenceStep>): Promise<string> {
  const { data, error } = await supabase
    .from('email_sequence_steps')
    .insert(step)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// =====================================================
// EMAIL SCHEDULING
// =====================================================

export async function scheduleEmail(
  recipientEmail: string,
  recipientName: string,
  templateSlug: string,
  variables: Record<string, any> = {},
  delayHours: number = 0,
  relatedType?: string,
  relatedId?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('schedule_email', {
    p_recipient_email: recipientEmail,
    p_recipient_name: recipientName,
    p_template_slug: templateSlug,
    p_variables: variables,
    p_delay_hours: delayHours,
    p_related_type: relatedType,
    p_related_id: relatedId
  });

  if (error) throw error;
  return data;
}

export async function triggerEmailSequence(
  sequenceName: string,
  recipientEmail: string,
  recipientName: string,
  relatedType?: string,
  relatedId?: string
): Promise<number> {
  const { data, error } = await supabase.rpc('trigger_email_sequence', {
    p_sequence_slug: sequenceName,
    p_recipient_email: recipientEmail,
    p_recipient_name: recipientName,
    p_related_type: relatedType,
    p_related_id: relatedId
  });

  if (error) throw error;
  return data;
}

export async function fetchPendingEmails(limit: number = 50): Promise<EmailQueueItem[]> {
  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function markEmailAsSent(queueId: string): Promise<void> {
  const { error } = await supabase
    .from('email_queue')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', queueId);

  if (error) throw error;
}

export async function markEmailAsFailed(queueId: string, errorMessage: string): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('email_queue')
    .select('attempts, max_attempts')
    .eq('id', queueId)
    .single();

  if (fetchError) throw fetchError;

  const newAttempts = (current?.attempts || 0) + 1;
  const maxAttempts = current?.max_attempts || 3;

  const { error } = await supabase
    .from('email_queue')
    .update({
      status: newAttempts >= maxAttempts ? 'failed' : 'pending',
      error_message: errorMessage,
      attempts: newAttempts
    })
    .eq('id', queueId);

  if (error) throw error;
}

export async function cancelScheduledEmail(queueId: string): Promise<void> {
  const { error } = await supabase
    .from('email_queue')
    .update({ status: 'cancelled' })
    .eq('id', queueId);

  if (error) throw error;
}

// =====================================================
// EMAIL LOGS
// =====================================================

export async function logEmailSent(
  recipientEmail: string,
  subject: string,
  templateSlug: string,
  status: 'sent' | 'failed',
  errorMessage?: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  const { data, error } = await supabase
    .from('email_logs')
    .insert({
      recipient_email: recipientEmail,
      subject,
      template_slug: templateSlug,
      status,
      error_message: errorMessage,
      metadata
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function fetchEmailLogs(limit: number = 100): Promise<EmailLog[]> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getEmailLogsByRecipient(email: string): Promise<EmailLog[]> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('recipient_email', email)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// =====================================================
// NOTIFICATION PREFERENCES
// =====================================================

export async function getNotificationPreferences(email: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function upsertNotificationPreferences(
  email: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_email: email,
      ...preferences
    });

  if (error) throw error;
}

// =====================================================
// AUTOMATED REMINDERS
// =====================================================

export async function createReminder(reminder: Partial<AutomatedReminder>): Promise<string> {
  const { data, error } = await supabase
    .from('automated_reminders')
    .insert(reminder)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function fetchPendingReminders(): Promise<AutomatedReminder[]> {
  const { data, error } = await supabase
    .from('automated_reminders')
    .select('*')
    .eq('status', 'pending')
    .lte('remind_at', new Date().toISOString())
    .order('remind_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function markReminderAsSent(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('automated_reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', reminderId);

  if (error) throw error;
}

export async function cancelReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('automated_reminders')
    .update({ status: 'cancelled' })
    .eq('id', reminderId);

  if (error) throw error;
}

// =====================================================
// QUICK AUTOMATION HELPERS
// =====================================================

/**
 * Automatically trigger welcome sequence when inquiry is submitted
 */
export async function triggerWelcomeSequence(
  customerName: string,
  customerEmail: string,
  inquiryId: string
): Promise<void> {
  await triggerEmailSequence(
    'Inquiry Follow-up',
    customerEmail,
    customerName,
    'inquiry',
    inquiryId
  );
}

/**
 * Schedule payment reminder
 */
export async function schedulePaymentReminder(
  customerName: string,
  customerEmail: string,
  serviceType: string,
  amount: string,
  dueDate: string,
  bookingId: string
): Promise<string> {
  // Calculate remind date (1 day before due date)
  const remindDate = new Date(dueDate);
  remindDate.setDate(remindDate.getDate() - 1);

  return await createReminder({
    reminder_type: 'payment_due',
    recipient_email: customerEmail,
    recipient_name: customerName,
    subject: `Payment Reminder - ${serviceType}`,
    message: `Hi ${customerName}, your payment of ${amount} for ${serviceType} is due on ${dueDate}.`,
    related_entity_type: 'booking',
    related_entity_id: bookingId,
    remind_at: remindDate.toISOString(),
    status: 'pending'
  });
}

/**
 * Send thank you email after project completion
 */
export async function sendThankYouEmail(
  customerName: string,
  customerEmail: string,
  serviceType: string,
  projectId: string
): Promise<string> {
  return await scheduleEmail(
    customerEmail,
    customerName,
    'thankyou-completed',
    { customer_name: customerName, service_type: serviceType },
    0, // Send immediately
    'project',
    projectId
  );
}

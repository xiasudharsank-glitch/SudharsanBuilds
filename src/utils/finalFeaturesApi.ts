// =====================================================
// FINAL FEATURES API
// Comments, newsletter, forms, health, backups, checklist
// =====================================================

import { supabase } from '../services/supabaseClient';

// =====================================================
// TYPES
// =====================================================

export interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  parent_id?: string;
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  likes_count: number;
  created_at: string;
  approved_at?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'confirmed' | 'unsubscribed' | 'bounced';
  confirmed_at?: string;
  subscribed_at: string;
  tags: string[];
}

export interface DynamicForm {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: any[];
  settings: Record<string, any>;
  is_active: boolean;
  submissions_count: number;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  status: 'new' | 'read' | 'replied' | 'archived' | 'spam';
  ip_address?: string;
  created_at: string;
}

export interface HealthCheck {
  id: string;
  check_type: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message?: string;
  metrics: Record<string, any>;
  checked_at: string;
}

export interface ProductionChecklistItem {
  id: string;
  category: string;
  item_key: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_completed: boolean;
  is_required: boolean;
  completed_at?: string;
  notes?: string;
}

export interface ProductionReadiness {
  score: number;
  total: number;
  completed: number;
  required_total: number;
  required_completed: number;
  is_production_ready: boolean;
}

// =====================================================
// COMMENTS API
// =====================================================

export async function getComments(
  entityType: string,
  entityId: string,
  status: string = 'approved'
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data || [];
}

export async function createComment(comment: Partial<Comment>): Promise<string | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  return data?.id || null;
}

export async function approveComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'admin'
    })
    .eq('id', id);

  return !error;
}

export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  return !error;
}

// =====================================================
// NEWSLETTER API
// =====================================================

export async function subscribeNewsletter(
  email: string,
  name?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert([{
      email,
      name,
      status: 'pending',
      source: 'website'
    }]);

  if (error) {
    console.error('Error subscribing:', error);
    return false;
  }

  return true;
}

export async function getNewsletterSubscribers(
  status?: string
): Promise<NewsletterSubscriber[]> {
  let query = supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }

  return data || [];
}

export async function confirmSubscription(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    })
    .eq('confirmation_token', token);

  return !error;
}

export async function unsubscribeNewsletter(email: string): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    })
    .eq('email', email);

  return !error;
}

// =====================================================
// DYNAMIC FORMS API
// =====================================================

export async function getForms(): Promise<DynamicForm[]> {
  const { data, error } = await supabase
    .from('dynamic_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error);
    return [];
  }

  return data || [];
}

export async function getForm(id: string): Promise<DynamicForm | null> {
  const { data, error } = await supabase
    .from('dynamic_forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching form:', error);
    return null;
  }

  return data;
}

export async function submitForm(
  formId: string,
  data: Record<string, any>
): Promise<boolean> {
  const { error } = await supabase
    .from('form_submissions')
    .insert([{
      form_id: formId,
      data,
      status: 'new'
    }]);

  if (error) {
    console.error('Error submitting form:', error);
    return false;
  }

  // Increment submission count
  await supabase.rpc('increment', {
    row_id: formId,
    table_name: 'dynamic_forms',
    column_name: 'submissions_count'
  });

  return true;
}

export async function getFormSubmissions(
  formId: string,
  status?: string
): Promise<FormSubmission[]> {
  let query = supabase
    .from('form_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// SOCIAL SHARING API
// =====================================================

export async function trackShare(
  entityType: string,
  entityId: string,
  platform: string,
  url: string
): Promise<boolean> {
  const { error } = await supabase
    .from('social_shares')
    .insert([{
      entity_type: entityType,
      entity_id: entityId,
      platform,
      url
    }]);

  return !error;
}

export async function getShareCount(
  entityType: string,
  entityId: string,
  platform?: string
): Promise<number> {
  const { data, error } = await supabase.rpc('get_share_count', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_platform: platform || null
  });

  if (error) {
    console.error('Error getting share count:', error);
    return 0;
  }

  return data || 0;
}

// =====================================================
// HEALTH MONITORING API
// =====================================================

export async function runHealthCheck(checkType: string): Promise<any> {
  const { data, error } = await supabase.rpc('run_health_check', {
    check_name: checkType
  });

  if (error) {
    console.error('Error running health check:', error);
    return null;
  }

  return data;
}

export async function getHealthChecks(
  checkType?: string,
  limit: number = 10
): Promise<HealthCheck[]> {
  let query = supabase
    .from('health_checks')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(limit);

  if (checkType) {
    query = query.eq('check_type', checkType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching health checks:', error);
    return [];
  }

  return data || [];
}

export async function getLatestHealthStatus(): Promise<Record<string, HealthCheck>> {
  const checkTypes = ['database', 'storage', 'performance', 'security'];
  const results: Record<string, HealthCheck> = {};

  for (const type of checkTypes) {
    const checks = await getHealthChecks(type, 1);
    if (checks.length > 0) {
      results[type] = checks[0];
    }
  }

  return results;
}

// =====================================================
// PRODUCTION CHECKLIST API
// =====================================================

export async function getProductionChecklist(): Promise<ProductionChecklistItem[]> {
  const { data, error } = await supabase
    .from('production_checklist')
    .select('*')
    .order('priority DESC, category, title');

  if (error) {
    console.error('Error fetching checklist:', error);
    return [];
  }

  return data || [];
}

export async function updateChecklistItem(
  id: string,
  isCompleted: boolean,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('production_checklist')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? 'admin' : null,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  return !error;
}

export async function getProductionReadiness(): Promise<ProductionReadiness | null> {
  const { data, error } = await supabase.rpc('get_production_readiness');

  if (error) {
    console.error('Error getting production readiness:', error);
    return null;
  }

  return data;
}

// =====================================================
// BACKUP API
// =====================================================

export async function createBackup(
  backupType: 'full' | 'database' | 'media' | 'configuration'
): Promise<string | null> {
  const { data, error } = await supabase
    .from('system_backups')
    .insert([{
      backup_type: backupType,
      status: 'in_progress',
      created_by: 'admin'
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating backup:', error);
    return null;
  }

  return data?.id || null;
}

export async function getBackups(limit: number = 20): Promise<any[]> {
  const { data, error } = await supabase
    .from('system_backups')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching backups:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function getPriorityColor(priority: string): string {
  const colors = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
}

export function getCategoryIcon(category: string): string {
  const icons = {
    seo: '=
',
    performance: '�',
    security: '=',
    content: '=�',
    functionality: '�'
  };
  return icons[category as keyof typeof icons] || '=�';
}

import { supabase } from '../lib/supabase';

// =====================================================
// NOTIFICATIONS, ANALYTICS & MONITORING API
// All-in-one API for notifications, tracking, funnels, A/B tests, performance
// =====================================================

// TYPES
export interface Notification {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'inquiry' | 'booking' | 'payment' | 'project';
  icon?: string;
  action_url?: string;
  action_text?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  is_archived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
  archived_at?: string;
}

export interface NotificationSubscription {
  id: string;
  user_email: string;
  channel: 'email' | 'browser_push' | 'in_app' | 'sms';
  subscription_data?: any;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_email?: string;
  session_id?: string;
  action_type: string;
  action_data: Record<string, any>;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  description?: string;
  steps: Array<{ name: string; order: number }>;
  is_active: boolean;
  created_at: string;
}

export interface FunnelEvent {
  id: string;
  funnel_id: string;
  session_id: string;
  step_name: string;
  step_order: number;
  completed_at: string;
  metadata: Record<string, any>;
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description?: string;
  variants: Array<{ name: string; config: any }>;
  traffic_split: Record<string, number>;
  metric_to_track: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  winner_variant?: string;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  metric_type: 'page_load' | 'api_response' | 'ttfb' | 'fcp' | 'lcp';
  metric_value: number;
  page_url?: string;
  api_endpoint?: string;
  user_agent?: string;
  connection_type?: string;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  page_url?: string;
  user_agent?: string;
  session_id?: string;
  severity: 'warning' | 'error' | 'critical';
  is_resolved: boolean;
  created_at: string;
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export async function getUserNotifications(userEmail: string, unreadOnly: boolean = false): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createNotification(notification: Partial<Notification>): Promise<string> {
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_email: notification.user_email,
    p_title: notification.title,
    p_message: notification.message,
    p_type: notification.type || 'info',
    p_action_url: notification.action_url,
    p_related_type: notification.related_entity_type,
    p_related_id: notification.related_entity_id
  });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId
  });
  if (error) throw error;
}

export async function markAllNotificationsAsRead(userEmail: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_email', userEmail)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// Real-time notifications subscription
export function subscribeToNotifications(userEmail: string, callback: (notification: Notification) => void) {
  const channel = supabase
    .channel(`notifications:${userEmail}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_email=eq.${userEmail}`
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =====================================================
// ACTIVITY TRACKING
// =====================================================

export async function trackActivity(
  actionType: string,
  actionData: Record<string, any> = {},
  sessionId?: string,
  userEmail?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('track_activity', {
    p_action_type: actionType,
    p_action_data: actionData,
    p_session_id: sessionId,
    p_user_email: userEmail
  });

  if (error) throw error;
  return data;
}

export async function getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getActivityByType(actionType: string, limit: number = 100): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('action_type', actionType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// =====================================================
// CONVERSION FUNNELS
// =====================================================

export async function getConversionFunnels(): Promise<ConversionFunnel[]> {
  const { data, error } = await supabase
    .from('conversion_funnels')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function trackFunnelStep(
  funnelId: string,
  sessionId: string,
  stepName: string,
  stepOrder: number,
  metadata: Record<string, any> = {}
): Promise<string> {
  const { data, error } = await supabase
    .from('funnel_events')
    .insert({
      funnel_id: funnelId,
      session_id: sessionId,
      step_name: stepName,
      step_order: stepOrder,
      metadata
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getFunnelAnalytics(funnelId: string): Promise<any> {
  const { data, error } = await supabase
    .from('funnel_events')
    .select('step_name, step_order, session_id')
    .eq('funnel_id', funnelId);

  if (error) throw error;

  // Calculate conversion rates
  const stepCounts: Record<string, Set<string>> = {};
  data?.forEach(event => {
    if (!stepCounts[event.step_name]) {
      stepCounts[event.step_name] = new Set();
    }
    stepCounts[event.step_name].add(event.session_id);
  });

  return Object.entries(stepCounts).map(([step, sessions]) => ({
    step,
    sessions: sessions.size
  }));
}

// =====================================================
// A/B TESTING
// =====================================================

export async function getActiveExperiments(): Promise<ABTestExperiment[]> {
  const { data, error } = await supabase
    .from('ab_test_experiments')
    .select('*')
    .eq('status', 'running')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function assignVariant(experimentId: string, sessionId: string): Promise<string> {
  // Get experiment
  const { data: experiment, error: expError } = await supabase
    .from('ab_test_experiments')
    .select('variants, traffic_split')
    .eq('id', experimentId)
    .single();

  if (expError) throw expError;

  // Randomly assign based on traffic split
  const random = Math.random();
  let cumulative = 0;
  let selectedVariant = 'control';

  for (const [variant, percentage] of Object.entries(experiment.traffic_split as Record<string, number>)) {
    cumulative += percentage / 100;
    if (random <= cumulative) {
      selectedVariant = variant;
      break;
    }
  }

  // Track assignment
  await trackABTestEvent(experimentId, sessionId, selectedVariant, 'view');

  return selectedVariant;
}

export async function trackABTestEvent(
  experimentId: string,
  sessionId: string,
  variantName: string,
  eventType: 'view' | 'conversion' | 'bounce',
  eventValue?: number
): Promise<string> {
  const { data, error } = await supabase
    .from('ab_test_events')
    .insert({
      experiment_id: experimentId,
      session_id: sessionId,
      variant_name: variantName,
      event_type: eventType,
      event_value: eventValue
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getABTestResults(experimentId: string): Promise<any> {
  const { data, error } = await supabase
    .from('ab_test_events')
    .select('variant_name, event_type, event_value')
    .eq('experiment_id', experimentId);

  if (error) throw error;

  // Calculate metrics per variant
  const variantStats: Record<string, any> = {};
  data?.forEach(event => {
    if (!variantStats[event.variant_name]) {
      variantStats[event.variant_name] = { views: 0, conversions: 0, bounces: 0 };
    }
    variantStats[event.variant_name][event.event_type + 's']++;
  });

  return Object.entries(variantStats).map(([variant, stats]) => ({
    variant,
    ...stats,
    conversionRate: stats.views > 0 ? (stats.conversions / stats.views * 100).toFixed(2) : 0
  }));
}

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export async function trackPerformanceMetric(
  metricType: 'page_load' | 'api_response' | 'ttfb' | 'fcp' | 'lcp',
  metricValue: number,
  pageUrl?: string,
  apiEndpoint?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('performance_metrics')
    .insert({
      metric_type: metricType,
      metric_value: metricValue,
      page_url: pageUrl,
      api_endpoint: apiEndpoint,
      user_agent: navigator.userAgent,
      connection_type: (navigator as any).connection?.effectiveType
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getPerformanceMetrics(metricType?: string, limit: number = 100): Promise<PerformanceMetric[]> {
  let query = supabase
    .from('performance_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAveragePerformance(metricType: string): Promise<number> {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('metric_value')
    .eq('metric_type', metricType);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const sum = data.reduce((acc, m) => acc + m.metric_value, 0);
  return sum / data.length;
}

// =====================================================
// ERROR LOGGING
// =====================================================

export async function logError(
  errorType: string,
  errorMessage: string,
  stackTrace?: string,
  severity: 'warning' | 'error' | 'critical' = 'error'
): Promise<string> {
  const { data, error } = await supabase
    .from('error_logs')
    .insert({
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      session_id: sessionStorage.getItem('session_id'),
      severity
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getErrorLogs(limit: number = 100): Promise<ErrorLog[]> {
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function resolveError(errorId: string): Promise<void> {
  const { error } = await supabase
    .from('error_logs')
    .update({ is_resolved: true })
    .eq('id', errorId);

  if (error) throw error;
}

// =====================================================
// BROWSER UTILITIES
// =====================================================

// Track page view
export async function trackPageView(pageUrl: string) {
  return trackActivity('page_view', { page_url: pageUrl }, sessionStorage.getItem('session_id') || undefined);
}

// Track button click
export async function trackClick(elementId: string, label?: string) {
  return trackActivity('click', { element_id: elementId, label }, sessionStorage.getItem('session_id') || undefined);
}

// Auto-track performance on page load
export function autoTrackPerformance() {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          trackPerformanceMetric('page_load', perfData.loadEventEnd - perfData.fetchStart, window.location.href);
          trackPerformanceMetric('ttfb', perfData.responseStart - perfData.requestStart, window.location.href);
        }

        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                  trackPerformanceMetric('lcp', entry.startTime, window.location.href);
                } else if (entry.entryType === 'first-contentful-paint') {
                  trackPerformanceMetric('fcp', entry.startTime, window.location.href);
                }
              }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint', 'paint'] });
          } catch (e) {
            console.warn('PerformanceObserver not fully supported');
          }
        }
      }, 0);
    });
  }
}

// Global error handler
export function setupGlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logError(
        'javascript_error',
        event.message,
        event.error?.stack,
        'error'
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      logError(
        'unhandled_promise_rejection',
        event.reason?.message || String(event.reason),
        event.reason?.stack,
        'warning'
      );
    });
  }
}

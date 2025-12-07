import { supabase } from '../services/supabaseClient';

// Types
export interface FormAnalyticsEvent {
  id: string;
  session_id: string;
  form_name: string;
  event_type: 'view' | 'start' | 'field_change' | 'error' | 'submit' | 'success' | 'abandon';
  field_name?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface FormSession {
  id: string;
  session_id: string;
  form_name: string;
  started_at: string;
  completed_at?: string;
  is_converted: boolean;
  time_to_complete_seconds?: number;
  device_type?: string;
  browser?: string;
  referrer?: string;
  ip_address?: string;
}

export interface ConversionFunnel {
  form_name: string;
  views: number;
  starts: number;
  submits: number;
  successes: number;
  view_to_start_rate: number;
  conversion_rate: number;
  abandonment_rate: number;
}

export interface DailyFormStats {
  date: string;
  form_name: string;
  views: number;
  starts: number;
  conversions: number;
}

export interface FormError {
  form_name: string;
  field_name: string;
  error_message: string;
  error_count: number;
  last_occurred: string;
}

export interface PerformanceMetrics {
  form_name: string;
  total_sessions: number;
  conversions: number;
  conversion_rate: number;
  avg_completion_time_seconds: number;
  median_completion_time_seconds: number;
  mobile_sessions: number;
  desktop_sessions: number;
  tablet_sessions: number;
}

export interface FieldAnalytics {
  form_name: string;
  field_name: string;
  interactions: number;
  errors: number;
  error_rate: number;
}

// Generate unique session ID (stores in localStorage)
export function getSessionId(): string {
  let sessionId = localStorage.getItem('form_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('form_session_id', sessionId);
  }
  return sessionId;
}

// Get device type
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Get browser name
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

// Track form event
export async function trackFormEvent(
  formName: string,
  eventType: FormAnalyticsEvent['event_type'],
  options?: {
    fieldName?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('form_analytics')
      .insert({
        session_id: sessionId,
        form_name: formName,
        event_type: eventType,
        field_name: options?.fieldName,
        error_message: options?.errorMessage,
        metadata: {
          ...options?.metadata,
          device_type: getDeviceType(),
          browser: getBrowser(),
          referrer: document.referrer,
          url: window.location.href
        }
      });

    if (error) {
      console.error('Error tracking form event:', error);
    }
  } catch (error) {
    console.error('Error tracking form event:', error);
  }
}

// Start form session
export async function startFormSession(formName: string): Promise<void> {
  try {
    const sessionId = getSessionId();

    // Check if session already exists
    const { data: existing } = await supabase
      .from('form_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('form_name', formName)
      .single();

    if (existing) return; // Session already started

    const { error } = await supabase
      .from('form_sessions')
      .insert({
        session_id: sessionId,
        form_name: formName,
        device_type: getDeviceType(),
        browser: getBrowser(),
        referrer: document.referrer
      });

    if (error) {
      console.error('Error starting form session:', error);
    }
  } catch (error) {
    console.error('Error starting form session:', error);
  }
}

// Complete form session
export async function completeFormSession(
  formName: string,
  isConverted: boolean
): Promise<void> {
  try {
    const sessionId = getSessionId();

    // Get session start time
    const { data: session } = await supabase
      .from('form_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .eq('form_name', formName)
      .single();

    if (!session) return;

    const completedAt = new Date();
    const startedAt = new Date(session.started_at);
    const timeToComplete = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    const { error } = await supabase
      .from('form_sessions')
      .update({
        completed_at: completedAt.toISOString(),
        is_converted: isConverted,
        time_to_complete_seconds: timeToComplete
      })
      .eq('session_id', sessionId)
      .eq('form_name', formName);

    if (error) {
      console.error('Error completing form session:', error);
    }

    // Clear session ID after successful conversion
    if (isConverted) {
      localStorage.removeItem('form_session_id');
    }
  } catch (error) {
    console.error('Error completing form session:', error);
  }
}

// Admin: Fetch conversion funnel data
export async function fetchConversionFunnel(): Promise<ConversionFunnel[]> {
  const { data, error } = await supabase
    .from('form_conversion_funnel')
    .select('*')
    .order('views', { ascending: false });

  if (error) {
    console.error('Error fetching conversion funnel:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch daily form stats
export async function fetchDailyFormStats(days: number = 30): Promise<DailyFormStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_form_stats')
    .select('*')
    .gte('date', startDate.toISOString())
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch form errors
export async function fetchFormErrors(): Promise<FormError[]> {
  const { data, error } = await supabase
    .from('form_errors')
    .select('*')
    .order('error_count', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching form errors:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch performance metrics
export async function fetchPerformanceMetrics(): Promise<PerformanceMetrics[]> {
  const { data, error } = await supabase
    .from('form_performance_metrics')
    .select('*')
    .order('total_sessions', { ascending: false });

  if (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch field analytics
export async function fetchFieldAnalytics(formName?: string): Promise<FieldAnalytics[]> {
  let query = supabase
    .from('field_analytics')
    .select('*')
    .order('error_rate', { ascending: false });

  if (formName) {
    query = query.eq('form_name', formName);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching field analytics:', error);
    throw error;
  }

  return data || [];
}

// Utility: Format completion time
export function formatCompletionTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Utility: Get conversion rate color
export function getConversionRateColor(rate: number): string {
  if (rate >= 30) return 'text-green-400';
  if (rate >= 15) return 'text-yellow-400';
  return 'text-red-400';
}

-- Create form analytics tables for tracking user interactions
-- Tracks form views, starts, submissions, errors, and conversions

-- Create form_analytics table for individual events
CREATE TABLE IF NOT EXISTS form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL, -- Track unique sessions
  form_name TEXT NOT NULL, -- contact, inquiry, payment, etc.
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'start', 'field_change', 'error', 'submit', 'success', 'abandon')),
  field_name TEXT, -- Which field triggered the event
  error_message TEXT, -- For error events
  metadata JSONB DEFAULT '{}', -- Additional context (device, browser, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create form_sessions table to track unique sessions
CREATE TABLE IF NOT EXISTS form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  form_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_converted BOOLEAN DEFAULT false,
  time_to_complete_seconds INTEGER, -- Time from start to completion
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  referrer TEXT,
  ip_address TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_analytics_session_id ON form_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_name ON form_analytics(form_name);
CREATE INDEX IF NOT EXISTS idx_form_analytics_event_type ON form_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_form_analytics_created_at ON form_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_form_sessions_form_name ON form_sessions(form_name);
CREATE INDEX IF NOT EXISTS idx_form_sessions_started_at ON form_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_form_sessions_is_converted ON form_sessions(is_converted);

-- Create view for form conversion funnel
CREATE OR REPLACE VIEW form_conversion_funnel AS
SELECT
  form_name,
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END) as views,
  COUNT(DISTINCT CASE WHEN event_type = 'start' THEN session_id END) as starts,
  COUNT(DISTINCT CASE WHEN event_type = 'submit' THEN session_id END) as submits,
  COUNT(DISTINCT CASE WHEN event_type = 'success' THEN session_id END) as successes,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'start' THEN session_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END), 0),
    2
  ) as view_to_start_rate,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'success' THEN session_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'start' THEN session_id END), 0),
    2
  ) as conversion_rate,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'abandon' THEN session_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'start' THEN session_id END), 0),
    2
  ) as abandonment_rate
FROM form_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY form_name;

-- Create view for daily form stats
CREATE OR REPLACE VIEW daily_form_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  form_name,
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END) as views,
  COUNT(DISTINCT CASE WHEN event_type = 'start' THEN session_id END) as starts,
  COUNT(DISTINCT CASE WHEN event_type = 'success' THEN session_id END) as conversions
FROM form_analytics
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at), form_name
ORDER BY date DESC, form_name;

-- Create view for error tracking
CREATE OR REPLACE VIEW form_errors AS
SELECT
  form_name,
  field_name,
  error_message,
  COUNT(*) as error_count,
  MAX(created_at) as last_occurred
FROM form_analytics
WHERE event_type = 'error'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY form_name, field_name, error_message
ORDER BY error_count DESC;

-- Create view for form performance metrics
CREATE OR REPLACE VIEW form_performance_metrics AS
SELECT
  fs.form_name,
  COUNT(*) as total_sessions,

  COUNT(*) FILTER (WHERE fs.is_converted = true) as conversions,

  -- conversion_rate: cast to numeric before rounding
  ROUND(
    (
      COUNT(*) FILTER (WHERE fs.is_converted = true)
      * 100.0
      / NULLIF(COUNT(*), 0)
    )::numeric,
    2
  ) as conversion_rate,

  -- average completion time: cast to numeric before rounding
  ROUND(
    AVG(fs.time_to_complete_seconds)::numeric,
    0
  ) as avg_completion_time_seconds,

  -- median completion time: cast percentile result to numeric before rounding
  ROUND(
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fs.time_to_complete_seconds)::numeric,
    0
  ) as median_completion_time_seconds
FROM form_sessions fs
GROUP BY fs.form_name;


-- Create view for field-level analytics
CREATE OR REPLACE VIEW field_analytics AS
SELECT
  form_name,
  field_name,
  COUNT(*) FILTER (WHERE event_type = 'field_change') as interactions,
  COUNT(*) FILTER (WHERE event_type = 'error') as errors,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'error') * 100.0 /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'field_change'), 0),
    2
  ) as error_rate
FROM form_analytics
WHERE field_name IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY form_name, field_name
ORDER BY form_name, error_rate DESC;

-- Enable RLS
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert analytics (for tracking)
CREATE POLICY "Anyone can insert form analytics" ON form_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert form sessions" ON form_sessions
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update their own sessions
CREATE POLICY "Anyone can update form sessions" ON form_sessions
  FOR UPDATE USING (true);

-- Authenticated users (admins) can view all analytics
CREATE POLICY "Authenticated users can view all form analytics" ON form_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all form sessions" ON form_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions on views
GRANT SELECT ON form_conversion_funnel TO authenticated;
GRANT SELECT ON daily_form_stats TO authenticated;
GRANT SELECT ON form_errors TO authenticated;
GRANT SELECT ON form_performance_metrics TO authenticated;
GRANT SELECT ON field_analytics TO authenticated;

COMMENT ON TABLE form_analytics IS 'Individual form interaction events for analytics';
COMMENT ON TABLE form_sessions IS 'Unique form sessions with completion tracking';
COMMENT ON VIEW form_conversion_funnel IS 'Conversion funnel metrics for each form';
COMMENT ON VIEW daily_form_stats IS 'Daily form statistics for trend analysis';
COMMENT ON VIEW form_errors IS 'Most common form errors';
COMMENT ON VIEW form_performance_metrics IS 'Overall form performance metrics';
COMMENT ON VIEW field_analytics IS 'Field-level interaction and error analytics';

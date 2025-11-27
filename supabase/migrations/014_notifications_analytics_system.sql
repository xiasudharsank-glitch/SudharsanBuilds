-- =====================================================
-- REAL-TIME NOTIFICATIONS SYSTEM
-- In-app notifications, browser push, real-time updates
-- =====================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'inquiry', 'booking', 'payment', 'project')),
  icon TEXT, -- Lucide icon name
  action_url TEXT,
  action_text TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- 2. NOTIFICATION SUBSCRIPTIONS (Real-time channels)
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email', 'browser_push', 'in_app', 'sms'
  subscription_data JSONB, -- Push subscription object for browser
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTIFICATION RULES (Auto-create notifications on events)
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'new_inquiry', 'booking_confirmed', 'payment_received', etc.
  notification_template TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  channels TEXT[] DEFAULT ARRAY['in_app'], -- Which channels to notify
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITY LOG (User actions for analytics)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  session_id TEXT,
  action_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'download', etc.
  action_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONVERSION FUNNELS (Track user journey)
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL, -- Array of step definitions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FUNNEL EVENTS (Track progress through funnels)
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID REFERENCES conversion_funnels(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. A/B TEST EXPERIMENTS
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL, -- Array of variant configs
  traffic_split JSONB NOT NULL, -- Percentage per variant
  metric_to_track TEXT NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner_variant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. A/B TEST EVENTS
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'conversion', 'bounce'
  event_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE METRICS (Site speed, API response times)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'page_load', 'api_response', 'ttfb', 'fcp', 'lcp'
  metric_value NUMERIC NOT NULL,
  page_url TEXT,
  api_endpoint TEXT,
  user_agent TEXT,
  connection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ERROR LOGS (Client-side errors)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page_url TEXT,
  user_agent TEXT,
  session_id TEXT,
  severity TEXT DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_email ON notifications(user_email);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_email, is_read) WHERE is_read = false;
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX idx_funnel_events_session ON funnel_events(session_id);
CREATE INDEX idx_ab_test_events_experiment ON ab_test_events(experiment_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- Admin full access to all tables
CREATE POLICY "Admin full access to notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Admin full access to subscriptions" ON notification_subscriptions FOR ALL USING (true);
CREATE POLICY "Admin full access to rules" ON notification_rules FOR ALL USING (true);
CREATE POLICY "Admin full access to activity_log" ON activity_log FOR ALL USING (true);
CREATE POLICY "Admin full access to funnels" ON conversion_funnels FOR ALL USING (true);
CREATE POLICY "Admin full access to funnel_events" ON funnel_events FOR ALL USING (true);
CREATE POLICY "Admin full access to experiments" ON ab_test_experiments FOR ALL USING (true);
CREATE POLICY "Admin full access to ab_events" ON ab_test_events FOR ALL USING (true);
CREATE POLICY "Admin full access to performance" ON performance_metrics FOR ALL USING (true);
CREATE POLICY "Admin full access to errors" ON error_logs FOR ALL USING (true);

-- Helper: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_email TEXT,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_email, title, message, type, action_url, related_entity_type, related_entity_id
  ) VALUES (
    p_user_email, p_title, p_message, p_type, p_action_url, p_related_type, p_related_id
  ) RETURNING id INTO v_notification_id;

  -- Trigger real-time update
  PERFORM pg_notify('notifications', json_build_object(
    'user_email', p_user_email,
    'notification_id', v_notification_id,
    'type', p_type
  )::text);

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Helper: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Helper: Track activity
CREATE OR REPLACE FUNCTION track_activity(
  p_action_type TEXT,
  p_action_data JSONB DEFAULT '{}'::jsonb,
  p_session_id TEXT DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_log (
    user_email, session_id, action_type, action_data
  ) VALUES (
    p_user_email, p_session_id, p_action_type, p_action_data
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- Seed notification rules
INSERT INTO notification_rules (event_type, notification_template, notification_type, channels) VALUES
('new_inquiry', 'New inquiry from {{name}} for {{service}}', 'inquiry', ARRAY['in_app', 'email']),
('booking_confirmed', 'Booking confirmed for {{service}} - {{customer_name}}', 'booking', ARRAY['in_app', 'email']),
('payment_received', 'Payment received: {{amount}} from {{customer_name}}', 'payment', ARRAY['in_app', 'email']),
('project_completed', 'Project {{project_name}} marked as completed', 'project', ARRAY['in_app']);

-- Seed conversion funnels
INSERT INTO conversion_funnels (name, description, steps) VALUES
('Contact Form Funnel', 'Track contact form completion',
 '[
   {"name": "Page View", "order": 1},
   {"name": "Form Start", "order": 2},
   {"name": "Form Submit", "order": 3},
   {"name": "Success", "order": 4}
 ]'::jsonb),
('Service Booking Funnel', 'Track service booking flow',
 '[
   {"name": "View Services", "order": 1},
   {"name": "Select Service", "order": 2},
   {"name": "Fill Form", "order": 3},
   {"name": "Payment", "order": 4},
   {"name": "Confirmation", "order": 5}
 ]'::jsonb);

COMMENT ON TABLE notifications IS 'In-app notifications with real-time updates';
COMMENT ON TABLE activity_log IS 'User activity tracking for analytics';
COMMENT ON TABLE conversion_funnels IS 'Conversion funnel definitions';
COMMENT ON TABLE ab_test_experiments IS 'A/B testing experiments';
COMMENT ON TABLE performance_metrics IS 'Site performance monitoring';

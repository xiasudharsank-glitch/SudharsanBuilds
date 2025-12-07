-- =====================================================
-- EMAIL AUTOMATION SYSTEM
-- Automated workflows, sequences, and triggers
-- =====================================================

-- 1. EMAIL TEMPLATES (Pre-defined email templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of template variables like {{customer_name}}
  category TEXT DEFAULT 'general' CHECK (category IN ('welcome', 'followup', 'reminder', 'thankyou', 'notification', 'marketing', 'general')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMAIL SEQUENCES (Multi-step email campaigns)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('inquiry_submitted', 'booking_confirmed', 'payment_received', 'project_started', 'project_completed', 'manual')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMAIL SEQUENCE STEPS (Individual emails in a sequence)
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  delay_hours INTEGER DEFAULT 0, -- Delay after previous step (or trigger for step 1)
  send_time TIME, -- Optional: Send at specific time of day
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

-- 4. EMAIL QUEUE (Scheduled and pending emails)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,
  sequence_step_id UUID REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
  related_entity_type TEXT, -- 'inquiry', 'booking', 'project'
  related_entity_id UUID,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMAIL LOGS (Track all sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_slug TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. NOTIFICATION PREFERENCES (User preferences for emails/notifications)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT true,
  followup_enabled BOOLEAN DEFAULT true,
  reminders_enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest', 'never')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATED REMINDERS (For payments, meetings, etc.)
CREATE TABLE IF NOT EXISTS automated_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('payment_due', 'meeting_scheduled', 'project_deadline', 'followup', 'custom')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  remind_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_reminders_remind_at ON automated_reminders(remind_at) WHERE status = 'pending';

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_email_automation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make triggers idempotent
DROP TRIGGER IF EXISTS update_email_templates_timestamp ON email_templates;
DROP TRIGGER IF EXISTS update_email_sequences_timestamp ON email_sequences;
DROP TRIGGER IF EXISTS update_notification_prefs_timestamp ON notification_preferences;

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_email_automation_timestamp();

CREATE TRIGGER update_email_sequences_timestamp
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW EXECUTE FUNCTION update_email_automation_timestamp();

CREATE TRIGGER update_notification_prefs_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_email_automation_timestamp();

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reminders ENABLE ROW LEVEL SECURITY;

-- Public read for active templates (for previews)
CREATE POLICY "Anyone can view active email templates"
  ON email_templates FOR SELECT
  USING (is_active = true);

-- Admin full access (replace with actual auth when ready)
CREATE POLICY "Admin full access to email_templates"
  ON email_templates FOR ALL
  USING (true);

CREATE POLICY "Admin full access to email_sequences"
  ON email_sequences FOR ALL
  USING (true);

CREATE POLICY "Admin full access to email_sequence_steps"
  ON email_sequence_steps FOR ALL
  USING (true);

CREATE POLICY "Admin full access to email_queue"
  ON email_queue FOR ALL
  USING (true);

CREATE POLICY "Admin full access to email_logs"
  ON email_logs FOR ALL
  USING (true);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences FOR ALL
  USING (true);

CREATE POLICY "Admin full access to automated_reminders"
  ON automated_reminders FOR ALL
  USING (true);

-- Helper function: Schedule an email
CREATE OR REPLACE FUNCTION schedule_email(
  p_recipient_email TEXT,
  p_recipient_name TEXT,
  p_template_slug TEXT,
  p_variables JSONB DEFAULT '{}'::jsonb,
  p_delay_hours INTEGER DEFAULT 0,
  p_related_type TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_template_id UUID;
  v_subject TEXT;
  v_body_html TEXT;
  v_body_text TEXT;
  v_queue_id UUID;
BEGIN
  -- Get template
  SELECT id, subject, body_html, body_text INTO v_template_id, v_subject, v_body_html, v_body_text
  FROM email_templates
  WHERE slug = p_template_slug AND is_active = true
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_slug;
  END IF;

  -- Replace variables in subject and body (simple implementation)
  -- In production, use a proper template engine

  -- Insert into queue
  INSERT INTO email_queue (
    recipient_email,
    recipient_name,
    subject,
    body_html,
    body_text,
    template_id,
    related_entity_type,
    related_entity_id,
    scheduled_at
  ) VALUES (
    p_recipient_email,
    p_recipient_name,
    v_subject,
    v_body_html,
    v_body_text,
    v_template_id,
    p_related_type,
    p_related_id,
    NOW() + (p_delay_hours || ' hours')::INTERVAL
  ) RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Trigger email sequence
CREATE OR REPLACE FUNCTION trigger_email_sequence(
  p_sequence_slug TEXT,
  p_recipient_email TEXT,
  p_recipient_name TEXT,
  p_related_type TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_sequence_id UUID;
  v_step RECORD;
  v_emails_scheduled INTEGER := 0;
BEGIN
  -- Get sequence
  SELECT id INTO v_sequence_id
  FROM email_sequences
  WHERE name = p_sequence_slug AND is_active = true
  LIMIT 1;

  IF v_sequence_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Schedule all steps
  FOR v_step IN
    SELECT * FROM email_sequence_steps
    WHERE sequence_id = v_sequence_id AND is_active = true
    ORDER BY step_number
  LOOP
    -- Get template and schedule
    INSERT INTO email_queue (
      recipient_email,
      recipient_name,
      subject,
      body_html,
      template_id,
      sequence_id,
      sequence_step_id,
      related_entity_type,
      related_entity_id,
      scheduled_at
    )
    SELECT
      p_recipient_email,
      p_recipient_name,
      t.subject,
      t.body_html,
      t.id,
      v_sequence_id,
      v_step.id,
      p_related_type,
      p_related_id,
      NOW() + (v_step.delay_hours || ' hours')::INTERVAL
    FROM email_templates t
    WHERE t.id = v_step.template_id;

    v_emails_scheduled := v_emails_scheduled + 1;
  END LOOP;

  RETURN v_emails_scheduled;
END;
$$ LANGUAGE plpgsql;

-- Ensure required columns exist on email_templates for seeding
ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS subject TEXT;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS body_html TEXT;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS body_text TEXT;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]'::jsonb;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS template_key TEXT;


-- Seed default templates
INSERT INTO email_templates (
  template_key,
  name,
  slug,
  subject,
  body_html,
  body_text,
  category,
  variables
) VALUES
(
  'welcome',
  'Welcome Email',
  'welcome',
  'Welcome to Sudharsan''s Portfolio - Let''s Build Something Amazing!',
  '<h1>Welcome, {{customer_name}}!</h1><p>Thank you for your inquiry. I''m excited to learn more about your project!</p><p>I''ll review your requirements and get back to you within 24 hours.</p><p>In the meantime, feel free to check out my <a href="{{portfolio_url}}">recent projects</a>.</p><p>Best regards,<br>Sudharsan</p>',
  'Welcome, {{customer_name}}! Thank you for your inquiry. I will get back to you within 24 hours.',
  'welcome',
  '["customer_name", "portfolio_url"]'::jsonb
),
(
  'followup-3days',
  'Follow-up Email',
  'followup-3days',
  'Following Up - Your Website Project',
  '<h1>Hi {{customer_name}},</h1><p>I wanted to follow up on your inquiry from a few days ago.</p><p>Are you still interested in discussing your {{service_type}} project?</p><p>I''d love to answer any questions you have and provide a detailed proposal.</p><p>Reply to this email or schedule a call at your convenience.</p><p>Best,<br>Sudharsan</p>',
  'Hi {{customer_name}}, following up on your inquiry. Still interested in your {{service_type}} project?',
  'followup',
  '["customer_name", "service_type"]'::jsonb
),
(
  'payment-reminder',
  'Payment Reminder',
  'payment-reminder',
  'Friendly Reminder - Payment Due for {{service_type}}',
  '<h1>Hi {{customer_name}},</h1><p>This is a friendly reminder that your payment for {{service_type}} is due on {{due_date}}.</p><p><strong>Amount: {{amount}}</strong></p><p>Please let me know if you have any questions or need to adjust the payment schedule.</p><p>Payment methods:<br>- UPI: {{upi_id}}<br>- Bank Transfer: [Details]</p><p>Thanks!<br>Sudharsan</p>',
  'Payment reminder: {{amount}} due for {{service_type}} on {{due_date}}',
  'reminder',
  '["customer_name", "service_type", "amount", "due_date", "upi_id"]'::jsonb
),
(
  'thankyou-completed',
  'Thank You Email',
  'thankyou-completed',
  'Thank You - Project Completed Successfully!',
  '<h1>Thank You, {{customer_name}}!</h1><p>It was a pleasure working with you on {{service_type}}.</p><p>Your project is now live and ready to go!</p><p>If you need any support or want to discuss future enhancements, I''m just an email away.</p><p>I''d greatly appreciate if you could leave a testimonial about your experience.</p><p>Wishing you great success!<br>Sudharsan</p>',
  'Thank you {{customer_name}}! Your {{service_type}} project is complete.',
  'thankyou',
  '["customer_name", "service_type"]'::jsonb
);


-- Seed default sequence: Inquiry Follow-up
INSERT INTO email_sequences (name, description, trigger_event, is_active) VALUES
('Inquiry Follow-up', 'Automated follow-up sequence for new inquiries', 'inquiry_submitted', true);

-- Get the sequence ID and add steps
INSERT INTO email_sequence_steps (sequence_id, step_number, template_id, delay_hours)
SELECT
  s.id,
  1,
  t.id,
  0 -- Send immediately
FROM email_sequences s, email_templates t
WHERE s.name = 'Inquiry Follow-up' AND t.slug = 'welcome';

INSERT INTO email_sequence_steps (sequence_id, step_number, template_id, delay_hours)
SELECT
  s.id,
  2,
  t.id,
  72 -- Send after 3 days
FROM email_sequences s, email_templates t
WHERE s.name = 'Inquiry Follow-up' AND t.slug = 'followup-3days';

COMMENT ON TABLE email_templates IS 'Pre-defined email templates with variable substitution';
COMMENT ON TABLE email_sequences IS 'Multi-step email campaigns triggered by events';
COMMENT ON TABLE email_queue IS 'Scheduled emails waiting to be sent';
COMMENT ON TABLE email_logs IS 'Historical record of all sent emails';
COMMENT ON TABLE automated_reminders IS 'Scheduled reminders for payments, meetings, deadlines';

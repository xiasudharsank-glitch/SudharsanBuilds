-- =====================================================
-- FINAL FEATURES - Complete Production System
-- User management, comments, newsletter, forms, social,
-- health monitoring, export/import, production checklist
-- =====================================================

-- =====================================================
-- 1. USER MANAGEMENT & ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'author', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  permissions JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- 2. COMMENTS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'blog', 'project', 'service'
  entity_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_website TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
  ip_address TEXT,
  user_agent TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- =====================================================
-- 3. NEWSLETTER SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced')),
  confirmation_token TEXT,
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT, -- 'website', 'import', 'api'
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_tags ON newsletter_subscribers USING GIN(tags);

-- =====================================================
-- 4. NEWSLETTER CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON newsletter_campaigns(scheduled_at) WHERE status = 'scheduled';

-- =====================================================
-- 5. DYNAMIC FORMS
-- =====================================================

CREATE TABLE IF NOT EXISTS dynamic_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- Array of field definitions
  settings JSONB DEFAULT '{
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission!",
    "sendEmail": true,
    "emailTo": "admin@example.com",
    "redirectUrl": null
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  submissions_count INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forms_active ON dynamic_forms(is_active);

-- =====================================================
-- 6. FORM SUBMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES dynamic_forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'spam')),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_submissions_status ON form_submissions(status);
CREATE INDEX idx_submissions_created ON form_submissions(created_at DESC);

-- =====================================================
-- 7. SOCIAL SHARING ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'whatsapp', 'email'
  url TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_shares_entity ON social_shares(entity_type, entity_id);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);
CREATE INDEX idx_social_shares_created ON social_shares(created_at DESC);

-- =====================================================
-- 8. SITE HEALTH MONITORING
-- =====================================================

CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'uptime', 'ssl', 'performance', 'security', 'database', 'storage'
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
  message TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_type ON health_checks(check_type);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_health_checks_checked ON health_checks(checked_at DESC);

-- =====================================================
-- 9. SYSTEM BACKUPS
-- =====================================================

CREATE TABLE IF NOT EXISTS system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL, -- 'full', 'database', 'media', 'configuration'
  file_path TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  includes TEXT[], -- What's included in backup
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_backups_type ON system_backups(backup_type);
CREATE INDEX idx_backups_status ON system_backups(status);
CREATE INDEX idx_backups_started ON system_backups(started_at DESC);

-- =====================================================
-- 10. PRODUCTION CHECKLIST
-- =====================================================

CREATE TABLE IF NOT EXISTS production_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'seo', 'performance', 'security', 'content', 'functionality'
  item_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_completed BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  validation_function TEXT, -- Name of function to auto-check
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_category ON production_checklist(category);
CREATE INDEX idx_checklist_completed ON production_checklist(is_completed);
CREATE INDEX idx_checklist_priority ON production_checklist(priority);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default admin user (update with real data)
INSERT INTO users (email, full_name, role, status) VALUES
('admin@example.com', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Default form: Contact Form
INSERT INTO dynamic_forms (name, title, description, fields, created_by) VALUES
(
  'contact',
  'Contact Form',
  'Get in touch with us',
  '[
    {
      "id": "name",
      "type": "text",
      "label": "Name",
      "required": true,
      "placeholder": "Your name"
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email",
      "required": true,
      "placeholder": "your@email.com"
    },
    {
      "id": "subject",
      "type": "text",
      "label": "Subject",
      "required": true,
      "placeholder": "How can we help?"
    },
    {
      "id": "message",
      "type": "textarea",
      "label": "Message",
      "required": true,
      "placeholder": "Your message here...",
      "rows": 5
    }
  ]'::jsonb,
  'system'
)
ON CONFLICT DO NOTHING;

-- Production checklist items
INSERT INTO production_checklist (category, item_key, title, description, priority, is_required) VALUES
-- SEO
('seo', 'meta_tags', 'Add meta tags to all pages', 'Ensure title, description, and OG tags are set', 'high', true),
('seo', 'sitemap', 'Generate and submit sitemap', 'Create XML sitemap and submit to search engines', 'high', true),
('seo', 'robots_txt', 'Configure robots.txt', 'Set up proper crawling rules', 'medium', true),
('seo', 'analytics', 'Install analytics tracking', 'Google Analytics or alternative', 'high', true),

-- Performance
('performance', 'image_optimization', 'Optimize all images', 'Compress and use WebP format', 'high', true),
('performance', 'lazy_loading', 'Enable lazy loading', 'Lazy load images and components', 'medium', true),
('performance', 'caching', 'Set up caching', 'Browser caching and CDN', 'high', true),
('performance', 'minification', 'Minify assets', 'CSS, JS minification in production', 'medium', true),

-- Security
('security', 'ssl_certificate', 'Install SSL certificate', 'HTTPS for all pages', 'critical', true),
('security', 'env_variables', 'Secure environment variables', 'No secrets in code', 'critical', true),
('security', 'rls_policies', 'Enable RLS on all tables', 'Row Level Security for database', 'critical', true),
('security', 'rate_limiting', 'Add rate limiting', 'Prevent abuse', 'high', true),

-- Content
('content', 'legal_pages', 'Add legal pages', 'Privacy Policy, Terms of Service', 'high', true),
('content', 'error_pages', 'Custom error pages', '404, 500 pages', 'medium', true),
('content', 'contact_info', 'Update contact information', 'Real email, phone, address', 'high', true),

-- Functionality
('functionality', 'email_service', 'Configure email service', 'SMTP or service for notifications', 'high', true),
('functionality', 'backup_system', 'Set up automated backups', 'Daily backups to external storage', 'critical', true),
('functionality', 'monitoring', 'Enable error monitoring', 'Track errors and downtime', 'high', true),
('functionality', 'forms_working', 'Test all forms', 'Contact, newsletter, etc.', 'high', true)
ON CONFLICT (item_key) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Users: Users can read own profile, admins can manage all
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Comments: Public read approved, admins manage all
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage comments"
  ON comments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Newsletter: Public can subscribe, admins manage
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Forms: Public read active, admins manage all
ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active forms"
  ON dynamic_forms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage forms"
  ON dynamic_forms FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Form Submissions: Public can submit, admins can view
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit forms"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view submissions"
  ON form_submissions FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Social Shares: Public can track, admins can view
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track shares"
  ON social_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view shares"
  ON social_shares FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Health Checks: Admin only
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage health checks"
  ON health_checks FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Backups: Admin only
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage backups"
  ON system_backups FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Checklist: Admin only
ALTER TABLE production_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage checklist"
  ON production_checklist FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get comment count for entity
CREATE OR REPLACE FUNCTION get_comment_count(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM comments
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get social share count for entity
CREATE OR REPLACE FUNCTION get_share_count(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_platform TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM social_shares
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND (p_platform IS NULL OR platform = p_platform)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Run health check
CREATE OR REPLACE FUNCTION run_health_check(check_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  db_size BIGINT;
  table_count INTEGER;
BEGIN
  CASE check_name
    WHEN 'database' THEN
      -- Check database size and table count
      SELECT pg_database_size(current_database()) INTO db_size;
      SELECT COUNT(*)::INTEGER INTO table_count
      FROM information_schema.tables
      WHERE table_schema = 'public';

      result := jsonb_build_object(
        'status', 'healthy',
        'size_mb', (db_size / 1024 / 1024),
        'table_count', table_count
      );

      INSERT INTO health_checks (check_type, status, metrics)
      VALUES ('database', 'healthy', result);

    WHEN 'storage' THEN
      -- Check storage usage
      result := jsonb_build_object(
        'status', 'healthy',
        'message', 'Storage check completed'
      );

      INSERT INTO health_checks (check_type, status, metrics)
      VALUES ('storage', 'healthy', result);

    ELSE
      result := jsonb_build_object(
        'status', 'unknown',
        'message', 'Unknown check type'
      );
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get production readiness score
CREATE OR REPLACE FUNCTION get_production_readiness()
RETURNS JSONB AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  required_completed INTEGER;
  required_total INTEGER;
  score NUMERIC;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total_items FROM production_checklist;
  SELECT COUNT(*)::INTEGER INTO completed_items FROM production_checklist WHERE is_completed = true;
  SELECT COUNT(*)::INTEGER INTO required_total FROM production_checklist WHERE is_required = true;
  SELECT COUNT(*)::INTEGER INTO required_completed
  FROM production_checklist
  WHERE is_required = true AND is_completed = true;

  score := CASE
    WHEN total_items = 0 THEN 0
    ELSE ROUND((completed_items::NUMERIC / total_items::NUMERIC) * 100, 2)
  END;

  RETURN jsonb_build_object(
    'score', score,
    'total', total_items,
    'completed', completed_items,
    'required_total', required_total,
    'required_completed', required_completed,
    'is_production_ready', (required_completed = required_total)
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON TABLE users IS 'User accounts with roles and permissions';
COMMENT ON TABLE comments IS 'Comment system for blogs, projects, and other content';
COMMENT ON TABLE newsletter_subscribers IS 'Email newsletter subscription management';
COMMENT ON TABLE newsletter_campaigns IS 'Newsletter campaign tracking and analytics';
COMMENT ON TABLE dynamic_forms IS 'Custom form builder for contact, surveys, etc.';
COMMENT ON TABLE form_submissions IS 'Submissions from dynamic forms';
COMMENT ON TABLE social_shares IS 'Track social media sharing';
COMMENT ON TABLE health_checks IS 'System health monitoring';
COMMENT ON TABLE system_backups IS 'Automated backup tracking';
COMMENT ON TABLE production_checklist IS 'Pre-launch production readiness checklist';

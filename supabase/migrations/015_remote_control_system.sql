-- =====================================================
-- REMOTE CONTROL SYSTEM
-- Live site settings, theme customization, content blocks,
-- menu management, feature flags, version control
-- =====================================================

-- =====================================================
-- 1. SITE SETTINGS (Global Configuration)
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'branding', 'contact', 'social', 'seo', 'advanced'
  label TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'color', 'image', 'url'
  is_public BOOLEAN DEFAULT true, -- Can be accessed by frontend
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure required columns exist on site_settings for seeding
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS key TEXT;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS value JSONB DEFAULT '{}'::jsonb;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS label TEXT;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS data_type TEXT DEFAULT 'string';

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS updated_by TEXT;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS setting_key TEXT;

DROP INDEX IF EXISTS idx_site_settings_category;
DROP INDEX IF EXISTS idx_site_settings_public;

CREATE INDEX idx_site_settings_category ON site_settings(category);
CREATE INDEX idx_site_settings_public ON site_settings(is_public);

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key_unique ON site_settings(key);

-- =====================================================
-- 2. THEME CUSTOMIZATION
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'default', 'dark', 'custom-1'
  is_active BOOLEAN DEFAULT false,
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#06b6d4",
    "secondary": "#3b82f6",
    "accent": "#10b981",
    "background": "#ffffff",
    "text": "#1e293b",
    "error": "#ef4444",
    "success": "#22c55e",
    "warning": "#f59e0b"
  }'::jsonb,
  typography JSONB DEFAULT '{
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "fontSize": {
      "base": "16px",
      "h1": "2.5rem",
      "h2": "2rem",
      "h3": "1.5rem"
    }
  }'::jsonb,
  spacing JSONB DEFAULT '{
    "container": "1280px",
    "sectionPadding": "80px",
    "cardPadding": "24px"
  }'::jsonb,
  borders JSONB DEFAULT '{
    "radius": "8px",
    "width": "1px"
  }'::jsonb,
  effects JSONB DEFAULT '{
    "shadow": "0 10px 30px rgba(0,0,0,0.1)",
    "transition": "0.3s ease"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. DYNAMIC MENU MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_location TEXT NOT NULL, -- 'header', 'footer', 'mobile', 'admin'
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT, -- Icon name or SVG
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  open_in_new_tab BOOLEAN DEFAULT false,
  required_permission TEXT, -- null for public, 'admin' for admin-only
  metadata JSONB DEFAULT '{}'::jsonb, -- badges, colors, custom data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_location ON menu_items(menu_location);
CREATE INDEX idx_menu_order ON menu_items(menu_location, order_index);
CREATE INDEX idx_menu_parent ON menu_items(parent_id);

-- =====================================================
-- 4. CONTENT BLOCKS (Modular Page Content)
-- =====================================================

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL, -- 'home', 'about', 'services', 'contact'
  section_id TEXT NOT NULL, -- 'hero', 'features', 'testimonials', 'cta'
  block_type TEXT NOT NULL, -- 'text', 'image', 'video', 'gallery', 'form', 'custom'
  content JSONB NOT NULL, -- Flexible content structure
  settings JSONB DEFAULT '{
    "visible": true,
    "backgroundColor": "transparent",
    "padding": "default",
    "animation": "fadeIn"
  }'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX idx_content_blocks_page ON content_blocks(page_id);
CREATE INDEX idx_content_blocks_section ON content_blocks(page_id, section_id);
CREATE INDEX idx_content_blocks_order ON content_blocks(page_id, section_id, order_index);
CREATE INDEX idx_content_blocks_published ON content_blocks(is_published);

-- =====================================================
-- 5. FEATURE FLAGS (Toggle Features On/Off)
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  conditions JSONB DEFAULT '{}'::jsonb, -- User segments, date ranges, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- =====================================================
-- 6. SETTINGS VERSION CONTROL (Track Changes & Rollback)
-- =====================================================

CREATE TABLE IF NOT EXISTS settings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL, -- 'site_settings', 'theme_settings', etc.
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  old_data JSONB,
  new_data JSONB NOT NULL,
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_history_table ON settings_history(table_name, record_id);
CREATE INDEX idx_settings_history_created ON settings_history(created_at DESC);

-- =====================================================
-- 7. CONFIGURATION SNAPSHOTS (Backup/Restore)
-- =====================================================

CREATE TABLE IF NOT EXISTS config_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL, -- Complete site configuration
  includes TEXT[] DEFAULT ARRAY['site_settings', 'theme_settings', 'menu_items', 'feature_flags'], -- What's included
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_auto_backup BOOLEAN DEFAULT false
);

CREATE INDEX idx_config_snapshots_created ON config_snapshots(created_at DESC);

-- =====================================================
-- SEED DATA: Default Site Settings
-- =====================================================

-- SEED DATA: Default Site Settings
INSERT INTO site_settings (
  setting_key,
  key,
  value,
  category,
  label,
  description,
  data_type,
  is_public
) VALUES

-- General
('site_title', 'site_title', '"Developer Portfolio"', 'general', 'Site Title', 'Main website title', 'string', true),
('site_tagline', 'site_tagline', '"Building the Future, One Line at a Time"', 'general', 'Tagline', 'Site tagline/slogan', 'string', true),
('site_description', 'site_description', '"Professional web developer specializing in modern web applications"', 'general', 'Description', 'Site description for SEO', 'string', true),

-- Branding
('logo_url', 'logo_url', '"/logo.png"', 'branding', 'Logo URL', 'Main site logo', 'image', true),
('logo_dark_url', 'logo_dark_url', '"/logo-dark.png"', 'branding', 'Dark Logo URL', 'Logo for dark backgrounds', 'image', true),
('favicon_url', 'favicon_url', '"/favicon.ico"', 'branding', 'Favicon URL', 'Browser tab icon', 'image', true),
('brand_color_primary', 'brand_color_primary', '"#06b6d4"', 'branding', 'Primary Color', 'Main brand color', 'color', true),
('brand_color_secondary', 'brand_color_secondary', '"#3b82f6"', 'branding', 'Secondary Color', 'Secondary brand color', 'color', true),

-- Contact
('contact_email', 'contact_email', '"hello@example.com"', 'contact', 'Contact Email', 'Primary contact email', 'string', true),
('contact_phone', 'contact_phone', '"+1 (555) 123-4567"', 'contact', 'Contact Phone', 'Primary phone number', 'string', true),
('contact_address', 'contact_address', '"123 Tech Street, San Francisco, CA"', 'contact', 'Address', 'Business address', 'string', true),

-- Social Media
('social_github', 'social_github', '"https://github.com/username"', 'social', 'GitHub URL', 'GitHub profile', 'url', true),
('social_linkedin', 'social_linkedin', '"https://linkedin.com/in/username"', 'social', 'LinkedIn URL', 'LinkedIn profile', 'url', true),
('social_twitter', 'social_twitter', '"https://twitter.com/username"', 'social', 'Twitter URL', 'Twitter profile', 'url', true),
('social_instagram', 'social_instagram', '""', 'social', 'Instagram URL', 'Instagram profile', 'url', true),

-- SEO
('seo_keywords', 'seo_keywords', '["web developer", "portfolio", "react", "typescript"]', 'seo', 'SEO Keywords', 'Meta keywords', 'json', true),
('seo_og_image', 'seo_og_image', '"/og-image.jpg"', 'seo', 'OG Image', 'Social media preview image', 'image', true),
('google_analytics_id', 'google_analytics_id', '""', 'seo', 'Google Analytics ID', 'GA tracking ID', 'string', false),

-- Advanced
('enable_maintenance_mode', 'enable_maintenance_mode', 'false', 'advanced', 'Maintenance Mode', 'Show maintenance page', 'boolean', true),
('enable_analytics', 'enable_analytics', 'true', 'advanced', 'Enable Analytics', 'Track user analytics', 'boolean', false),
('enable_error_reporting', 'enable_error_reporting', 'true', 'advanced', 'Error Reporting', 'Log errors to database', 'boolean', false),
('max_upload_size_mb', 'max_upload_size_mb', '10', 'advanced', 'Max Upload Size (MB)', 'Maximum file upload size', 'number', false)
ON CONFLICT (setting_key) DO NOTHING;


-- =====================================================
-- SEED DATA: Default Theme
-- =====================================================

INSERT INTO theme_settings (name, is_active, colors, typography, spacing) VALUES
('default', true, '{
  "primary": "#06b6d4",
  "secondary": "#3b82f6",
  "accent": "#10b981",
  "background": "#ffffff",
  "backgroundAlt": "#f8fafc",
  "text": "#1e293b",
  "textLight": "#64748b",
  "border": "#e2e8f0",
  "error": "#ef4444",
  "success": "#22c55e",
  "warning": "#f59e0b",
  "info": "#3b82f6"
}'::jsonb, '{
  "headingFont": "Inter, sans-serif",
  "bodyFont": "Inter, sans-serif",
  "codeFont": "Fira Code, monospace",
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem"
  },
  "fontWeight": {
    "normal": "400",
    "medium": "500",
    "semibold": "600",
    "bold": "700"
  }
}'::jsonb, '{
  "container": "1280px",
  "sectionPadding": "80px",
  "sectionPaddingMobile": "40px",
  "cardPadding": "24px",
  "gap": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  }
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SEED DATA: Default Menu Items
-- =====================================================

INSERT INTO menu_items (menu_location, label, url, icon, order_index, is_visible) VALUES
-- Header Menu
('header', 'Home', '/', 'home', 1, true),
('header', 'Services', '/services', 'briefcase', 2, true),
('header', 'Blog', '/blog', 'book-open', 3, true),
('header', 'Testimonials', '/testimonials', 'star', 4, true),
('header', 'FAQ', '/faq', 'help-circle', 5, true),

-- Footer Menu
('footer', 'Privacy Policy', '/privacy', null, 1, true),
('footer', 'Terms of Service', '/terms', null, 2, true),
('footer', 'Contact', '/contact', null, 3, true),

-- Admin Menu (existing admin routes)
('admin', 'Dashboard', '/admin', 'layout-dashboard', 1, true),
('admin', 'Projects', '/admin/projects', 'folder', 2, true),
('admin', 'Services', '/admin/services', 'briefcase', 3, true),
('admin', 'Blog', '/admin/blog', 'book-open', 4, true),
('admin', 'Testimonials', '/admin/testimonials', 'star', 5, true),
('admin', 'FAQ', '/admin/faq', 'help-circle', 6, true),
('admin', 'Inquiries', '/admin/inquiries', 'mail', 7, true),
('admin', 'Analytics', '/admin/analytics', 'bar-chart', 8, true),
('admin', 'Advanced Analytics', '/admin/advanced-analytics', 'trending-up', 9, true),
('admin', 'Email Automation', '/admin/email-automation', 'send', 10, true),
('admin', 'Settings', '/admin/settings', 'settings', 11, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Feature Flags
-- =====================================================

INSERT INTO feature_flags (feature_key, feature_name, description, is_enabled, rollout_percentage) VALUES
('notifications', 'Notifications System', 'Real-time notification center', true, 100),
('advanced_analytics', 'Advanced Analytics', 'A/B testing and conversion funnels', true, 100),
('ai_chatbot', 'AI Chatbot', 'AI-powered chat support', true, 100),
('payment_system', 'Payment System', 'Razorpay integration', true, 100),
('dark_mode', 'Dark Mode', 'Dark theme toggle', false, 0),
('blog_comments', 'Blog Comments', 'User comments on blog posts', false, 0),
('multilingual', 'Multi-language Support', 'Support for multiple languages', false, 0),
('pwa', 'Progressive Web App', 'Offline support and installability', true, 100)
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Site Settings: Public read for is_public=true, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public settings"
  ON site_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
  ON site_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Theme Settings: Public read for active theme, admin write
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active theme"
  ON theme_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage themes"
  ON theme_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Menu Items: Public read, admin write
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible menu items"
  ON menu_items FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Content Blocks: Public read for published, admin write
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published content blocks"
  ON content_blocks FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage content blocks"
  ON content_blocks FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Feature Flags: Public read, admin write
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Settings History: Admin only
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings history"
  ON settings_history FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Config Snapshots: Admin only
ALTER TABLE config_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage config snapshots"
  ON config_snapshots FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get all public settings as a JSON object
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS JSONB AS $$
  SELECT jsonb_object_agg(key, value)
  FROM site_settings
  WHERE is_public = true;
$$ LANGUAGE SQL STABLE;

-- Get active theme
CREATE OR REPLACE FUNCTION get_active_theme()
RETURNS JSONB AS $$
  SELECT row_to_json(theme_settings)::jsonb
  FROM theme_settings
  WHERE is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get menu items by location
CREATE OR REPLACE FUNCTION get_menu_items(menu_loc TEXT)
RETURNS SETOF menu_items AS $$
  SELECT *
  FROM menu_items
  WHERE menu_location = menu_loc AND is_visible = true
  ORDER BY order_index ASC;
$$ LANGUAGE SQL STABLE;

-- Check if feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(feature TEXT)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_enabled FROM feature_flags WHERE feature_key = feature LIMIT 1),
    false
  );
$$ LANGUAGE SQL STABLE;

-- Create configuration snapshot
CREATE OR REPLACE FUNCTION create_config_snapshot(
  snapshot_name TEXT,
  snapshot_description TEXT DEFAULT NULL,
  created_by_user TEXT DEFAULT 'admin'
)
RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
  snapshot_data JSONB;
BEGIN
  -- Collect all configuration data
  snapshot_data := jsonb_build_object(
    'site_settings', (SELECT jsonb_agg(row_to_json(site_settings)) FROM site_settings),
    'theme_settings', (SELECT jsonb_agg(row_to_json(theme_settings)) FROM theme_settings),
    'menu_items', (SELECT jsonb_agg(row_to_json(menu_items)) FROM menu_items),
    'feature_flags', (SELECT jsonb_agg(row_to_json(feature_flags)) FROM feature_flags),
    'timestamp', NOW()
  );

  -- Insert snapshot
  INSERT INTO config_snapshots (name, description, snapshot_data, created_by)
  VALUES (snapshot_name, snapshot_description, snapshot_data, created_by_user)
  RETURNING id INTO snapshot_id;

  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-create daily backup
CREATE OR REPLACE FUNCTION auto_create_daily_backup()
RETURNS UUID AS $$
BEGIN
  RETURN create_config_snapshot(
    'Auto Backup ' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
    'Automatic daily configuration backup',
    'system'
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE site_settings IS 'Global site configuration (title, logo, contact, SEO)';
COMMENT ON TABLE theme_settings IS 'Theme customization (colors, typography, spacing)';
COMMENT ON TABLE menu_items IS 'Dynamic navigation menus (header, footer, admin)';
COMMENT ON TABLE content_blocks IS 'Modular page content blocks';
COMMENT ON TABLE feature_flags IS 'Toggle features on/off instantly';
COMMENT ON TABLE settings_history IS 'Audit trail for configuration changes';
COMMENT ON TABLE config_snapshots IS 'Backup/restore configuration snapshots';

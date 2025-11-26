-- ===================================================================
-- COMPREHENSIVE CMS BUNDLE: 10 Content Management Systems
-- Site Settings, Hero, Contact, Social, SEO, Email, Nav, Footer, Skills, Stats
-- ===================================================================

-- 1. SITE SETTINGS - Global site configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'url', 'email')),
  category TEXT DEFAULT 'general', -- general, appearance, seo, integrations, etc.
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HERO SECTION - Dynamic hero content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_primary_text TEXT DEFAULT 'Get Started',
  cta_primary_link TEXT DEFAULT '#contact',
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  background_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACT INFO - Contact details management
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon_name TEXT, -- Lucide icon name
  link_url TEXT,
  info_type TEXT DEFAULT 'general' CHECK (info_type IN ('email', 'phone', 'address', 'website', 'general')),
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SOCIAL MEDIA LINKS - Social profiles
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- github, linkedin, twitter, facebook, instagram, etc.
  url TEXT NOT NULL,
  icon_name TEXT, -- Lucide icon name
  username TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SEO META - Page-specific SEO
CREATE TABLE IF NOT EXISTS seo_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL, -- /, /services, /blog, etc.
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  structured_data JSONB, -- Schema.org JSON-LD
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EMAIL TEMPLATES - Email content management
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL, -- booking_confirmation, inquiry_received, etc.
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB, -- Available template variables
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NAVIGATION MENU - Dynamic menu items
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT,
  parent_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
  is_external BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FOOTER CONTENT - Footer sections
CREATE TABLE IF NOT EXISTS footer_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  section_type TEXT DEFAULT 'text' CHECK (section_type IN ('text', 'links', 'contact', 'social')),
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES footer_sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_external BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- 9. SKILLS/TECHNOLOGIES - Tech stack display
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- frontend, backend, database, devops, etc.
  proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_url TEXT,
  years_experience DECIMAL(3,1),
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACHIEVEMENTS/STATS - Impressive numbers
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL, -- e.g., "50+", "100%", "$1M+"
  icon_name TEXT,
  description TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- INDEXES for performance
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_hero_content_active ON hero_content(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info(info_type);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_seo_meta_path ON seo_meta(page_path);
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_footer_links_section ON footer_links(section_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ===================================================================
-- UPDATE TRIGGERS
-- ===================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_content_timestamp
  BEFORE UPDATE ON hero_content
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_seo_meta_timestamp
  BEFORE UPDATE ON seo_meta
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_site_settings_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can view active hero content" ON hero_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view visible contact info" ON contact_info
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view visible social links" ON social_links
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view seo meta" ON seo_meta
  FOR SELECT USING (true);

CREATE POLICY "Public can view visible navigation" ON navigation_items
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view visible footer sections" ON footer_sections
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view footer links" ON footer_links
  FOR SELECT USING (true);

CREATE POLICY "Public can view visible skills" ON skills
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view visible achievements" ON achievements
  FOR SELECT USING (is_visible = true);

-- Admin full access policies
CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage hero content" ON hero_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage contact info" ON contact_info
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage social links" ON social_links
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage seo meta" ON seo_meta
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage navigation" ON navigation_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage footer" ON footer_sections
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage footer links" ON footer_links
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage skills" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (auth.role() = 'authenticated');

-- ===================================================================
-- HELPER FUNCTIONS
-- ===================================================================

-- Get setting value with fallback
CREATE OR REPLACE FUNCTION get_setting(key TEXT, fallback TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT setting_value FROM site_settings WHERE setting_key = key),
    fallback
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ===================================================================
-- DEFAULT DATA SEEDING
-- ===================================================================

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, category, description) VALUES
  ('site_name', 'Sudharsan - Web Developer', 'general', 'Site name'),
  ('site_tagline', 'Professional Web Development Services in Trichy', 'general', 'Site tagline'),
  ('primary_color', '#06b6d4', 'appearance', 'Primary brand color'),
  ('default_region', 'IN', 'general', 'Default region (IN/Global)'),
  ('maintenance_mode', 'false', 'general', 'Enable maintenance mode'),
  ('analytics_enabled', 'true', 'integrations', 'Enable analytics tracking')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (label, value, icon_name, link_url, info_type, display_order) VALUES
  ('Email', 'contact@example.com', 'Mail', 'mailto:contact@example.com', 'email', 1),
  ('Phone', '+91 1234567890', 'Phone', 'tel:+911234567890', 'phone', 2),
  ('Location', 'Trichy, Tamil Nadu', 'MapPin', NULL, 'address', 3)
ON CONFLICT DO NOTHING;

-- Insert default social links
INSERT INTO social_links (platform, url, icon_name, display_order) VALUES
  ('github', 'https://github.com/username', 'Github', 1),
  ('linkedin', 'https://linkedin.com/in/username', 'Linkedin', 2),
  ('twitter', 'https://twitter.com/username', 'Twitter', 3)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE site_settings IS 'Global site configuration key-value store';
COMMENT ON TABLE hero_content IS 'Dynamic hero section content';
COMMENT ON TABLE contact_info IS 'Contact information display';
COMMENT ON TABLE social_links IS 'Social media profile links';
COMMENT ON TABLE seo_meta IS 'Page-specific SEO metadata';
COMMENT ON TABLE email_templates IS 'Email template management';
COMMENT ON TABLE navigation_items IS 'Dynamic navigation menu';
COMMENT ON TABLE footer_sections IS 'Footer content sections';
COMMENT ON TABLE skills IS 'Skills and technologies showcase';
COMMENT ON TABLE achievements IS 'Statistics and achievements display';

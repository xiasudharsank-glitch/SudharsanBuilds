-- Create services table for dynamic service management
-- Allows admin to add/edit/remove services without code changes

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT DEFAULT 'Code2', -- Lucide icon name
  price_inr INTEGER NOT NULL, -- Price in rupees
  price_usd INTEGER, -- Price in dollars (optional)
  price_subtext TEXT,
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  timeline TEXT NOT NULL, -- e.g., "1-2 weeks"
  cta_text TEXT DEFAULT 'Get Started',
  cta_action TEXT DEFAULT 'book' CHECK (cta_action IN ('book', 'quote')),
  deposit_amount_inr INTEGER,
  deposit_amount_usd INTEGER,
  is_popular BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_popular ON services(is_popular);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at_trigger
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- Auto-generate slug
CREATE OR REPLACE FUNCTION auto_generate_service_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.name, '[^\w\s-]', '', 'g'));
    NEW.slug = regexp_replace(NEW.slug, '\s+', '-', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_service_slug_trigger
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_service_slug();

-- Service statistics view
CREATE OR REPLACE VIEW service_stats AS
SELECT
  COUNT(*) as total_services,
  COUNT(*) FILTER (WHERE is_published = true) as published_services,
  COUNT(*) FILTER (WHERE is_popular = true) as popular_services
FROM services;

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can view published services
CREATE POLICY "Public can view published services" ON services
  FOR SELECT USING (is_published = true);

-- Authenticated users can manage services
CREATE POLICY "Authenticated users can view all services" ON services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert services" ON services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update services" ON services
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete services" ON services
  FOR DELETE USING (auth.role() = 'authenticated');

GRANT SELECT ON service_stats TO anon, authenticated;

COMMENT ON TABLE services IS 'Service offerings with pricing and features';
COMMENT ON VIEW service_stats IS 'Statistics about services';

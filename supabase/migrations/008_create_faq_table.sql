-- Create FAQ table for dynamic FAQ management
-- Allows admin to add/edit/delete FAQs without code changes

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- pricing, services, technical, support, etc.
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faqs_updated_at_trigger
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();

-- Create view for FAQ statistics
CREATE OR REPLACE VIEW faq_stats AS
SELECT
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_published = true) as published_count,
  COUNT(DISTINCT category) as category_count
FROM faqs;

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public can view published FAQs
CREATE POLICY "Public can view published FAQs" ON faqs
  FOR SELECT USING (is_published = true);

-- Authenticated users (admins) can manage all FAQs
CREATE POLICY "Authenticated users can view all FAQs" ON faqs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert FAQs" ON faqs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update FAQs" ON faqs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete FAQs" ON faqs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON faq_stats TO anon, authenticated;

COMMENT ON TABLE faqs IS 'Frequently Asked Questions managed dynamically';
COMMENT ON VIEW faq_stats IS 'Statistics about FAQs';

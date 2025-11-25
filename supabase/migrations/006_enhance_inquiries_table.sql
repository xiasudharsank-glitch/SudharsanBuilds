-- Enhance inquiries table for better management
-- Add status tracking, notes, tags, and conversion tracking

-- Add new columns to existing inquiries table
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'archived'));
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website'; -- website, referral, social, etc.
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS converted_value DECIMAL(10,2);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create inquiry_notes table for detailed note-taking
CREATE TABLE IF NOT EXISTS inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inquiry_activities table for activity tracking
CREATE TABLE IF NOT EXISTS inquiry_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- status_change, note_added, email_sent, call_made, etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_tags ON inquiries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_id ON inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_activities_inquiry_id ON inquiry_activities(inquiry_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inquiries_updated_at_trigger
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- Create trigger to log activity when status changes
CREATE OR REPLACE FUNCTION log_inquiry_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO inquiry_activities (inquiry_id, activity_type, description, metadata, created_by)
    VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_inquiry_status_change_trigger
  AFTER UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION log_inquiry_status_change();

-- Create view for inquiry analytics
CREATE OR REPLACE VIEW inquiry_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  status,
  service,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(converted_at, NOW()) - created_at)) / 3600) as avg_hours_to_conversion
FROM inquiries
GROUP BY DATE_TRUNC('day', created_at), status, service
ORDER BY date DESC;

-- Create view for conversion funnel
CREATE OR REPLACE VIEW inquiry_funnel AS
SELECT
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
  COUNT(*) FILTER (WHERE status = 'qualified') as qualified_count,
  COUNT(*) FILTER (WHERE status = 'proposal_sent') as proposal_sent_count,
  COUNT(*) FILTER (WHERE status = 'negotiating') as negotiating_count,
  COUNT(*) FILTER (WHERE status = 'won') as won_count,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_count,
  COUNT(*) FILTER (WHERE status = 'won') * 100.0 / NULLIF(COUNT(*), 0) as conversion_rate,
  SUM(converted_value) FILTER (WHERE status = 'won') as total_revenue
FROM inquiries
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Enable RLS on new tables
ALTER TABLE inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_activities ENABLE ROW LEVEL SECURITY;

-- Public can view their own inquiry notes (if we add client portal later)
CREATE POLICY "Users can view inquiry notes" ON inquiry_notes
  FOR SELECT USING (true);

CREATE POLICY "Users can view inquiry activities" ON inquiry_activities
  FOR SELECT USING (true);

-- Authenticated users (admins) can manage everything
CREATE POLICY "Authenticated users can manage inquiry notes" ON inquiry_notes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage inquiry activities" ON inquiry_activities
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON inquiry_analytics TO anon, authenticated;
GRANT SELECT ON inquiry_funnel TO anon, authenticated;

COMMENT ON TABLE inquiry_notes IS 'Detailed notes for each inquiry';
COMMENT ON TABLE inquiry_activities IS 'Activity log for inquiry tracking';
COMMENT ON VIEW inquiry_analytics IS 'Analytics for inquiry performance';
COMMENT ON VIEW inquiry_funnel IS 'Conversion funnel metrics';

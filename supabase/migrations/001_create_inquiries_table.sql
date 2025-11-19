-- Create inquiries table for storing contact form submissions
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled'))
);

-- Create index on created_at for faster queries
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Create index on status for filtering
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Enable Row Level Security (RLS)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for contact form submissions)
CREATE POLICY "Allow public inserts" ON inquiries
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to view all inquiries
CREATE POLICY "Allow authenticated users to view" ON inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update inquiries
CREATE POLICY "Allow authenticated users to update" ON inquiries
  FOR UPDATE
  USING (auth.role() = 'authenticated');

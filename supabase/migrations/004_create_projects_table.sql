-- Create projects table for dynamic project management
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('client', 'personal', 'open-source', 'freelance')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'in-progress', 'on-hold')),
  role TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  featured BOOLEAN DEFAULT false,
  client_name TEXT,
  github_url TEXT,
  case_study_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tech_stack junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create screenshots table for project images
CREATE TABLE IF NOT EXISTS project_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create key_achievements table
CREATE TABLE IF NOT EXISTS project_key_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenges table (optional field)
CREATE TABLE IF NOT EXISTS project_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS project_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_project_tech_stack_project_id ON project_tech_stack(project_id);
CREATE INDEX IF NOT EXISTS idx_project_screenshots_project_id ON project_screenshots(project_id);
CREATE INDEX IF NOT EXISTS idx_project_key_achievements_project_id ON project_key_achievements(project_id);
CREATE INDEX IF NOT EXISTS idx_project_testimonials_project_id ON project_testimonials(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_key_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can view published projects)
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view tech stack" ON project_tech_stack
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.is_published = true
    )
  );

CREATE POLICY "Public can view screenshots" ON project_screenshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_screenshots.project_id
      AND projects.is_published = true
    )
  );

CREATE POLICY "Public can view achievements" ON project_key_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_key_achievements.project_id
      AND projects.is_published = true
    )
  );

CREATE POLICY "Public can view challenges" ON project_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_challenges.project_id
      AND projects.is_published = true
    )
  );

CREATE POLICY "Public can view testimonials" ON project_testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_testimonials.project_id
      AND projects.is_published = true
    )
  );

-- Admin access (authenticated users can do everything)
-- Note: You'll need to set up proper admin role in Supabase dashboard
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tech stack" ON project_tech_stack
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage screenshots" ON project_screenshots
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage achievements" ON project_key_achievements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage challenges" ON project_challenges
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage testimonials" ON project_testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Create helpful views
CREATE OR REPLACE VIEW projects_with_details AS
SELECT
  p.*,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'name', pts.name,
        'icon', pts.icon
      ) ORDER BY pts.display_order
    ) FILTER (WHERE pts.id IS NOT NULL),
    '[]'
  ) as tech_stack,
  COALESCE(
    json_agg(
      DISTINCT ps.image_url ORDER BY ps.display_order
    ) FILTER (WHERE ps.id IS NOT NULL),
    '[]'
  ) as screenshots,
  COALESCE(
    json_agg(
      DISTINCT pka.achievement ORDER BY pka.display_order
    ) FILTER (WHERE pka.id IS NOT NULL),
    '[]'
  ) as key_achievements,
  COALESCE(
    json_agg(
      DISTINCT pc.challenge ORDER BY pc.display_order
    ) FILTER (WHERE pc.id IS NOT NULL),
    '[]'
  ) as challenges,
  (
    SELECT jsonb_build_object(
      'text', pt.text,
      'name', pt.client_name,
      'role', pt.client_role
    )
    FROM project_testimonials pt
    WHERE pt.project_id = p.id
    LIMIT 1
  ) as client_testimonial
FROM projects p
LEFT JOIN project_tech_stack pts ON p.id = pts.project_id
LEFT JOIN project_screenshots ps ON p.id = ps.project_id
LEFT JOIN project_key_achievements pka ON p.id = pka.project_id
LEFT JOIN project_challenges pc ON p.id = pc.project_id
GROUP BY p.id
ORDER BY p.display_order, p.created_at DESC;

-- Grant access to the view
GRANT SELECT ON projects_with_details TO anon, authenticated;

COMMENT ON TABLE projects IS 'Main projects table for portfolio showcase';
COMMENT ON TABLE project_tech_stack IS 'Technology stack used in each project';
COMMENT ON TABLE project_screenshots IS 'Project screenshots and images';
COMMENT ON TABLE project_key_achievements IS 'Key achievements and results for each project';
COMMENT ON TABLE project_testimonials IS 'Client testimonials for projects';

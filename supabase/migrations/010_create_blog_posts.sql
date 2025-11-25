-- Create blog posts table for dynamic blog management
-- Allows admin to create, edit, and publish blog posts without code changes

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly version of title
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- Full blog content in markdown or HTML
  featured_image_url TEXT,
  keywords TEXT[] DEFAULT '{}', -- SEO keywords
  read_time TEXT DEFAULT '5 min read',
  author_name TEXT DEFAULT 'Sudharsan',
  author_email TEXT,
  category TEXT DEFAULT 'general', -- web-development, business-tips, tutorials, case-studies
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_keywords ON blog_posts USING gin(keywords);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^\w\s-]', '', 'g'), -- Remove special chars
        '\s+', '-', 'g'                              -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'                                 -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.title);

    -- Ensure uniqueness by appending counter if slug exists
    WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) LOOP
      NEW.slug = NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Create view for blog statistics
CREATE OR REPLACE VIEW blog_stats AS
SELECT
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_published = true) as published_posts,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_posts,
  COUNT(DISTINCT category) as category_count,
  SUM(view_count) as total_views,
  ROUND(AVG(view_count), 0) as avg_views_per_post
FROM blog_posts;

-- Create view for popular posts
CREATE OR REPLACE VIEW popular_blog_posts AS
SELECT
  id,
  title,
  slug,
  excerpt,
  view_count,
  published_at,
  category
FROM blog_posts
WHERE is_published = true
ORDER BY view_count DESC
LIMIT 10;

-- Create view for recent posts by category
CREATE OR REPLACE VIEW recent_posts_by_category AS
SELECT
  category,
  COUNT(*) as post_count,
  MAX(published_at) as last_published
FROM blog_posts
WHERE is_published = true
GROUP BY category
ORDER BY last_published DESC;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for blog images
CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published blog posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Authenticated users (admins) can manage all blog posts
CREATE POLICY "Authenticated users can view all blog posts" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON blog_stats TO anon, authenticated;
GRANT SELECT ON popular_blog_posts TO anon, authenticated;
GRANT SELECT ON recent_posts_by_category TO anon, authenticated;

COMMENT ON TABLE blog_posts IS 'Blog posts with full content management capabilities';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly identifier generated from title';
COMMENT ON COLUMN blog_posts.content IS 'Full blog content (supports markdown or HTML)';
COMMENT ON VIEW blog_stats IS 'Statistics about blog posts';
COMMENT ON VIEW popular_blog_posts IS 'Top 10 most viewed blog posts';
COMMENT ON VIEW recent_posts_by_category IS 'Recent activity by category';

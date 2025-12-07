-- =====================================================
-- CONTENT & MEDIA MANAGEMENT SYSTEM
-- Media library, bulk uploads, content editor, scheduling,
-- drafts, SEO, page builder, full-text search
-- =====================================================

-- =====================================================
-- 0. MEDIA LIBRARY FOLDERS (for organizing media)
-- =====================================================

CREATE TABLE IF NOT EXISTS media_library_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  parent_id UUID REFERENCES media_library_folders(id) ON DELETE SET NULL,
  path TEXT,  -- folder path, e.g. "root/projects/landing-pages"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_library_folders
  ADD COLUMN IF NOT EXISTS path TEXT;

ALTER TABLE media_library_folders
  ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE media_library_folders
  ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_media_library_folders_parent
  ON media_library_folders(parent_id);

CREATE INDEX IF NOT EXISTS idx_media_folders_path
  ON media_library_folders(path);


-- =====================================================
-- 1. MEDIA LIBRARY
-- =====================================================

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_url TEXT NOT NULL, -- Public URL
  file_size BIGINT NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document', 'other'
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  duration NUMERIC, -- for videos/audio (seconds)
  alt_text TEXT,
  caption TEXT,
  folder_id UUID REFERENCES media_library_folders(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb, -- EXIF, custom data
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0
);

CREATE INDEX idx_media_file_type ON media_library(file_type);
CREATE INDEX idx_media_folder ON media_library(folder_id);
CREATE INDEX idx_media_tags ON media_library USING GIN(tags);
CREATE INDEX idx_media_uploaded_at ON media_library(uploaded_at DESC);


-- =====================================================
-- 3. CONTENT DRAFTS & VERSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'blog', 'project', 'service', 'page', 'testimonial'
  content_id UUID, -- NULL for new content, UUID for editing existing
  title TEXT NOT NULL,
  slug TEXT,
  content JSONB NOT NULL, -- Rich content structure
  excerpt TEXT,
  featured_image UUID REFERENCES media_library(id),
  author TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'scheduled', 'published', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password')),
  password TEXT, -- For password-protected content
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES content_drafts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_by TEXT
);

CREATE INDEX idx_content_drafts_type ON content_drafts(content_type);
CREATE INDEX idx_content_drafts_status ON content_drafts(status);
CREATE INDEX idx_content_drafts_scheduled ON content_drafts(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
CREATE INDEX idx_content_drafts_slug ON content_drafts(slug);

-- =====================================================
-- 4. SEO META DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'page', 'blog', 'project', 'service'
  entity_id UUID NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT, -- Open Graph
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow', -- 'index, follow', 'noindex, nofollow', etc.
  structured_data JSONB, -- Schema.org JSON-LD
  custom_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_seo_entity ON seo_metadata(entity_type, entity_id);

-- =====================================================
-- 5. PAGE BUILDER TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'landing', 'blog', 'portfolio', 'custom'
  template_data JSONB NOT NULL, -- Component structure
  thumbnail TEXT, -- Preview image
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_templates_category ON page_templates(category);
CREATE INDEX idx_page_templates_public ON page_templates(is_public);

-- =====================================================
-- 6. CONTENT SCHEDULING QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS content_schedule_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_draft_id UUID REFERENCES content_drafts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('publish', 'unpublish', 'archive', 'delete')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedule_queue_pending ON content_schedule_queue(scheduled_for) WHERE executed = false;
CREATE INDEX idx_schedule_queue_draft ON content_schedule_queue(content_draft_id);

-- =====================================================
-- 7. CONTENT SEARCH INDEX (Full-Text Search)
-- =====================================================

CREATE TABLE IF NOT EXISTS content_search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[],
  author TEXT,
  published_at TIMESTAMPTZ,
  search_vector tsvector, -- Full-text search vector
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Create full-text search index
CREATE INDEX idx_content_search_vector ON content_search_index USING GIN(search_vector);
CREATE INDEX idx_content_search_entity ON content_search_index(entity_type, entity_id);
CREATE INDEX idx_content_search_published ON content_search_index(published_at DESC);

-- Auto-update search vector trigger
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_search_vector_update
  BEFORE INSERT OR UPDATE ON content_search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_content_search_vector();

-- =====================================================
-- 8. BULK UPLOAD SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS bulk_upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT,
  total_files INTEGER NOT NULL,
  uploaded_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  folder_id UUID REFERENCES media_library_folders(id),
  uploaded_by TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_logs JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_bulk_sessions_status ON bulk_upload_sessions(status);
CREATE INDEX idx_bulk_sessions_user ON bulk_upload_sessions(uploaded_by);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default media folders
INSERT INTO media_library_folders (name, path, created_by) VALUES
('Images', '/images', 'system'),
('Videos', '/videos', 'system'),
('Documents', '/documents', 'system'),
('Audio', '/audio', 'system'),
('Uploads', '/uploads', 'system')
ON CONFLICT DO NOTHING;

-- Default page templates
INSERT INTO page_templates (name, description, category, template_data, is_default, created_by) VALUES
(
  'Blank Page',
  'Start from scratch with a blank page',
  'custom',
  '{"sections": []}'::jsonb,
  true,
  'system'
),
(
  'Landing Page',
  'Hero section, features, testimonials, and CTA',
  'landing',
  '{
    "sections": [
      {"type": "hero", "title": "Welcome", "subtitle": "Your message here"},
      {"type": "features", "items": []},
      {"type": "testimonials", "items": []},
      {"type": "cta", "title": "Get Started"}
    ]
  }'::jsonb,
  false,
  'system'
),
(
  'Blog Post',
  'Standard blog post layout',
  'blog',
  '{
    "sections": [
      {"type": "header", "showFeaturedImage": true},
      {"type": "content", "layout": "single-column"},
      {"type": "author", "showBio": true},
      {"type": "related", "count": 3}
    ]
  }'::jsonb,
  false,
  'system'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Media Library: Public read, admin write
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public media"
  ON media_library FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage all media"
  ON media_library FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Media Folders: Public read, admin write
ALTER TABLE media_library_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view folders"
  ON media_library_folders FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage folders"
  ON media_library_folders FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Content Drafts: Author can read own, admin can read all
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
  ON content_drafts FOR SELECT
  USING (created_by = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create drafts"
  ON content_drafts FOR INSERT
  WITH CHECK (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own drafts"
  ON content_drafts FOR UPDATE
  USING (created_by = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete drafts"
  ON content_drafts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- SEO Metadata: Public read, admin write
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read SEO metadata"
  ON seo_metadata FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage SEO metadata"
  ON seo_metadata FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Page Templates: Public read for public templates, admin manage all
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
  ON page_templates FOR SELECT
  USING (is_public = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage templates"
  ON page_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Content Search: Public read
ALTER TABLE content_search_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can search content"
  ON content_search_index FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage search index"
  ON content_search_index FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Schedule Queue: Admin only
ALTER TABLE content_schedule_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage schedule queue"
  ON content_schedule_queue FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Bulk Upload Sessions: User can view own, admin can view all
ALTER TABLE bulk_upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload sessions"
  ON bulk_upload_sessions FOR SELECT
  USING (uploaded_by = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage upload sessions"
  ON bulk_upload_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Full-text search function
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  content_types TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  excerpt TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    csi.id,
    csi.entity_type,
    csi.entity_id,
    csi.title,
    csi.excerpt,
    ts_rank(csi.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM content_search_index csi
  WHERE
    csi.search_vector @@ plainto_tsquery('english', search_query)
    AND (content_types IS NULL OR csi.entity_type = ANY(content_types))
  ORDER BY rank DESC, csi.published_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get media by folder path
CREATE OR REPLACE FUNCTION get_media_by_folder(folder_path TEXT)
RETURNS SETOF media_library AS $$
BEGIN
  RETURN QUERY
  SELECT ml.*
  FROM media_library ml
  LEFT JOIN media_library_folders mlf ON ml.folder_id = mlf.id
  WHERE mlf.path = folder_path OR (folder_path = '/' AND ml.folder_id IS NULL)
  ORDER BY ml.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Process scheduled content
CREATE OR REPLACE FUNCTION process_scheduled_content()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  queue_item RECORD;
BEGIN
  FOR queue_item IN
    SELECT * FROM content_schedule_queue
    WHERE executed = false AND scheduled_for <= NOW()
  LOOP
    -- Process based on action
    CASE queue_item.action
      WHEN 'publish' THEN
        UPDATE content_drafts
        SET status = 'published', published_at = NOW()
        WHERE id = queue_item.content_draft_id;

      WHEN 'unpublish' THEN
        UPDATE content_drafts
        SET status = 'draft', published_at = NULL
        WHERE id = queue_item.content_draft_id;

      WHEN 'archive' THEN
        UPDATE content_drafts
        SET status = 'archived'
        WHERE id = queue_item.content_draft_id;

      WHEN 'delete' THEN
        DELETE FROM content_drafts
        WHERE id = queue_item.content_draft_id;
    END CASE;

    -- Mark as executed
    UPDATE content_schedule_queue
    SET executed = true, executed_at = NOW()
    WHERE id = queue_item.id;

    processed_count := processed_count + 1;
  END LOOP;

  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Update media library stats
CREATE OR REPLACE FUNCTION update_media_stats(
  media_id UUID,
  stat_type TEXT -- 'view' or 'download'
)
RETURNS VOID AS $$
BEGIN
  IF stat_type = 'view' THEN
    UPDATE media_library SET view_count = view_count + 1 WHERE id = media_id;
  ELSIF stat_type = 'download' THEN
    UPDATE media_library SET download_count = download_count + 1 WHERE id = media_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE media_library IS 'Centralized media storage with metadata and organization';
COMMENT ON TABLE media_library_folders IS 'Folder structure for organizing media files';
COMMENT ON TABLE content_drafts IS 'Draft management and versioning for all content types';
COMMENT ON TABLE seo_metadata IS 'SEO and social media metadata for content';
COMMENT ON TABLE page_templates IS 'Reusable page templates for page builder';
COMMENT ON TABLE content_schedule_queue IS 'Scheduled content publishing and actions';
COMMENT ON TABLE content_search_index IS 'Full-text search index for all content';
COMMENT ON TABLE bulk_upload_sessions IS 'Track bulk media upload progress';

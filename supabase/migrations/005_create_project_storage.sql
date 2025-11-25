-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access for project images
CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

-- Authenticated users can upload project images
CREATE POLICY "Authenticated users can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update project images
CREATE POLICY "Authenticated users can update project images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete project images
CREATE POLICY "Authenticated users can delete project images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );

COMMENT ON TABLE storage.objects IS 'Storage for project images and screenshots';

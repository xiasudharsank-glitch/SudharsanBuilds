-- =====================================================
-- STORAGE BUCKETS SETUP
-- Create storage buckets for media files
-- =====================================================

-- Create public storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

-- Create RLS policies for the storage bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'public' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update their files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'public' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'public' AND
    auth.role() = 'authenticated'
  );

COMMENT ON TABLE storage.buckets IS 'Storage buckets for media files';

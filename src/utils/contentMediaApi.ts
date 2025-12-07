// =====================================================
// CONTENT & MEDIA MANAGEMENT API
// Media library, content drafts, SEO, scheduling, search
// =====================================================

import { supabase } from '../services/supabaseClient';

// =====================================================
// TYPES
// =====================================================

export interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  width?: number;
  height?: number;
  duration?: number;
  alt_text?: string;
  caption?: string;
  folder_id?: string;
  tags: string[];
  metadata: Record<string, any>;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  is_public: boolean;
  download_count: number;
  view_count: number;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id?: string;
  path: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface ContentDraft {
  id: string;
  content_type: 'blog' | 'project' | 'service' | 'page' | 'testimonial';
  content_id?: string;
  title: string;
  slug?: string;
  content: Record<string, any>;
  excerpt?: string;
  featured_image?: string;
  author: string;
  status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  scheduled_publish_at?: string;
  published_at?: string;
  metadata: Record<string, any>;
  version: number;
  parent_version_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface SEOMetadata {
  id?: string;
  entity_type: string;
  entity_id: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  structured_data?: Record<string, any>;
  custom_meta?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  excerpt?: string;
  rank: number;
}

// =====================================================
// MEDIA LIBRARY API
// =====================================================

/**
 * Upload file to media library
 */
export async function uploadMedia(
  file: File,
  options: {
    folderId?: string;
    altText?: string;
    caption?: string;
    tags?: string[];
    isPublic?: boolean;
  } = {}
): Promise<MediaFile | null> {
  const {
    folderId,
    altText,
    caption,
    tags = [],
    isPublic = true
  } = options;

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `media/${filename}`;

  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (storageError) {
    console.error('Error uploading file:', storageError);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  // Get file dimensions for images
  let width, height;
  if (file.type.startsWith('image/')) {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  }

  // Determine file type
  const fileType = getFileType(file.type);

  // Insert into media library
  const { data, error } = await supabase
    .from('media_library')
    .insert([{
      filename,
      original_filename: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      file_type: fileType,
      width,
      height,
      alt_text: altText,
      caption,
      folder_id: folderId,
      tags,
      is_public: isPublic,
      uploaded_by: 'admin' // TODO: Get from auth
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving to media library:', error);
    return null;
  }

  return data;
}

/**
 * Get all media files
 */
export async function getMediaFiles(filters: {
  folderId?: string;
  fileType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
} = {}): Promise<MediaFile[]> {
  let query = supabase
    .from('media_library')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (filters.folderId) {
    query = query.eq('folder_id', filters.folderId);
  }

  if (filters.fileType) {
    query = query.eq('file_type', filters.fileType);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching media files:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete media file
 */
export async function deleteMedia(id: string): Promise<boolean> {
  // Get file path
  const { data: media } = await supabase
    .from('media_library')
    .select('file_path')
    .eq('id', id)
    .single();

  if (!media) return false;

  // Delete from storage
  await supabase.storage
    .from('public')
    .remove([media.file_path]);

  // Delete from database
  const { error } = await supabase
    .from('media_library')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting media:', error);
    return false;
  }

  return true;
}

/**
 * Update media metadata
 */
export async function updateMedia(
  id: string,
  updates: Partial<MediaFile>
): Promise<boolean> {
  const { error } = await supabase
    .from('media_library')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating media:', error);
    return false;
  }

  return true;
}

/**
 * Bulk upload files
 */
export async function bulkUploadMedia(
  files: File[],
  options: {
    folderId?: string;
    onProgress?: (uploaded: number, total: number) => void;
  } = {}
): Promise<{
  successful: MediaFile[];
  failed: Array<{ file: File; error: string }>;
}> {
  const successful: MediaFile[] = [];
  const failed: Array<{ file: File; error: string }> = [];

  // Create bulk upload session
  const { data: session } = await supabase
    .from('bulk_upload_sessions')
    .insert([{
      total_files: files.length,
      folder_id: options.folderId,
      uploaded_by: 'admin'
    }])
    .select()
    .single();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const result = await uploadMedia(file, {
        folderId: options.folderId
      });

      if (result) {
        successful.push(result);

        // Update session
        if (session) {
          await supabase
            .from('bulk_upload_sessions')
            .update({ uploaded_files: successful.length })
            .eq('id', session.id);
        }
      } else {
        failed.push({ file, error: 'Upload failed' });
      }
    } catch (error) {
      failed.push({ file, error: String(error) });
    }

    if (options.onProgress) {
      options.onProgress(i + 1, files.length);
    }
  }

  // Complete session
  if (session) {
    await supabase
      .from('bulk_upload_sessions')
      .update({
        status: failed.length === 0 ? 'completed' : 'failed',
        uploaded_files: successful.length,
        failed_files: failed.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id);
  }

  return { successful, failed };
}

// =====================================================
// CONTENT DRAFTS API
// =====================================================

/**
 * Create content draft
 */
export async function createDraft(draft: Partial<ContentDraft>): Promise<string | null> {
  const { data, error } = await supabase
    .from('content_drafts')
    .insert([{
      ...draft,
      created_by: 'admin' // TODO: Get from auth
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating draft:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Get all drafts
 */
export async function getDrafts(filters: {
  contentType?: string;
  status?: string;
  author?: string;
} = {}): Promise<ContentDraft[]> {
  let query = supabase
    .from('content_drafts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (filters.contentType) {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.author) {
    query = query.eq('author', filters.author);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }

  return data || [];
}

/**
 * Update draft
 */
export async function updateDraft(
  id: string,
  updates: Partial<ContentDraft>
): Promise<boolean> {
  const { error } = await supabase
    .from('content_drafts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: 'admin'
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating draft:', error);
    return false;
  }

  return true;
}

/**
 * Publish draft
 */
export async function publishDraft(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('content_drafts')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error publishing draft:', error);
    return false;
  }

  return true;
}

/**
 * Schedule content
 */
export async function scheduleContent(
  draftId: string,
  publishAt: Date,
  action: 'publish' | 'unpublish' | 'archive' = 'publish'
): Promise<boolean> {
  // Update draft with scheduled time
  await supabase
    .from('content_drafts')
    .update({
      status: 'scheduled',
      scheduled_publish_at: publishAt.toISOString()
    })
    .eq('id', draftId);

  // Add to schedule queue
  const { error } = await supabase
    .from('content_schedule_queue')
    .insert([{
      content_draft_id: draftId,
      action,
      scheduled_for: publishAt.toISOString(),
      created_by: 'admin'
    }]);

  if (error) {
    console.error('Error scheduling content:', error);
    return false;
  }

  return true;
}

// =====================================================
// SEO METADATA API
// =====================================================

/**
 * Get SEO metadata for entity
 */
export async function getSEOMetadata(
  entityType: string,
  entityId: string
): Promise<SEOMetadata | null> {
  const { data, error } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (error) {
    console.error('Error fetching SEO metadata:', error);
    return null;
  }

  return data;
}

/**
 * Update SEO metadata
 */
export async function updateSEOMetadata(
  entityType: string,
  entityId: string,
  metadata: Partial<SEOMetadata>
): Promise<boolean> {
  const { error } = await supabase
    .from('seo_metadata')
    .upsert([{
      entity_type: entityType,
      entity_id: entityId,
      ...metadata,
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error updating SEO metadata:', error);
    return false;
  }

  return true;
}

// =====================================================
// CONTENT SEARCH API
// =====================================================

/**
 * Search content
 */
export async function searchContent(
  query: string,
  options: {
    contentTypes?: string[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('search_content', {
    search_query: query,
    content_types: options.contentTypes || null,
    limit_count: options.limit || 20,
    offset_count: options.offset || 0
  });

  if (error) {
    console.error('Error searching content:', error);
    return [];
  }

  return data || [];
}

/**
 * Index content for search
 */
export async function indexContentForSearch(
  entityType: string,
  entityId: string,
  data: {
    title: string;
    content: string;
    excerpt?: string;
    tags?: string[];
    author?: string;
    publishedAt?: string;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('content_search_index')
    .upsert([{
      entity_type: entityType,
      entity_id: entityId,
      ...data,
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error indexing content:', error);
    return false;
  }

  return true;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  return 'other';
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

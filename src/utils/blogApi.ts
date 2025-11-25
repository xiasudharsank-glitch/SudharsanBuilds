import { supabase } from '../lib/supabase';

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  keywords: string[];
  read_time: string;
  author_name: string;
  author_email?: string;
  category: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  featured_posts: number;
  category_count: number;
  total_views: number;
  avg_views_per_post: number;
}

export interface PopularPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  view_count: number;
  published_at: string;
  category: string;
}

// Fetch all published blog posts (for public site)
export async function fetchPublishedPosts(limit?: number): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return data || [];
}

// Fetch featured blog posts
export async function fetchFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured posts:', error);
    throw error;
  }

  return data || [];
}

// Fetch single blog post by slug
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  // Increment view count
  if (data) {
    await incrementViewCount(data.id);
  }

  return data;
}

// Fetch blog posts by category
export async function fetchPostsByCategory(category: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by category:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch all blog posts (including unpublished)
export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all blog posts:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch single post by ID
export async function fetchPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

// Create new blog post
export async function createBlogPost(
  post: Omit<BlogPost, 'id' | 'view_count' | 'created_at' | 'updated_at'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      slug: post.slug || '', // Will be auto-generated if empty
      excerpt: post.excerpt,
      content: post.content,
      featured_image_url: post.featured_image_url,
      keywords: post.keywords,
      read_time: post.read_time,
      author_name: post.author_name,
      author_email: post.author_email,
      category: post.category,
      is_featured: post.is_featured,
      is_published: post.is_published,
      published_at: post.published_at
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return data?.id || null;
}

// Update blog post
export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

// Delete blog post
export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}

// Toggle published status
export async function togglePostPublished(id: string, isPublished: boolean): Promise<void> {
  await updateBlogPost(id, { is_published: isPublished });
}

// Toggle featured status
export async function togglePostFeatured(id: string, isFeatured: boolean): Promise<void> {
  await updateBlogPost(id, { is_featured: isFeatured });
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment', {
    row_id: id,
    x: 1,
    table_name: 'blog_posts',
    column_name: 'view_count'
  });

  // Fallback if RPC doesn't exist
  if (error) {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('view_count')
      .eq('id', id)
      .single();

    if (post) {
      await supabase
        .from('blog_posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', id);
    }
  }
}

// Upload featured image
export async function uploadBlogImage(file: File, postId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${postId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading blog image:', error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Delete blog image
export async function deleteBlogImage(imageUrl: string): Promise<void> {
  try {
    const path = imageUrl.split('/blog-images/')[1];
    if (path) {
      await supabase.storage
        .from('blog-images')
        .remove([path]);
    }
  } catch (error) {
    console.error('Error deleting blog image:', error);
  }
}

// Get blog statistics
export async function getBlogStats(): Promise<BlogStats | null> {
  const { data, error } = await supabase
    .from('blog_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching blog stats:', error);
    return null;
  }

  return data;
}

// Get popular posts
export async function getPopularPosts(): Promise<PopularPost[]> {
  const { data, error } = await supabase
    .from('popular_blog_posts')
    .select('*');

  if (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }

  return data || [];
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
}

// Search blog posts
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching posts:', error);
    return [];
  }

  return data || [];
}

// Subscribe to blog updates
export function subscribeToBlogPosts(callback: (post: BlogPost) => void) {
  const channel = supabase
    .channel('blog_posts_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'blog_posts'
      },
      (payload) => {
        callback(payload.new as BlogPost);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Calculate read time from content
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
}

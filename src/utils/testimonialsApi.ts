import { supabase } from '../lib/supabase';
import { optimizeAvatar } from './imageOptimization';

// Types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location?: string;
  company?: string;
  avatar_url?: string;
  rating: number;
  text: string;
  service_provided?: string;
  project_url?: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialStats {
  total_count: number;
  published_count: number;
  featured_count: number;
  average_rating: number;
  five_star_count: number;
  recent_count: number;
}

// Fetch all published testimonials (for public site)
export async function fetchPublishedTestimonials(limit?: number): Promise<Testimonial[]> {
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }

  return data || [];
}

// Fetch featured testimonials
export async function fetchFeaturedTestimonials(limit: number = 3): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured testimonials:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch all testimonials (including unpublished)
export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }

  return data || [];
}

// Fetch single testimonial by ID
export async function fetchTestimonialById(id: string): Promise<Testimonial | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching testimonial:', error);
    return null;
  }

  return data;
}

// Create new testimonial
export async function createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      name: testimonial.name,
      role: testimonial.role,
      location: testimonial.location,
      company: testimonial.company,
      avatar_url: testimonial.avatar_url,
      rating: testimonial.rating,
      text: testimonial.text,
      service_provided: testimonial.service_provided,
      project_url: testimonial.project_url,
      is_featured: testimonial.is_featured,
      is_published: testimonial.is_published,
      display_order: testimonial.display_order
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }

  return data?.id || null;
}

// Update testimonial
export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
}

// Delete testimonial
export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
}

// Toggle published status
export async function toggleTestimonialPublished(id: string, isPublished: boolean): Promise<void> {
  await updateTestimonial(id, { is_published: isPublished });
}

// Toggle featured status
export async function toggleTestimonialFeatured(id: string, isFeatured: boolean): Promise<void> {
  await updateTestimonial(id, { is_featured: isFeatured });
}

// Update display order
export async function updateTestimonialOrder(id: string, order: number): Promise<void> {
  await updateTestimonial(id, { display_order: order });
}

// Bulk reorder testimonials
export async function reorderTestimonials(testimonials: { id: string; display_order: number }[]): Promise<void> {
  const updates = testimonials.map(({ id, display_order }) =>
    supabase
      .from('testimonials')
      .update({ display_order })
      .eq('id', id)
  );

  await Promise.all(updates);
}

// Upload avatar image
export async function uploadTestimonialAvatar(file: File, testimonialId: string): Promise<string | null> {
  try {
    // Optimize avatar (square crop, 400x400)
    const optimized = await optimizeAvatar(file);

    const fileName = `${testimonialId}/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('testimonial-avatars')
      .upload(fileName, optimized.file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  } catch (optimizationError) {
    console.error('Error optimizing avatar:', optimizationError);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('testimonial-avatars')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Delete avatar image
export async function deleteTestimonialAvatar(avatarUrl: string): Promise<void> {
  // Extract path from URL
  const path = avatarUrl.split('/testimonial-avatars/')[1];

  if (!path) {
    console.error('Invalid avatar URL:', avatarUrl);
    return;
  }

  const { error } = await supabase.storage
    .from('testimonial-avatars')
    .remove([path]);

  if (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}

// Get testimonial statistics
export async function getTestimonialStats(): Promise<TestimonialStats | null> {
  const { data, error } = await supabase
    .from('testimonial_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching testimonial stats:', error);
    return null;
  }

  return data;
}

// Subscribe to real-time testimonial updates
export function subscribeToTestimonials(callback: (testimonial: Testimonial) => void) {
  const channel = supabase
    .channel('testimonials_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'testimonials'
      },
      (payload) => {
        callback(payload.new as Testimonial);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

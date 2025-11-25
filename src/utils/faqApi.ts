import { supabase } from '../lib/supabase';

// Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQStats {
  total_count: number;
  published_count: number;
  category_count: number;
}

// Fetch all published FAQs (for public site)
export async function fetchPublishedFAQs(limit?: number): Promise<FAQ[]> {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }

  return data || [];
}

// Fetch FAQs by category
export async function fetchFAQsByCategory(category: string): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching FAQs by category:', error);
    throw error;
  }

  return data || [];
}

// Admin: Fetch all FAQs (including unpublished)
export async function fetchAllFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all FAQs:', error);
    throw error;
  }

  return data || [];
}

// Fetch single FAQ by ID
export async function fetchFAQById(id: string): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching FAQ:', error);
    return null;
  }

  return data;
}

// Create new FAQ
export async function createFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('faqs')
    .insert({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
      display_order: faq.display_order
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }

  return data?.id || null;
}

// Update FAQ
export async function updateFAQ(id: string, updates: Partial<FAQ>): Promise<void> {
  const { error } = await supabase
    .from('faqs')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
}

// Delete FAQ
export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
}

// Toggle published status
export async function toggleFAQPublished(id: string, isPublished: boolean): Promise<void> {
  await updateFAQ(id, { is_published: isPublished });
}

// Update display order
export async function updateFAQOrder(id: string, order: number): Promise<void> {
  await updateFAQ(id, { display_order: order });
}

// Bulk reorder FAQs
export async function reorderFAQs(faqs: { id: string; display_order: number }[]): Promise<void> {
  const updates = faqs.map(({ id, display_order }) =>
    supabase
      .from('faqs')
      .update({ display_order })
      .eq('id', id)
  );

  await Promise.all(updates);
}

// Get FAQ statistics
export async function getFAQStats(): Promise<FAQStats | null> {
  const { data, error } = await supabase
    .from('faq_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching FAQ stats:', error);
    return null;
  }

  return data;
}

// Get all unique categories
export async function getFAQCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('category')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching FAQ categories:', error);
    return [];
  }

  // Get unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
}

// Subscribe to real-time FAQ updates
export function subscribeToFAQs(callback: (faq: FAQ) => void) {
  const channel = supabase
    .channel('faqs_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'faqs'
      },
      (payload) => {
        callback(payload.new as FAQ);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

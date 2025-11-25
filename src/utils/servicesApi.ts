import { supabase } from '../lib/supabase';

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  price_inr: number;
  price_usd?: number;
  price_subtext?: string;
  description: string;
  features: string[];
  timeline: string;
  cta_text: string;
  cta_action: 'book' | 'quote';
  deposit_amount_inr?: number;
  deposit_amount_usd?: number;
  is_popular: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceStats {
  total_services: number;
  published_services: number;
  popular_services: number;
}

// Fetch published services (for public site)
export async function fetchPublishedServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data || [];
}

// Fetch all services (for admin)
export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all services:', error);
    throw error;
  }

  return data || [];
}

// Create service
export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data?.id || null;
}

// Update service
export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  const { error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

// Delete service
export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// Toggle published
export async function toggleServicePublished(id: string, isPublished: boolean): Promise<void> {
  await updateService(id, { is_published: isPublished });
}

// Toggle popular
export async function toggleServicePopular(id: string, isPopular: boolean): Promise<void> {
  await updateService(id, { is_popular: isPopular });
}

// Reorder services
export async function reorderServices(services: { id: string; display_order: number }[]): Promise<void> {
  const updates = services.map(({ id, display_order }) =>
    supabase
      .from('services')
      .update({ display_order })
      .eq('id', id)
  );

  await Promise.all(updates);
}

// Get statistics
export async function getServiceStats(): Promise<ServiceStats | null> {
  const { data, error } = await supabase
    .from('service_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching service stats:', error);
    return null;
  }

  return data;
}

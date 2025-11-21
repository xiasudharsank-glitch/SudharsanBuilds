/**
 * Supabase Client Singleton
 *
 * This module provides a single, shared Supabase client instance across the entire application.
 * Using a singleton pattern prevents multiple GoTrueClient instances and reduces memory usage.
 *
 * Benefits:
 * - Single connection pool instead of multiple
 * - Single WebSocket connection instead of multiple
 * - Reduced memory footprint (~50KB vs ~100KB+)
 * - Easier authentication management when auth is added
 * - Centralized configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../utils/env';

// Single Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance
 * This ensures only one instance exists throughout the app lifecycle
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only if environment variables are configured
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized (singleton)');
    return supabaseInstance;
  }

  console.error('❌ Supabase client not initialized - missing environment variables');
  return null;
};

/**
 * Export the default client instance
 * Use this for direct imports: import { supabase } from './supabaseClient'
 */
export const supabase = getSupabaseClient();

/**
 * Check if Supabase is available
 */
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

/**
 * Reset the singleton (useful for testing)
 * WARNING: Only use this in test environments
 */
export const resetSupabaseClient = (): void => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ resetSupabaseClient should only be used in test environments');
  }
  supabaseInstance = null;
};

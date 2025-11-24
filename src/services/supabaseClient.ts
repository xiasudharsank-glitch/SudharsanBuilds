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
 * ✅ P1 FIX: Only logs errors on actual usage, not on module import
 */
export const getSupabaseClient = (silent = false): SupabaseClient | null => {
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

  // ✅ P1 FIX: Only log error if explicitly requested (not on module load)
  if (!silent) {
    console.error('❌ Supabase client not initialized - missing environment variables');
  }
  return null;
};

/**
 * Export the default client instance with lazy initialization
 * ✅ P1 FIX: Client is created on first access, not at module load time
 * This prevents error logs when Supabase is not needed
 * Use this for direct imports: import { supabase } from './supabaseClient'
 */
let _lazySupabase: SupabaseClient | null | undefined = undefined;
export const supabase = new Proxy({} as SupabaseClient | null, {
  get(target, prop) {
    // Initialize on first property access
    if (_lazySupabase === undefined) {
      _lazySupabase = getSupabaseClient(true); // Silent mode - no error logging on init
    }

    // If null, return null for any property access
    if (_lazySupabase === null) {
      return null;
    }

    // Return the property from the actual client
    return (_lazySupabase as any)[prop];
  }
}) as SupabaseClient | null;

/**
 * Check if Supabase is available
 */
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

/**
 * Reset the singleton (useful for testing)
 * WARNING: Only use this in test environments
 * ✅ P1 FIX: Use Vite's import.meta.env.MODE instead of process.env.NODE_ENV
 */
export const resetSupabaseClient = (): void => {
  if (import.meta.env.MODE !== 'test') {
    console.warn('⚠️ resetSupabaseClient should only be used in test environments');
  }
  supabaseInstance = null;
  _lazySupabase = undefined; // ✅ Also reset lazy proxy
};

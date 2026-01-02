/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION
 * ============================================================================
 * 
 * This file creates and exports the Supabase client instance.
 * 
 * ARCHITECTURE DECISION: Singleton Pattern
 * We create a single client instance to:
 * 1. Avoid multiple connections
 * 2. Share auth state across the app
 * 3. Enable connection pooling benefits
 * 
 * SEPARATION OF CONCERNS:
 * This file ONLY handles Supabase connection setup.
 * Database queries live in service files (modules/blog/services/).
 * This separation means:
 * - Swapping Supabase for another backend requires changing only this file
 * - Service files focus on business logic, not connection details
 * 
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Environment variables for Supabase connection.
 * 
 * SECURITY NOTE:
 * - NEXT_PUBLIC_ prefix means these are exposed to the browser
 * - This is OK because Supabase uses Row Level Security (RLS)
 * - The anon key has limited permissions, controlled by RLS policies
 * - Never expose service_role key (full database access) to client
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validates that required environment variables are set.
 * 
 * WHY VALIDATE:
 * - Fail fast with clear error message
 * - Better than cryptic runtime errors later
 * - Helps during initial setup and deployment
 */
function validateEnvironment() {
  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Add it to your .env.local file.'
    );
  }
  
  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Add it to your .env.local file.'
    );
  }
}

/**
 * Creates the Supabase client with proper configuration.
 * 
 * Auth configuration:
 * - autoRefreshToken: true - automatically refresh tokens before expiry
 * - persistSession: true - store session in localStorage for persistence across refreshes
 * - detectSessionInUrl: true - detect OAuth redirects
 */
function createSupabaseClient() {
  // In development without env vars, return a mock that logs warnings
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Supabase environment variables not configured. ' +
      'Database features will not work. ' +
      'See README.md for setup instructions.'
    );
    
    // Return a mock client that won't crash but won't work either
    // This allows the app to run for UI development without Supabase
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    };
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'runtimemind-auth',
    },
  });
}

/**
 * The singleton Supabase client instance.
 * 
 * USAGE:
 * import { supabase } from '@/lib/supabase/client';
 * const { data, error } = await supabase.from('posts').select();
 */
export const supabase = createSupabaseClient();

/**
 * Export for testing and edge cases where a fresh client is needed.
 */
export { createSupabaseClient };

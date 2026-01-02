/**
 * ============================================================================
 * SUPABASE FETCH UTILITY
 * ============================================================================
 * 
 * Raw fetch wrapper for Supabase REST API.
 * Avoids Supabase JS client issues with auth token refresh hanging.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    // First check our custom storage key
    const customKey = 'runtimemind-auth';
    const customStored = localStorage.getItem(customKey);
    if (customStored) {
      const parsed = JSON.parse(customStored);
      // Check if token is not expired
      if (parsed?.access_token && parsed?.expires_at) {
        if (parsed.expires_at * 1000 > Date.now()) {
          return parsed.access_token;
        }
      }
    }
    
    // Fallback: Find the Supabase auth token in localStorage
    // Supabase uses key format: sb-<project-ref>-auth-token
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if token is not expired
          if (parsed?.access_token && parsed?.expires_at) {
            if (parsed.expires_at * 1000 > Date.now()) {
              return parsed.access_token;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to get auth token:', e);
  }
  return null;
}

/**
 * Make authenticated fetch request to Supabase REST API
 * @param {string} endpoint - The REST endpoint (e.g., 'posts?select=*')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function supabaseFetch(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    return { data: null, error };
  }

  // Handle empty responses (like DELETE)
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data, error: null };
}

/**
 * Helper to build PostgREST query string
 */
export function buildQuery(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join('&');
}

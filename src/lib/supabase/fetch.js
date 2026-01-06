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

// Cache tokens in-memory to avoid repeated localStorage scans and NextAuth calls
let cachedToken = null;
let cachedExpiryMs = 0;

// Cache NextAuth session lookups to avoid repeated /api/auth/session calls
let cachedSession = null;
let cachedSessionExpiryMs = 0;
let inFlightSessionPromise = null;

// Lightweight response cache + in-flight deduplication to limit duplicate network requests
const RESPONSE_CACHE_TTL_MS = 15_000;
const responseCache = new Map();
const inFlightRequests = new Map();

function cloneData(data) {
  if (data === null || data === undefined) return data;
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}

function createCacheKey(method, endpoint, authHeader, body) {
  const normalizedMethod = method?.toUpperCase() || 'GET';
  const bodyKey = body
    ? typeof body === 'string'
      ? body
      : JSON.stringify(body)
    : '';

  return `${normalizedMethod}:${endpoint}:${authHeader || ''}:${bodyKey}`;
}

function getCachedResponse(cacheKey) {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    responseCache.delete(cacheKey);
    return null;
  }
  return cloneData(cached.payload);
}

function setCachedResponse(cacheKey, payload) {
  responseCache.set(cacheKey, {
    payload,
    expiresAt: Date.now() + RESPONSE_CACHE_TTL_MS,
  });
}

export function clearSupabaseCache() {
  responseCache.clear();
  inFlightRequests.clear();
}

function setCachedAuthToken(token, expiresAtSeconds) {
  cachedToken = token;
  // Prefer the provided expiry, otherwise assume the token is short-lived and refresh soon
  if (expiresAtSeconds) {
    cachedExpiryMs = expiresAtSeconds * 1000;
  } else {
    cachedExpiryMs = Date.now() + 5 * 60 * 1000; // 5 minute safety window
  }
}

function clearCachedSession() {
  cachedSession = null;
  cachedSessionExpiryMs = 0;
  inFlightSessionPromise = null;
}

export function clearCachedAuthToken() {
  cachedToken = null;
  cachedExpiryMs = 0;
  clearCachedSession();
}

/**
 * Get auth token from localStorage
 */
export async function getAuthToken() {
  if (typeof window === 'undefined') return null;

  // Return cached token if it is still valid for at least 5 more seconds
  if (cachedToken && cachedExpiryMs - Date.now() > 5000) {
    return cachedToken;
  }

  try {
    // Try NextAuth session (client-side only) with caching to avoid repeated /api/auth/session calls
    try {
      if (!cachedSession || cachedSessionExpiryMs < Date.now()) {
        if (!inFlightSessionPromise) {
          const loadSession = async () => {
            const { getSession } = await import('next-auth/react');
            return getSession();
          };
          inFlightSessionPromise = loadSession()
            .then((session) => {
              cachedSession = session;
              // Cache the session for 30 seconds or until shortly before it expires
              if (session?.expires_at) {
                cachedSessionExpiryMs = Math.min(session.expires_at * 1000 - 5000, Date.now() + 30_000);
              } else {
                cachedSessionExpiryMs = Date.now() + 30_000;
              }
              return session;
            })
            .finally(() => {
              inFlightSessionPromise = null;
            });
        }
        cachedSession = await inFlightSessionPromise;
      }

      const session = cachedSession;
      // If NextAuth flagged a refresh error, skip using the cached token so downstream
      // calls can trigger a fresh auth flow instead of relying on stale credentials.
      if (session?.error) {
        clearCachedAuthToken();
        return null;
      }
      if (session?.accessToken) {
        setCachedAuthToken(session.accessToken, session.expires_at);
        return session.accessToken;
      }
      if (session?.accessToken === undefined && session?.user?.accessToken) {
        setCachedAuthToken(session.user.accessToken, session.expires_at);
        return session.user.accessToken;
      }
    } catch (e) {
      // ignore if next-auth not available or fails
      clearCachedSession();
    }

    // First check our custom storage key
    const customKey = 'runtimemind-auth';
    const customStored = localStorage.getItem(customKey);
    if (customStored) {
      const parsed = JSON.parse(customStored);
      // Check if token is not expired
      if (parsed?.access_token && parsed?.expires_at) {
        if (parsed.expires_at * 1000 > Date.now()) {
          setCachedAuthToken(parsed.access_token, parsed.expires_at);
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
              setCachedAuthToken(parsed.access_token, parsed.expires_at);
              return parsed.access_token;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to get auth token:', e);
  }
  clearCachedAuthToken();
  return null;
}

/**
 * Make authenticated fetch request to Supabase REST API
 * @param {string} endpoint - The REST endpoint (e.g., 'posts?select=*')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function supabaseFetch(endpoint, options = {}) {
  // Allow explicit token override
  if (options.token) {
    options.headers = { ...(options.headers || {}), Authorization: `Bearer ${options.token}` };
  }

  const token = options.headers?.Authorization ? null : await getAuthToken();

  const method = options.method?.toUpperCase() || 'GET';
  
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const cacheKey = createCacheKey(method, endpoint, headers.Authorization, options.body);

  if (method === 'GET' && !options.noCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached !== null) {
      return { data: cached, error: null };
    }

    const inflight = inFlightRequests.get(cacheKey);
    if (inflight) {
      const deduped = await inflight;
      return { data: cloneData(deduped.data), error: deduped.error || null };
    }
  }

  const requestPromise = (async () => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized or specific PostgREST JWT expired error, try refreshing session once
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));

      const isJwtExpired = (error && (error.message === 'JWT expired' || error.code === 'PGRST303'));
      if (isJwtExpired && !options._retry) {
        try {
          // Force NextAuth server session refresh
          await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' });
        } catch (e) {
          // ignore
        }

        // Re-run to pick up refreshed token
        const token = await getAuthToken();
        const retryHeaders = {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        };

        const retryResponse = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
          ...options,
          headers: retryHeaders,
        });

        if (!retryResponse.ok) {
          const retryError = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
          return { data: null, error: retryError };
        }

        const retryText = await retryResponse.text();
        const retryData = retryText ? JSON.parse(retryText) : null;
        return { data: retryData, error: null };
      }

      return { data: null, error };
    }

    // Handle empty responses (like DELETE)
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { data, error: null };
  })();

  if (method === 'GET' && !options.noCache) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  const result = await requestPromise.finally(() => {
    if (method === 'GET' && !options.noCache) {
      inFlightRequests.delete(cacheKey);
    }
  });

  if (method === 'GET' && !options.noCache && !result.error) {
    setCachedResponse(cacheKey, result.data);
  }

  return result;
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

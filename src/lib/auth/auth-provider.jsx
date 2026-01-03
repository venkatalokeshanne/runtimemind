/**
 * ============================================================================
 * AUTH CONTEXT & PROVIDER
 * ============================================================================
 * 
 * Provides authentication state across the app using Supabase Auth.
 * 
 * FEATURES:
 * - Session persistence with auto-recovery
 * - Auto-refresh tokens
 * - Sign in / Sign up / Sign out methods
 * - Loading states
 * - Error recovery and retry logic
 * 
 * ============================================================================
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { supabaseFetch } from '@/lib/supabase/fetch';

/**
 * Auth context with default values
 */
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

/**
 * Try to restore session from localStorage immediately (synchronously)
 */
function getInitialAuthState() {
  if (typeof window === 'undefined') return { user: null, session: null };
  try {
    const stored = localStorage.getItem('runtimemind-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.user && parsed?.access_token) {
        // Check if token is not expired
        const expiresAt = parsed.expires_at;
        if (expiresAt && expiresAt * 1000 > Date.now()) {
          return { user: parsed.user, session: parsed };
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored session:', e);
  }
  return { user: null, session: null };
}

/**
 * Auth Provider Component
 * 
 * Wraps the app to provide auth state everywhere.
 */
export function AuthProvider({ children }) {
  // Use lazy initialization to only run getInitialAuthState once
  const [user, setUser] = useState(() => getInitialAuthState().user);
  const [session, setSession] = useState(() => getInitialAuthState().session);
  const [loading, setLoading] = useState(() => !getInitialAuthState().session);
  const [initialized, setInitialized] = useState(() => !!getInitialAuthState().session);
  
  // Prevent race conditions with refs
  const isMounted = useRef(true);
  const isRefreshing = useRef(false);

  // Fetch user profile from database and merge with auth user
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    // Helper to extract display name from various sources
    const getDisplayName = (profile, metadata, email) => {
      // Priority: profile name > metadata name > metadata full_name > email username
      if (profile?.name) return profile.name;
      if (metadata?.name) return metadata.name;
      if (metadata?.full_name) return metadata.full_name;
      if (email) return email.split('@')[0];
      return null;
    };

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, bio, website')
        .eq('id', authUser.id)
        .single();

      // If client returns an error or no profile, try REST fallback (helps when client env is misconfigured)
      let finalProfile = profile;
      if (error || !finalProfile) {
        console.warn('Profile fetch via client failed or returned empty, attempting REST fallback:', error?.message || 'no data');
        try {
          const endpoint = `profiles?select=name,avatar_url,bio,website&id=eq.${encodeURIComponent(authUser.id)}`;
          const { data: restData, error: restError } = await supabaseFetch(endpoint, { method: 'GET' });
          if (!restError && Array.isArray(restData) && restData.length > 0) {
            finalProfile = restData[0];
          } else if (restError) {
            console.warn('REST profile fetch failed:', restError.message || restError);
          }
        } catch (restErr) {
          console.error('Unexpected REST fallback error:', restErr);
        }
      }

      // Merge auth user with profile data
      return {
        ...authUser,
        name: getDisplayName(finalProfile, authUser.user_metadata, authUser.email),
        avatar_url: finalProfile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        bio: finalProfile?.bio || null,
        website: finalProfile?.website || null,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return auth user with metadata fallback
      return {
        ...authUser,
        name: getDisplayName(null, authUser.user_metadata, authUser.email),
        avatar_url: authUser.user_metadata?.avatar_url || null,
      };
    }
  }, []);

  // Refresh session manually - call this if session seems stale
  const refreshSession = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        // If refresh fails, try getting session from storage
        const { data: { session: storedSession } } = await supabase.auth.getSession();
        if (storedSession && isMounted.current) {
          setSession(storedSession);
          const enrichedUser = await fetchUserProfile(storedSession.user);
          setUser(enrichedUser);
        }
        return { error };
      }
      
      if (refreshedSession && isMounted.current) {
        setSession(refreshedSession);
        const enrichedUser = await fetchUserProfile(refreshedSession.user);
        setUser(enrichedUser);
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected refresh error:', err);
      return { error: { message: err.message } };
    } finally {
      isRefreshing.current = false;
    }
  }, [fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    isMounted.current = true;
    
    // Get initial session
    async function initializeAuth() {
      try {
        // First try to get existing session from Supabase (verifies with server)
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (!isMounted.current) return;
        
        if (initialSession?.user) {
          setSession(initialSession);
          // Only fetch profile if we don't have cached user data or it's stale
          if (!user || user.id !== initialSession.user.id) {
            const enrichedUser = await fetchUserProfile(initialSession.user);
            if (isMounted.current) {
              setUser(enrichedUser);
            }
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted.current) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted.current) return;
        
        console.log('Auth state change:', event);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            // Clear any stale user-specific cache when signing in
            if (currentSession?.user) {
              setSession(currentSession);
              const enrichedUser = await fetchUserProfile(currentSession.user);
              if (isMounted.current) {
                setUser(enrichedUser);
              }
            }
            break;
            
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (currentSession?.user) {
              setSession(currentSession);
              const enrichedUser = await fetchUserProfile(currentSession.user);
              if (isMounted.current) {
                setUser(enrichedUser);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            // Clear all user-specific cache on sign out
            setSession(null);
            setUser(null);
            break;
            
          case 'INITIAL_SESSION':
            // Already handled above, but update if needed
            if (currentSession?.user) {
              setSession(currentSession);
              const enrichedUser = await fetchUserProfile(currentSession.user);
              if (isMounted.current) {
                setUser(enrichedUser);
              }
            }
            break;
            
          default:
            // For any other events, sync the session
            setSession(currentSession);
            if (currentSession?.user) {
              const enrichedUser = await fetchUserProfile(currentSession.user);
              if (isMounted.current) {
                setUser(enrichedUser);
              }
            } else {
              setUser(null);
            }
        }
        
        if (isMounted.current) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted.current = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Auto-refresh session periodically when window regains focus
  useEffect(() => {
    if (!initialized) return;
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && session) {
        // Check if token might be stale (older than 50 minutes)
        const tokenAge = session.expires_at ? 
          (session.expires_at * 1000 - Date.now()) / 1000 / 60 : 60;
        
        if (tokenAge < 10) {
          console.log('Token expiring soon, refreshing...');
          await refreshSession();
        }
      }
    };

    const handleOnline = async () => {
      if (session) {
        console.log('Back online, verifying session...');
        await refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [initialized, session, refreshSession]);

  /**
   * Sign in with email and password
   */
  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Sign up with email and password
   */
  async function signUp(email, password, name) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      // Clear local state immediately
      setUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

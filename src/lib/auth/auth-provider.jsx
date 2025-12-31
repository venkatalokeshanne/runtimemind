/**
 * ============================================================================
 * AUTH CONTEXT & PROVIDER
 * ============================================================================
 * 
 * Provides authentication state across the app using Supabase Auth.
 * 
 * FEATURES:
 * - Session persistence
 * - Auto-refresh tokens
 * - Sign in / Sign up / Sign out methods
 * - Loading states
 * 
 * ARCHITECTURE:
 * Uses React Context to avoid prop drilling auth state.
 * Any component can access auth via useAuth() hook.
 * 
 * ============================================================================
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

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
});

/**
 * Auth Provider Component
 * 
 * Wraps the app to provide auth state everywhere.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    async function getInitialSession() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{data: object|null, error: object|null}>}
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
   * 
   * @param {string} email 
   * @param {string} password 
   * @param {string} name - Display name for profile
   * @returns {Promise<{data: object|null, error: object|null}>}
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
   * 
   * @returns {Promise<{error: object|null}>}
   */
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * 
 * USAGE:
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

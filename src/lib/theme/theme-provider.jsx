/**
 * ============================================================================
 * THEME PROVIDER
 * ============================================================================
 * 
 * Provides dark/light mode theming with:
 * - System preference detection
 * - Manual override support
 * - LocalStorage persistence
 * - No flash on page load
 * 
 * ARCHITECTURE:
 * 
 * 1. CONTEXT PATTERN:
 *    Theme state is lifted to a provider to avoid prop drilling.
 *    Any component can access theme via useTheme hook.
 * 
 * 2. HYDRATION HANDLING:
 *    Theme is resolved on the server to prevent flash.
 *    We use a script in layout.js that runs before React hydrates.
 * 
 * 3. STORAGE STRATEGY:
 *    - null: Follow system preference
 *    - 'light': Force light mode
 *    - 'dark': Force dark mode
 * 
 * ============================================================================
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme context with default values.
 * 
 * WHY DEFAULT VALUES:
 * - Prevents crashes if useTheme is called outside provider
 * - TypeScript/JSDoc can infer shape from defaults
 */
const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

/**
 * Storage key for theme preference.
 * Prefixed to avoid conflicts with other apps on same domain.
 */
const STORAGE_KEY = 'runtimemind-theme';

/**
 * Theme Provider Component
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.defaultTheme - Initial theme before hydration
 */
export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
}) {
  // Theme can be 'light', 'dark', or 'system'
  const [theme, setThemeState] = useState(defaultTheme);
  
  // The actual applied theme (always 'light' or 'dark')
  const [resolvedTheme, setResolvedTheme] = useState('light');

  /**
   * Resolves 'system' to actual theme based on media query.
   */
  function getResolvedTheme(themeValue) {
    if (themeValue === 'system') {
      // Check system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      return 'light';
    }
    return themeValue;
  }

  /**
   * Applies theme to document and updates state.
   */
  function applyTheme(newTheme) {
    const resolved = getResolvedTheme(newTheme);
    
    // Update document class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    
    setResolvedTheme(resolved);
  }

  /**
   * Sets theme and persists to storage.
   */
  function setTheme(newTheme) {
    setThemeState(newTheme);
    
    // Persist to localStorage
    try {
      if (newTheme === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }
    } catch (e) {
      // localStorage might be unavailable (private browsing, etc.)
      console.warn('Failed to save theme preference:', e);
    }
    
    applyTheme(newTheme);
  }

  /**
   * Initialize theme on mount.
   * 
   * WHY useEffect:
   * - localStorage is only available client-side
   * - Need to sync with system preference changes
   */
  useEffect(() => {
    // Read stored preference
    let storedTheme = null;
    try {
      storedTheme = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Ignore storage errors
    }

    // Apply stored or default theme
    const initialTheme = storedTheme || defaultTheme;
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function handleChange() {
      // Only react if theme is 'system'
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme('system');
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [defaultTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * 
 * USAGE:
 * const { theme, setTheme, resolvedTheme } = useTheme();
 * 
 * @returns {{ theme: string, setTheme: function, resolvedTheme: string }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

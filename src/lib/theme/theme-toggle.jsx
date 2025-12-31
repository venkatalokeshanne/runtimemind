/**
 * ============================================================================
 * THEME TOGGLE COMPONENT
 * ============================================================================
 * 
 * A button to toggle between light, dark, and system themes.
 * 
 * UX DECISIONS:
 * - Shows current resolved theme icon (sun/moon)
 * - Click cycles through: light → dark → system
 * - System follows OS preference
 * - Includes screen reader label
 * 
 * ============================================================================
 */

'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/ui/button';

/**
 * Theme Toggle Button
 * 
 * Simple toggle that cycles through themes.
 * Could be expanded to a dropdown for explicit theme selection.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  /**
   * Cycle through themes in order: light → dark → system
   */
  function cycleTheme() {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }

  /**
   * Get icon based on current theme setting
   */
  function getIcon() {
    // If explicitly set, show that setting
    if (theme === 'light') {
      return <Sun className="h-5 w-5" />;
    }
    if (theme === 'dark') {
      return <Moon className="h-5 w-5" />;
    }
    // System: show monitor icon
    return <Monitor className="h-5 w-5" />;
  }

  /**
   * Get accessible label for screen readers
   */
  function getLabel() {
    const labels = {
      light: 'Switch to dark mode',
      dark: 'Switch to system theme',
      system: 'Switch to light mode',
    };
    return labels[theme];
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={`Current: ${theme} theme`}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}

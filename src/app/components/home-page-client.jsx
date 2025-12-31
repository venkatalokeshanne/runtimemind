'use client';

/**
 * ============================================================================
 * HOME PAGE WRAPPER
 * ============================================================================
 * 
 * Conditionally renders either:
 * - HomeFeed (Medium-style) for logged-in users
 * - LandingPage (marketing) for logged-out users
 */

import { useAuth } from '@/lib/auth';
import { HomeFeed } from './home-feed';

export function HomePageClient({ posts, tags, series, children }) {
  const { user, loading } = useAuth();

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged in: Show Medium-style feed
  if (user) {
    return <HomeFeed posts={posts} tags={tags} series={series} />;
  }

  // Logged out: Show landing page (passed as children)
  return <>{children}</>;
}

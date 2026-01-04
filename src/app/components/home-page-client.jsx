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

import Link from 'next/link';
import { PenTool } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { HomeFeed } from './home-feed';
import { Button } from '@/ui/button';

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
  return (
    <>
      {children}

      {/* Landing-page floating CTA for logged-out users only */}
      {!user && (
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group rounded-full"
            asChild
          >
            <Link href="/dashboard/new">
              <PenTool className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">Write</span>
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

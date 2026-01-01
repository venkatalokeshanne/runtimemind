/**
 * ============================================================================
 * DASHBOARD HEADER COMPONENT
 * ============================================================================
 * 
 * Header section with welcome message and primary action button.
 * 
 * ============================================================================
 */

import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { Button } from '@/ui/button';

export function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
        </h1>
        <p className="text-text-secondary mt-1">
          Here's what's happening with your blog.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/new">
          <PenSquare className="w-4 h-4 mr-2" />
          Write new post
        </Link>
      </Button>
    </div>
  );
}
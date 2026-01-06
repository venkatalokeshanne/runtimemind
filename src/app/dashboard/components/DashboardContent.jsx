/**
 * =============================================================================
 * DASHBOARD CONTENT (CLIENT)
 * =============================================================================
 *
 * Client-side wrapper for the dashboard experience. Fetches user session data
 * and renders the core dashboard widgets.
 *
 * =============================================================================
 */

'use client';

import { useAuth } from '@/lib/auth';
import { DashboardHeader } from './DashboardHeader';
import { StatsGrid } from './StatsGrid';
import { QuickActions } from './QuickActions';
import { RecentPosts } from './RecentPosts';
import { useDashboardStats } from './useDashboardStats';

export function DashboardContent() {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboardStats(user);

  if (error) {
    console.warn('Dashboard stats error:', error);
  }

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} />
      <StatsGrid stats={stats} loading={loading} />
      <QuickActions />
      <RecentPosts />
    </div>
  );
}

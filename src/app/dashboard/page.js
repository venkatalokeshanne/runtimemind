/**
 * ============================================================================
 * DASHBOARD OVERVIEW PAGE
 * ============================================================================
 * 
 * Main dashboard page with stats and recent activity.
 * Clean architecture with componentized sections.
 * 
 * ============================================================================
 */

'use client';

import { useAuth } from '@/lib/auth';
import { 
  DashboardHeader, 
  StatsGrid, 
  QuickActions, 
  RecentPosts, 
  useDashboardStats 
} from './components';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboardStats(user);

  // Show error state if stats failed to load
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

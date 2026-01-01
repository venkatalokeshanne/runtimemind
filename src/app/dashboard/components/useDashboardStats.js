/**
 * ============================================================================
 * USE DASHBOARD STATS HOOK
 * ============================================================================
 * 
 * Custom hook for managing dashboard stats state and fetching.
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { FileText, Eye, TrendingUp } from 'lucide-react';
import { getUserStats } from '@/modules/articles/services/posts';

const DEFAULT_STATS = [
  { label: 'Total Posts', value: '0', icon: FileText, change: '+0 this month' },
  { label: 'Total Views', value: '0', icon: Eye, change: '+0 this week' },
  { label: 'Published', value: '0', icon: TrendingUp, change: '0 drafts' },
];

export function useDashboardStats(user) {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: userStats, error: fetchError } = await getUserStats(user.id);
        
        if (fetchError) {
          console.error('Failed to fetch user stats:', fetchError);
          setError(fetchError);
          return;
        }

        if (userStats) {
          setStats([
            { 
              label: 'Total Posts', 
              value: userStats.totalPosts.toString(), 
              icon: FileText, 
              change: `+${userStats.changes?.postsThisMonth || 0} this month` 
            },
            { 
              label: 'Total Views', 
              value: userStats.totalViews.toLocaleString(), 
              icon: Eye, 
              change: `+${userStats.changes?.viewsThisWeek || 0} this week` 
            },
            { 
              label: 'Published', 
              value: userStats.publishedPosts.toString(), 
              icon: TrendingUp, 
              change: `${userStats.draftPosts} drafts` 
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError({ message: 'Failed to fetch stats' });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  return { stats, loading, error };
}
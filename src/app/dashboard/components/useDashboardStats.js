'use client';

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

const STATS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const statsCache = new Map();
const inFlightStats = new Map();

function getCachedStats(userId) {
  if (!userId) return null;

  const cached = statsCache.get(userId);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    statsCache.delete(userId);
    return null;
  }

  return cached.data;
}

function setCachedStats(userId, data) {
  if (!userId) return;
  statsCache.set(userId, {
    data,
    expiresAt: Date.now() + STATS_CACHE_TTL_MS,
  });
}

async function fetchStatsForUser(userId) {
  if (!userId) return { data: null, error: null };

  const existing = inFlightStats.get(userId);
  if (existing) return existing;

  const promise = (async () => {
    const { data: userStats, error } = await getUserStats(userId);
    if (error) {
      console.error('Failed to fetch user stats:', error);
      return { data: null, error };
    }

    if (!userStats) {
      return { data: null, error: { message: 'No stats returned' } };
    }

    const nextStats = [
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
    ];

    setCachedStats(userId, nextStats);
    return { data: nextStats, error: null };
  })();

  inFlightStats.set(userId, promise);

  try {
    return await promise;
  } finally {
    inFlightStats.delete(userId);
  }
}

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
    let cancelled = false;

    async function fetchStats() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const cached = getCachedStats(user.id);
      if (cached) {
        setStats(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: fetchedStats, error: fetchError } = await fetchStatsForUser(user.id);

        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (fetchedStats && !cancelled) {
          setStats(fetchedStats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError({ message: 'Failed to fetch stats' });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { stats, loading, error };
}
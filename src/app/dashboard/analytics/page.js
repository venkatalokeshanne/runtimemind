/**
 * ============================================================================
 * AUTHOR ANALYTICS PAGE
 * ============================================================================
 * 
 * Shows detailed analytics for author's posts including views, likes,
 * comments, and performance metrics.
 * 
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Calendar,
  ArrowUpRight,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { formatDateShort } from '@/lib/utils';

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'accent' }) {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary">{value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Post Analytics Row Component
function PostAnalyticsRow({ post, rank }) {
  const engagementRate = post.view_count > 0 
    ? (((post.likes_count || 0) + (post.comments_count || 0)) / post.view_count * 100).toFixed(1)
    : 0;

  return (
    <Link 
      href={`/articles/${post.slug}`}
      className="flex items-center gap-4 p-4 hover:bg-hover rounded-lg transition-colors group"
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-inset text-text-muted text-sm font-medium">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-text-muted mt-0.5">
          {post.published_at ? formatDateShort(post.published_at) : 'Draft'}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-1.5 min-w-[70px]">
          <Eye className="w-4 h-4 text-text-muted" />
          <span>{(post.view_count || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[50px]">
          <Heart className="w-4 h-4 text-text-muted" />
          <span>{post.likes_count || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[50px]">
          <MessageSquare className="w-4 h-4 text-text-muted" />
          <span>{post.comments_count || 0}</span>
        </div>
        <div className="min-w-[60px] text-right">
          <span className="text-accent font-medium">{engagementRate}%</span>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
    </Link>
  );
}

// Simple Bar Chart Component
function SimpleBarChart({ data, label }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">{label}</p>
      <div className="flex items-end gap-1 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-accent/20 rounded-t hover:bg-accent/30 transition-colors relative group"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '4px' : '0' }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-accent rounded-t transition-all"
                style={{ height: '100%' }}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-inset border border-border rounded text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.value.toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });
  const [posts, setPosts] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch all user posts with stats
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('id, slug, title, published, published_at, created_at, view_count, likes_count, comments_count')
          .eq('author_id', user.id)
          .order('view_count', { ascending: false });

        if (error) {
          console.error('Error fetching analytics:', error);
          return;
        }

        const allPosts = postsData || [];
        setPosts(allPosts);

        // Calculate totals
        const totalViews = allPosts.reduce((sum, p) => sum + (p.view_count || 0), 0);
        const totalLikes = allPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
        const totalComments = allPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
        const publishedPosts = allPosts.filter(p => p.published).length;
        const draftPosts = allPosts.filter(p => !p.published).length;

        setStats({
          totalViews,
          totalLikes,
          totalComments,
          totalPosts: allPosts.length,
          publishedPosts,
          draftPosts,
        });

      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user?.id]);

  // Generate chart data for posts by month
  const getPostsByMonthData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = posts.filter(p => {
        if (!p.published_at) return false;
        const pubDate = new Date(p.published_at);
        return pubDate >= monthStart && pubDate <= monthEnd;
      }).length;
      
      months.push({ label: monthLabel, value: count });
    }
    
    return months;
  };

  // Generate views distribution data
  const getViewsDistributionData = () => {
    const topPosts = posts.slice(0, 5);
    return topPosts.map(p => ({
      label: p.title.slice(0, 10) + (p.title.length > 10 ? '...' : ''),
      value: p.view_count || 0,
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avgViewsPerPost = stats.publishedPosts > 0 
    ? Math.round(stats.totalViews / stats.publishedPosts) 
    : 0;

  const engagementRate = stats.totalViews > 0
    ? ((stats.totalLikes + stats.totalComments) / stats.totalViews * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">Track your content performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Time</option>
            <option value="month">Last 30 Days</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Views" 
          value={stats.totalViews} 
          icon={Eye}
          color="blue"
        />
        <StatCard 
          title="Total Likes" 
          value={stats.totalLikes} 
          icon={Heart}
          color="accent"
        />
        <StatCard 
          title="Total Comments" 
          value={stats.totalComments} 
          icon={MessageSquare}
          color="green"
        />
        <StatCard 
          title="Published Posts" 
          value={stats.publishedPosts} 
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Avg. Views per Post</p>
          <p className="text-xl font-bold text-text-primary">{avgViewsPerPost.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Engagement Rate</p>
          <p className="text-xl font-bold text-text-primary">{engagementRate}%</p>
          <p className="text-xs text-text-muted mt-1">(Likes + Comments) / Views</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Draft Posts</p>
          <p className="text-xl font-bold text-text-primary">{stats.draftPosts}</p>
          {stats.draftPosts > 0 && (
            <Link href="/dashboard/posts" className="text-xs text-accent hover:underline mt-1 inline-block">
              Continue writing →
            </Link>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Posts by Month */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Posts Published</h2>
          <SimpleBarChart data={getPostsByMonthData()} label="Last 6 months" />
        </div>

        {/* Views Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Top Posts by Views</h2>
          {posts.length > 0 ? (
            <SimpleBarChart data={getViewsDistributionData()} label="Top 5 posts" />
          ) : (
            <p className="text-text-muted text-sm">No posts yet</p>
          )}
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Post Performance</h2>
          <div className="hidden sm:flex items-center gap-6 text-xs text-text-muted pr-8">
            <span className="min-w-[70px]">Views</span>
            <span className="min-w-[50px]">Likes</span>
            <span className="min-w-[50px]">Comments</span>
            <span className="min-w-[60px] text-right">Engagement</span>
          </div>
        </div>
        
        {posts.length > 0 ? (
          <div className="divide-y divide-border">
            {posts.slice(0, 10).map((post, index) => (
              <PostAnalyticsRow key={post.id} post={post} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-secondary mb-4">No posts yet</p>
            <Link 
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Write your first post
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {posts.length > 10 && (
          <div className="p-4 border-t border-border text-center">
            <Link 
              href="/dashboard/posts"
              className="text-sm text-accent hover:underline"
            >
              View all {posts.length} posts →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

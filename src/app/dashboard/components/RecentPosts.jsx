/**
 * ============================================================================
 * RECENT POSTS COMPONENT
 * ============================================================================
 * 
 * Recent posts section that actually fetches and displays user posts.
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Eye, Edit } from 'lucide-react';
import { Button } from '@/ui/button';
import { getPostsByAuthor } from '@/modules/articles/services/posts';
import { useAuth } from '@/lib/auth';
import { formatDateShort, getPostDisplayDate } from '@/lib/utils';

const RECENT_POSTS_TTL_MS = 2 * 60 * 1000; // 2 minutes
const recentPostsCache = new Map();
const inFlightRecentPosts = new Map();

function getCachedPosts(userId, includeDrafts = true) {
  if (!userId) return null;

  const cacheKey = `${userId}:${includeDrafts ? 'withDrafts' : 'publishedOnly'}`;
  const cached = recentPostsCache.get(cacheKey);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    recentPostsCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function setCachedPosts(userId, data, includeDrafts = true) {
  if (!userId) return;

  const cacheKey = `${userId}:${includeDrafts ? 'withDrafts' : 'publishedOnly'}`;
  recentPostsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + RECENT_POSTS_TTL_MS,
  });
}

async function fetchRecentPostsForUser(userId, includeDrafts = true) {
  if (!userId) return { data: [], error: null };

  const cacheKey = `${userId}:${includeDrafts ? 'withDrafts' : 'publishedOnly'}`;
  const existing = inFlightRecentPosts.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    const { data, error } = await getPostsByAuthor(userId, { includeDrafts });

    if (error) {
      console.error('Failed to fetch recent posts:', error);
      return { data: [], error };
    }

    const recent = (data || []).slice(0, 3);
    setCachedPosts(userId, recent, includeDrafts);
    return { data: recent, error: null };
  })();

  inFlightRecentPosts.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    inFlightRecentPosts.delete(cacheKey);
  }
}

function PostItem({ post }) {
  const displayDate = getPostDisplayDate(post);
  const formattedDate = formatDateShort(displayDate);
  
  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-[var(--radius-md)] hover:border-accent/50 hover:bg-accent/5 transition-colors">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link 
              href={`/articles/${post.slug}`}
              className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
            >
              {post.title}
            </Link>
            {post.excerpt && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.view_count || 0} views
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                post.published 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
                {post.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <Link 
            href={`/dashboard/edit/${post.id}`}
            className="p-2 text-text-muted hover:text-accent transition-colors"
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RecentPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecentPosts() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const cached = getCachedPosts(user.id, true);
      if (cached) {
        setPosts(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await fetchRecentPostsForUser(user.id, true);

        if (error) {
          setError(error);
          return;
        }

        if (!cancelled) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Error fetching recent posts:', err);
        setError({ message: 'Failed to load recent posts' });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecentPosts();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent Posts</h2>
        <Link 
          href="/dashboard/posts"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          View all
        </Link>
      </div>
      
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-border rounded mb-2" />
              <div className="h-3 bg-border rounded w-3/4 mb-2" />
              <div className="h-3 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-text-secondary mb-4">
            Failed to load recent posts.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary mb-4">
            You haven't written any posts yet.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/new">Write your first post</Link>
          </Button>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
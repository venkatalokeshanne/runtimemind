'use client';

/**
 * ============================================================================
 * BOOKMARKS PAGE - User's Reading List
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Clock, Trash2, FileText, Layers } from 'lucide-react';
import { Button } from '@/ui/button';
import { getUserBookmarks, removeBookmark, getUserSeriesBookmarks, removeSeriesBookmark } from '@/modules/articles/services';

/**
 * Bookmark Card Component (for posts)
 */
function BookmarkCard({ post, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    await onRemove(post.id);
  };

  return (
    <article className="group py-6 border-b border-border">
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-xs font-medium text-accent">
                  {post.author?.name?.[0] || 'A'}
                </span>
              </div>
            )}
            <Link 
              href={`/articles?author=${post.author?.id}`}
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              {post.author?.name || 'Anonymous'}
            </Link>
          </div>

          {/* Title & Excerpt */}
          <Link href={`/articles/${post.slug}`} className="block group/link">
            <h2 className="font-bold text-lg text-text-primary group-hover/link:text-accent transition-colors mb-2 line-clamp-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-text-secondary line-clamp-2 text-sm mb-3">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>
                {post.published_at 
                  ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Draft'
                }
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.read_time_minutes || 5} min read
              </span>
            </div>
            <button 
              onClick={handleRemove}
              disabled={removing}
              className={`p-2 rounded-full text-text-muted hover:text-error transition-colors ${removing ? 'opacity-50' : ''}`}
              title="Remove from reading list"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        {post.cover_image_url && (
          <Link href={`/articles/${post.slug}`} className="flex-shrink-0">
            <div className="relative w-28 h-28 md:w-36 md:h-28 overflow-hidden rounded-lg">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * Series Bookmark Card Component
 */
function SeriesBookmarkCard({ series, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    await onRemove(series.id);
  };

  return (
    <article className="group py-6 border-b border-border">
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            {series.author?.avatar_url ? (
              <Image
                src={series.author.avatar_url}
                alt={series.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs font-medium text-purple-500">
                  {series.author?.name?.[0] || 'A'}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-text-primary">
              {series.author?.name || 'Anonymous'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
              Series
            </span>
          </div>

          {/* Title & Description */}
          <Link href={`/series/${series.slug}`} className="block group/link">
            <h2 className="font-bold text-lg text-text-primary group-hover/link:text-accent transition-colors mb-2 line-clamp-2">
              {series.title}
            </h2>
            {series.description && (
              <p className="text-text-secondary line-clamp-2 text-sm mb-3">
                {series.description}
              </p>
            )}
          </Link>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Multi-part series
              </span>
            </div>
            <button 
              onClick={handleRemove}
              disabled={removing}
              className={`p-2 rounded-full text-text-muted hover:text-error transition-colors ${removing ? 'opacity-50' : ''}`}
              title="Remove from reading list"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        {series.cover_image_url && (
          <Link href={`/series/${series.slug}`} className="flex-shrink-0">
            <div className="relative w-28 h-28 md:w-36 md:h-28 overflow-hidden rounded-lg">
              <Image
                src={series.cover_image_url}
                alt={series.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * Main Bookmarks Page
 */
export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('posts');
  const [bookmarks, setBookmarks] = useState([]);
  const [seriesBookmarks, setSeriesBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load bookmarks
  useEffect(() => {
    if (!user?.id) return;

    const loadBookmarks = async () => {
      setLoading(true);
      const [postsResult, seriesResult] = await Promise.all([
        getUserBookmarks(user.id),
        getUserSeriesBookmarks(user.id)
      ]);
      setBookmarks(postsResult.data || []);
      setSeriesBookmarks(seriesResult.data || []);
      setLoading(false);
    };

    loadBookmarks();
  }, [user?.id]);

  // Handle remove post bookmark
  const handleRemovePost = useCallback(async (postId) => {
    if (!user?.id) return;
    
    await removeBookmark(user.id, postId);
    setBookmarks(prev => prev.filter(b => b.post?.id !== postId));
  }, [user?.id]);

  // Handle remove series bookmark
  const handleRemoveSeries = useCallback(async (seriesId) => {
    if (!user?.id) return;
    
    await removeSeriesBookmark(user.id, seriesId);
    setSeriesBookmarks(prev => prev.filter(b => b.series?.id !== seriesId));
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const posts = bookmarks.map(b => b.post).filter(Boolean);
  const series = seriesBookmarks.map(b => b.series).filter(Boolean);
  const totalCount = posts.length + series.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-accent" />
              Reading List
            </h1>
            <p className="text-text-muted text-sm">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            Articles ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'series'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers className="w-4 h-4" />
            Series ({series.length})
          </button>
        </div>

        {/* Empty State */}
        {activeTab === 'posts' && posts.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No articles saved</h2>
            <p className="text-text-muted mb-6">
              Click the bookmark icon on any article to save it for later.
            </p>
            <Button onClick={() => router.push('/articles')}>
              Browse articles
            </Button>
          </div>
        )}

        {activeTab === 'series' && series.length === 0 && (
          <div className="py-16 text-center">
            <Layers className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No series saved</h2>
            <p className="text-text-muted mb-6">
              Click the bookmark icon on any series to save it for later.
            </p>
            <Button onClick={() => router.push('/series')}>
              Browse series
            </Button>
          </div>
        )}

        {/* Posts List */}
        {activeTab === 'posts' && (
          <div>
            {posts.map((post) => (
              <BookmarkCard 
                key={post.id} 
                post={post}
                onRemove={handleRemovePost}
              />
            ))}
          </div>
        )}

        {/* Series List */}
        {activeTab === 'series' && (
          <div>
            {series.map((s) => (
              <SeriesBookmarkCard 
                key={s.id} 
                series={s}
                onRemove={handleRemoveSeries}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

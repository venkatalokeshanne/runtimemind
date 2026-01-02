'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bookmark } from 'lucide-react';
import { getPublishedSeries, getSeriesPostsCount, getPostsInSeries, isSeriesBookmarked, toggleSeriesBookmark } from '@/modules/articles/services';
import { useAuth } from '@/lib/auth';
import { ImagePlaceholder } from '@/modules/articles/components';

// Vercel-style Card
function CardItem({ series, index }) {
  const { user } = useAuth();
  const [postCount, setPostCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { count } = await getSeriesPostsCount(series.id);
      setPostCount(count || 0);
      
      if (user) {
        const isBookmarked = await isSeriesBookmarked(user.id, series.id);
        setBookmarked(isBookmarked);
      }
    }
    loadData();
  }, [series.id, user]);

  const handleMouseEnter = async () => {
    setShowPreview(true);
    if (!loaded) {
      const { data } = await getPostsInSeries(series.id);
      setPosts(data || []);
      setLoaded(true);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    const result = await toggleSeriesBookmark(user.id, series.id);
    setBookmarked(result.bookmarked);
    setBookmarkLoading(false);
  };

  return (
    <div 
      className="relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPreview(false)}
    >
      <Link href={`/blog/series/${series.slug}`} className="block group h-full">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="h-full flex flex-col p-6 rounded-lg border border-border hover:border-text-muted/30 transition-colors bg-surface"
        >
          <div className="relative w-full aspect-[16/9] mb-4 rounded-md overflow-hidden bg-surface-inset">
            {series.cover_image_url ? (
              <Image
                src={series.cover_image_url}
                alt={series.title}
                fill
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder title={series.title} type="series" />
            )}
            {/* Bookmark Button */}
            {user && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${
                  bookmarked 
                    ? 'bg-accent text-white' 
                    : 'bg-black/30 text-white hover:bg-black/50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors mb-2">
            {series.title}
          </h3>

          <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
            {series.description || 'No description'}
          </p>

          <div className="flex items-center justify-between text-sm text-text-muted mt-auto">
            <div className="flex items-center gap-2">
              {series.author?.avatar_url && (
                <Image
                  src={series.author.avatar_url}
                  alt={series.author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span>{series.author?.name}</span>
            </div>
            <span>{postCount} posts</span>
          </div>
        </motion.article>
      </Link>

      {/* Hover Preview */}
      <AnimatePresence>
        {showPreview && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 p-4 rounded-lg border border-border bg-surface shadow-lg"
          >
            <p className="text-xs text-text-muted mb-3 font-medium">Articles in this series:</p>
            <ul className="space-y-2">
              {posts.slice(0, 5).map((post, i) => (
                <li key={post.id}>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2 text-sm text-text-primary hover:text-accent transition-colors"
                  >
                    <span className="text-text-muted text-xs w-5">{i + 1}.</span>
                    <span className="line-clamp-1">{post.title}</span>
                  </Link>
                </li>
              ))}
              {posts.length > 5 && (
                <li className="text-xs text-text-muted pt-1">
                  +{posts.length - 5} more articles
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Straight/List style item
function ListItem({ series, index }) {
  const { user } = useAuth();
  const [postCount, setPostCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { count } = await getSeriesPostsCount(series.id);
      setPostCount(count || 0);
      
      if (user) {
        const isBookmarked = await isSeriesBookmarked(user.id, series.id);
        setBookmarked(isBookmarked);
      }
    }
    loadData();
  }, [series.id, user]);

  const handleMouseEnter = async () => {
    setShowPreview(true);
    if (!loaded) {
      const { data } = await getPostsInSeries(series.id);
      setPosts(data || []);
      setLoaded(true);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    const result = await toggleSeriesBookmark(user.id, series.id);
    setBookmarked(result.bookmarked);
    setBookmarkLoading(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPreview(false)}
    >
      <Link href={`/blog/series/${series.slug}`} className="block group">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-text-muted/30 transition-colors bg-surface"
        >
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-surface-inset flex-shrink-0">
            {series.cover_image_url ? (
              <Image
                src={series.cover_image_url}
                alt={series.title}
                fill
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder title={series.title} type="series" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
              {series.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
              <span>{series.author?.name}</span>
              <span>·</span>
              <span>{postCount} posts</span>
            </div>
          </div>

          {/* Bookmark Button */}
          {user && (
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full transition-all flex-shrink-0 ${
                bookmarked 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-text-muted hover:bg-surface-inset hover:text-text-primary'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
        </motion.article>
      </Link>

      {/* Hover Preview */}
      <AnimatePresence>
        {showPreview && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 p-4 rounded-lg border border-border bg-surface shadow-lg"
          >
            <p className="text-xs text-text-muted mb-3 font-medium">Articles in this series:</p>
            <ul className="space-y-2">
              {posts.slice(0, 5).map((post, i) => (
                <li key={post.id}>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2 text-sm text-text-primary hover:text-accent transition-colors"
                  >
                    <span className="text-text-muted text-xs w-5">{i + 1}.</span>
                    <span className="line-clamp-1">{post.title}</span>
                  </Link>
                </li>
              ))}
              {posts.length > 5 && (
                <li className="text-xs text-text-muted pt-1">
                  +{posts.length - 5} more articles
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SeriesListPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      try {
        const { data } = await getPublishedSeries();
        setSeries(data || []);
      } catch (error) {
        console.error('Failed to load series:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, []);

  // Group series into rows: 3 cards, then 3 list items, repeat
  const rows = [];
  for (let i = 0; i < series.length; i += 6) {
    const cardItems = series.slice(i, i + 3);
    const listItems = series.slice(i + 3, i + 6);
    if (cardItems.length > 0) {
      rows.push({ type: 'cards', items: cardItems, startIndex: i });
    }
    if (listItems.length > 0) {
      rows.push({ type: 'list', items: listItems, startIndex: i + 3 });
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-semibold text-text-primary mb-2">
            Series
          </h1>
          <p className="text-text-muted">
            Multi-part articles exploring topics in depth.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-8">
            {/* Card row skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 rounded-lg border border-border animate-pulse">
                  <div className="w-full aspect-[16/9] rounded-md bg-surface-inset mb-4" />
                  <div className="h-5 bg-surface-inset rounded w-3/4 mb-2" />
                  <div className="h-4 bg-surface-inset rounded w-full mb-4" />
                  <div className="h-4 bg-surface-inset rounded w-1/2" />
                </div>
              ))}
            </div>
            {/* List row skeleton */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border animate-pulse">
                  <div className="w-16 h-16 rounded-md bg-surface-inset" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-surface-inset rounded w-1/2" />
                    <div className="h-4 bg-surface-inset rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted">No series yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex}>
                {row.type === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {row.items.map((s, i) => (
                      <CardItem key={s.id} series={s} index={row.startIndex + i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {row.items.map((s, i) => (
                      <ListItem key={s.id} series={s} index={row.startIndex + i} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Calendar,
  ChevronRight,
  User,
  Share2
} from 'lucide-react';
import { getSeriesBySlug, getPostsInSeries } from '@/modules/articles/services';
import { ShareButtons } from '@/modules/articles/components';

// Post Item Component
function PostItem({ post, index, isFirst, isLast }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--brand-border)] group-hover:bg-[var(--brand-primary)]/30 transition-colors">
        {isFirst && <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-[var(--brand-primary)]" />}
        {isLast && <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[var(--brand-muted)]/30" />}
      </div>

      <Link
        href={`/articles/${post.slug}?from=series`}
        className="flex items-start gap-6 pl-14 pr-6 py-6 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)] hover:border-[var(--brand-primary)]/30 hover:shadow-lg hover:shadow-[var(--brand-primary)]/5 transition-all duration-300"
      >
        {/* Part Number */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center">
          <span className="text-lg font-bold text-[var(--brand-primary)]">
            {post.series_order || index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1 mb-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-[var(--brand-muted)] text-sm line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-[var(--brand-muted)]">
            {post.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.read_time} min read
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 self-center">
          <ChevronRight className="w-5 h-5 text-[var(--brand-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </motion.article>
  );
}

export default function SeriesClient({ slug }) {
  const [series, setSeries] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('Loading series with slug:', slug);
        const { data: seriesData, error: seriesError } = await getSeriesBySlug(slug);
        
        if (seriesError) {
          console.error('Error loading series:', seriesError);
        }
        
        console.log('Series data:', seriesData);
        
        if (seriesData) {
          setSeries(seriesData);
          // Use posts from seriesData if available, otherwise fetch separately
          if (seriesData.posts && seriesData.posts.length > 0) {
            setPosts(seriesData.posts);
          } else {
            const { data: postsData, error: postsError } = await getPostsInSeries(seriesData.id);
            if (postsError) {
              console.error('Error loading posts:', postsError);
            }
            setPosts(postsData || []);
          }
        }
      } catch (error) {
        console.error('Failed to load series:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-[var(--brand-muted)]/10 rounded" />
            <div className="h-64 bg-[var(--brand-muted)]/10 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-12 bg-[var(--brand-muted)]/10 rounded" />
              <div className="h-6 bg-[var(--brand-muted)]/10 rounded w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!series) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--brand-muted)]/10 flex items-center justify-center">
            <Layers className="w-10 h-10 text-[var(--brand-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)] mb-4">Series Not Found</h1>
          <p className="text-[var(--brand-muted)] mb-8">The series you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/series"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Series
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      {/* Hero Section */}
      <section className="relative py-16 bg-[var(--brand-surface)] border-b border-[var(--brand-border)]">
        {/* Cover Image Background */}
          {series.cover_image_url && (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={series.cover_image_url}
                alt=""
                fill
                className="object-cover opacity-10 blur-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-surface)]/80 to-[var(--brand-surface)]" />
            </div>
          )}
          
          <div className="relative max-w-4xl mx-auto px-4">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                href="/series"
                className="inline-flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-primary)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">All Series</span>
              </Link>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Cover Image */}
              {series.cover_image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0 w-full md:w-48 h-48 md:h-64 rounded-2xl overflow-hidden border border-[var(--brand-border)] shadow-lg"
                >
                  <Image
                    src={series.cover_image_url}
                    alt={series.title}
                    width={192}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Series Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 mb-4">
                  <Layers className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span className="text-xs font-medium text-[var(--brand-primary)]">
                    {posts.length} {posts.length === 1 ? 'Part' : 'Parts'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-text)] mb-4">
                  {series.title}
                </h1>

                {series.description && (
                  <p className="text-[var(--brand-muted)] text-lg leading-relaxed mb-6">
                    {series.description}
                  </p>
                )}

                {posts.length > 0 && (
                  <Link
                    href={`/articles/${posts[0].slug}?from=series`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <BookOpen className="w-4 h-4" />
                    Start Reading
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {/* Share Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="flex items-center gap-2 text-sm text-[var(--brand-muted)]">
                    <Share2 className="w-4 h-4" />
                    Share
                  </span>
                  <ShareButtons 
                    title={series.title}
                    url={`/series/${slug}`}
                    description={series.description}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Posts Timeline */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-[var(--brand-text)] mb-8 flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
              </span>
              Chapters
            </motion.h2>

            {posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-[var(--brand-surface)] rounded-2xl border border-[var(--brand-border)]"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--brand-muted)]/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[var(--brand-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--brand-text)] mb-2">Coming Soon</h3>
                <p className="text-[var(--brand-muted)]">Posts for this series are being prepared.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    index={index}
                    isFirst={index === 0}
                    isLast={index === posts.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
  );
}

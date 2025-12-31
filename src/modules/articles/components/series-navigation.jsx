'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  ArrowRight 
} from 'lucide-react';
import { getSeriesForPost } from '@/modules/articles/services';

export function SeriesNavigation({ postId }) {
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeriesData() {
      try {
        const { data } = await getSeriesForPost(postId);
        if (data) {
          setSeriesInfo(data);
        }
      } catch (error) {
        console.error('Failed to load series navigation:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (postId) {
      loadSeriesData();
    }
  }, [postId]);

  if (loading || !seriesInfo) {
    return null;
  }

  const { series, currentIndex, totalPosts, prevPost, nextPost } = seriesInfo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-12 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)] overflow-hidden"
    >
      {/* Series Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[var(--brand-primary)]/5 to-transparent border-b border-[var(--brand-border)]">
        <Link
          href={`/series/${series.slug}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--brand-muted)] uppercase tracking-wider">Part of a Series</p>
            <h4 className="font-semibold text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition-colors">
              {series.title}
            </h4>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--brand-muted)] ml-auto group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 border-b border-[var(--brand-border)] bg-[var(--brand-background)]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--brand-muted)]">
            Part {currentIndex} of {totalPosts}
          </span>
          <span className="text-xs text-[var(--brand-muted)]">
            {Math.round((currentIndex / totalPosts) * 100)}% Complete
          </span>
        </div>
        <div className="h-1.5 bg-[var(--brand-muted)]/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / totalPosts) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full bg-[var(--brand-primary)] rounded-full"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 divide-x divide-[var(--brand-border)]">
        {/* Previous */}
        {prevPost ? (
          <Link
            href={`/articles/${prevPost.slug}?from=series`}
            className="flex items-center gap-3 px-6 py-5 hover:bg-[var(--brand-background)]/50 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--brand-muted)] group-hover:text-[var(--brand-primary)] group-hover:-translate-x-1 transition-all" />
            <div className="min-w-0">
              <p className="text-xs text-[var(--brand-muted)] mb-1">Previous</p>
              <p className="text-sm font-medium text-[var(--brand-text)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                {prevPost.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="px-6 py-5 opacity-50">
            <p className="text-xs text-[var(--brand-muted)] mb-1">Previous</p>
            <p className="text-sm text-[var(--brand-muted)]">This is the first part</p>
          </div>
        )}

        {/* Next */}
        {nextPost ? (
          <Link
            href={`/articles/${nextPost.slug}?from=series`}
            className="flex items-center justify-end gap-3 px-6 py-5 hover:bg-[var(--brand-background)]/50 transition-colors group text-right"
          >
            <div className="min-w-0">
              <p className="text-xs text-[var(--brand-muted)] mb-1">Next</p>
              <p className="text-sm font-medium text-[var(--brand-text)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                {nextPost.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--brand-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
          </Link>
        ) : (
          <div className="px-6 py-5 text-right opacity-50">
            <p className="text-xs text-[var(--brand-muted)] mb-1">Next</p>
            <p className="text-sm text-[var(--brand-muted)]">You've completed the series!</p>
          </div>
        )}
      </div>

      {/* View All Parts */}
      <div className="px-6 py-4 border-t border-[var(--brand-border)] bg-[var(--brand-background)]/50">
        <Link
          href={`/series/${series.slug}`}
          className="flex items-center justify-center gap-2 text-sm text-[var(--brand-primary)] font-medium hover:underline"
        >
          <BookOpen className="w-4 h-4" />
          View all {totalPosts} parts
        </Link>
      </div>
    </motion.div>
  );
}

export default SeriesNavigation;

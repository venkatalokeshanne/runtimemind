'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, BookOpen } from 'lucide-react';
import { getSeriesForPost } from '@/modules/blog/services';

/**
 * SeriesBanner - A subtle banner shown when a post is part of a series
 * but the user didn't navigate from the series page.
 * 
 * Shows: series name, current part, and link to view full series
 */
export function SeriesBanner({ postId }) {
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
        console.error('Failed to load series info:', error);
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

  const { series, currentIndex, totalPosts } = seriesInfo;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[var(--brand-primary)]/5 to-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--brand-muted)] uppercase tracking-wider">
              Part {currentIndex} of {totalPosts}
            </p>
            <p className="font-medium text-[var(--brand-text)]">
              {series.title}
            </p>
          </div>
        </div>

        <Link
          href={`/blog/series/${series.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm font-medium hover:bg-[var(--brand-primary)]/20 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>View Series</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

export default SeriesBanner;

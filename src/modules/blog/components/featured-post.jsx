/**
 * ============================================================================
 * FEATURED POST COMPONENT
 * ============================================================================
 * 
 * Large, prominent display for a featured/hero post.
 * Used on homepage for the latest or pinned article.
 * 
 * DESIGN:
 * - Horizontal layout on desktop (image left, content right)
 * - Stacked on mobile
 * - Larger typography for prominence
 * - Subtle hover animation
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatDate, calculateReadingTime } from '@/lib/utils';

export function FeaturedPost({ post }) {
  const readingTime = calculateReadingTime(post.content || '');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-[16/10] rounded-[var(--radius-lg)] overflow-hidden bg-surface border border-border">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <span className="text-6xl font-bold text-accent/30">
                  {post.title?.charAt(0) || 'R'}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-text-muted">
              {post.author && (
                <span className="font-medium text-text-secondary">
                  {post.author.name}
                </span>
              )}
              {post.published_at && (
                <>
                  <span>·</span>
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                </>
              )}
              <span>·</span>
              <span>{readingTime} min read</span>
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary leading-tight group-hover:text-accent transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-text-secondary line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Read More */}
            <div className="inline-flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
              Read article
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

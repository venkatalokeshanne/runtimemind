/**
 * ============================================================================
 * POST CARD COMPONENT
 * ============================================================================
 * 
 * Displays a blog post preview in list/grid views.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. COMPONENT PURITY (Single Responsibility):
 *    This component only handles PRESENTATION.
 *    No data fetching, no business logic, just rendering props.
 * 
 * 2. SEMANTIC HTML:
 *    Uses <article> for SEO and accessibility.
 *    Proper heading hierarchy (h2 for cards, h1 reserved for page title).
 * 
 * 3. MINIMAL ANIMATION:
 *    Subtle hover lift using Framer Motion.
 *    Purpose: Indicates interactivity, not decoration.
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Folder } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ImagePlaceholder } from './image-placeholder';

/**
 * PostCard Component
 * 
 * @param {Object} props
 * @param {Object} props.post - Post data
 * @param {string} props.post.slug
 * @param {string} props.post.title
 * @param {string} props.post.excerpt
 * @param {string} props.post.cover_image_url
 * @param {string} props.post.published_at
 * @param {number} props.post.read_time_minutes - Stored read time in minutes
 * @param {string} props.post.topic - Post topic/category
 * @param {Object} props.post.author
 */
export function PostCard({ post, compact = false, large = false }) {
  const readingTime = post.read_time_minutes || 5;

  return (
    <motion.article
      /**
       * ANIMATION JUSTIFICATION:
       * - whileHover: Subtle y translation (-2px) indicates clickability
       * - transition: Ease timing feels natural, not playful
       * - No scale/rotate: Keeps editorial feel
       */
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group ${compact ? 'text-sm' : ''}`}
    >
      <Link 
        href={`/articles/${post.slug}`}
        className="block"
      >
        {/* Cover Image */}
        {!compact && (
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-[var(--radius-md)] bg-surface">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={`Cover image for ${post.title}`}
                fill
                className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <ImagePlaceholder title={post.title} type="article" />
            )}
          </div>
        )}

        {/* Compact variant: small thumbnail left */}
        {post.cover_image_url && compact && (
          <div className="flex items-start gap-3 mb-3">
            <div className="relative w-20 h-12 rounded-md overflow-hidden bg-surface flex-shrink-0">
              <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-text-primary line-clamp-2">{post.title}</h2>
              {post.excerpt && <div className="text-text-secondary text-xs line-clamp-2">{post.excerpt}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        {!compact && (
          <div className="space-y-2">
            {/* Topic Badge */}
            {post.topic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                <Folder className="w-3 h-3" />
                {post.topic}
              </span>
            )}

            {/* Title */}
            <h2 className={`text-${large ? '2xl' : 'xl'} font-semibold leading-tight text-text-primary group-hover:text-accent transition-colors duration-200`}>
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-text-secondary line-clamp-2">
                {post.excerpt}
              </p>
            )}

            {/* Meta: Author, Date, Reading Time, Engagement */}
            <div className="flex items-center gap-3 text-sm text-text-muted">
              {/* Author */}
              {post.author && (
                <>
                  <span className="font-medium text-text-secondary">
                    {post.author.name}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              
              {/* Date */}
              {post.published_at && (
                <>
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                  <span aria-hidden="true">·</span>
                </>
              )}
              
              {/* Reading Time */}
              <span>{readingTime} min read</span>

              {/* Engagement stats (likes and comments) */}
              {(post.likes_count > 0 || post.comments_count > 0) && (
                <>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-3">
                    {post.likes_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likes_count}
                      </span>
                    )}
                    {post.comments_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.comments_count}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.article>
  );
}

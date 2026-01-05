/**
 * ============================================================================
 * POST GRID COMPONENT
 * ============================================================================
 * 
 * Modern grid layout for blog posts.
 * More visual than PostList, with card-style display.
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { ImagePlaceholder } from '@/modules/articles/components';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function PostGrid({ posts }) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
    >
      {posts.map((post) => (
        <PostGridItem key={post.id} post={post} />
      ))}
    </motion.div>
  );
}

function PostGridItem({ post }) {
  const readingTime = post.read_time_minutes || 5;

  return (
    <motion.article variants={itemVariants} className="group h-full">
      <Link href={`/blog/${post.slug}`} className="block h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] mb-4 rounded-xl overflow-hidden bg-surface border border-border group-hover:border-accent/30 transition-colors">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-accent/30">
                {post.title?.charAt(0) || 'R'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col space-y-2">
          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-text-muted line-clamp-2 flex-1">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-text-muted pt-2 mt-auto">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar_url && (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="font-medium text-text-secondary">{post.author.name}</span>
              </div>
            )}
            {post.published_at && (
              <>
                <span>·</span>
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at, { month: 'short', day: 'numeric' })}
                </time>
              </>
            )}
            <span>·</span>
            <span>{readingTime} min</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

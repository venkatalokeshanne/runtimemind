'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Layers } from 'lucide-react';
import { getRelatedPosts } from '@/modules/articles/services';

export function RelatedPosts({ postId, seriesId, currentSlug }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelatedPosts() {
      try {
        const { data } = await getRelatedPosts(postId, seriesId, currentSlug);
        setPosts(data || []);
      } catch (error) {
        console.error('Failed to load related posts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (postId) {
      loadRelatedPosts();
    }
  }, [postId, seriesId, currentSlug]);

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-16 pt-12 border-t border-[var(--brand-border)] lg:-mx-32 xl:-mx-48"
    >
      <h2 className="text-xl font-semibold text-[var(--brand-text)] mb-6 flex items-center gap-2">
        <span>Related Posts</span>
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.slice(0, 4).map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group h-full"
          >
            <Link
              href={`/articles/${post.slug}`}
              className="h-full flex gap-5 p-5 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] hover:border-[var(--brand-primary)]/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--brand-muted)]/10">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--brand-muted)]">
                    <span className="text-xl font-bold">{post.title?.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-lg font-medium text-[var(--brand-text)] line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors mb-2">
                  {post.title}
                </h3>
                
                <p className="text-sm text-[var(--brand-muted)] line-clamp-2 mb-3 flex-1">
                  {post.excerpt || 'No description'}
                </p>
                
                <div className="flex items-center gap-3 text-xs mt-auto">
                  {post.series_id && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-medium">
                      <Layers className="w-3 h-3" />
                      Series
                    </span>
                  )}
                  {post.published_at && (
                    <time className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

export default RelatedPosts;

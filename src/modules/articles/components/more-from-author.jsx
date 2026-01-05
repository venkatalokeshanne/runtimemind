'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Bookmark, User } from 'lucide-react';
import { getPostsByAuthor } from '@/modules/articles/services';
import { ImagePlaceholder } from './image-placeholder';

export function MoreFromAuthor({ authorId, authorName, authorAvatar, currentPostId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorPosts() {
      if (!authorId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await getPostsByAuthor(authorId, { includeDrafts: false });
        // Filter out the current post and limit to 4
        const filtered = (data || []).filter(p => p.id !== currentPostId).slice(0, 4);
        setPosts(filtered);
      } catch (error) {
        console.error('Failed to load author posts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAuthorPosts();
  }, [authorId, currentPostId]);

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-16 pt-12 border-t border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          More from {authorName || 'this author'}
        </h2>
        <Link 
          href={`/author/${authorId}`}
          className="text-sm text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group bg-surface rounded-xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300"
          >
            {/* Cover Image */}
            <Link href={`/articles/${post.slug}`} className="block">
              <div className="relative aspect-[16/9] bg-surface-inset overflow-hidden">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt=""
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImagePlaceholder title={post.title} type="article" />
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              {/* Author */}
              <Link 
                href={`/author/${authorId}`}
                className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
              >
                {authorAvatar ? (
                  <Image
                    src={authorAvatar}
                    alt={authorName || ''}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent">
                      {authorName?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-text-secondary">{authorName || 'Author'}</span>
              </Link>

              {/* Title */}
              <Link href={`/articles/${post.slug}`}>
                <h3 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-accent transition-colors mb-2">
                  {post.title}
                </h3>
              </Link>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
              )}

              {/* Footer - Date, Views, Bookmark */}
              <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border/50">
                <div className="flex items-center gap-3">
                  {post.published_at && (
                    <time>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.view_count || 0}
                  </span>
                </div>
                <Bookmark className="w-4 h-4 text-text-muted hover:text-accent cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

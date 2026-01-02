/**
 * ============================================================================
 * POST CONTENT COMPONENT
 * ============================================================================
 * 
 * Renders full post content with typography styles.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. TYPOGRAPHY PLUGIN:
 *    Uses @tailwindcss/typography for beautiful prose styling.
 *    Proper heading sizes, paragraph spacing, list styles.
 * 
 * 2. MAX WIDTH:
 *    Content constrained to ~65 characters for optimal readability.
 *    Research shows 45-75 chars per line is ideal.
 * 
 * 3. SEMANTIC HTML:
 *    Content wrapped in <article> with proper heading hierarchy.
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Globe, Linkedin, Twitter } from 'lucide-react';
import { SeriesNavigation } from './series-navigation';
import { SeriesBanner } from './series-banner';
import { RelatedPosts } from './related-posts';
import { MoreFromAuthor } from './more-from-author';
import { ShareSection } from './share-buttons';
import { CommentsSection } from './comments-section';
import { LikeButton } from './like-button';
import { EditorContent } from '@/ui/Editor';

/**
 * PostContent Component
 * 
 * Renders the full blog post with proper typography.
 * 
 * @param {Object} props
 * @param {Object} props.post - Full post data
 * @param {boolean} props.fromSeries - Whether user navigated from series page
 */
export function PostContent({ post, fromSeries = false }) {
  const readingTime = post.read_time_minutes || 5;

  return (
    <article className="max-w-2xl mx-auto">
      {/* Post Header */}
      <header className="mb-8 md:mb-12">
        {/* Title - the only H1 on the page (SEO) */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-text-primary mb-4">
          {post.title}
        </h1>

        {/* Meta information */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-x-4 sm:gap-y-2 text-text-secondary">
          {/* Author */}
          {post.author && (
            <Link href={`/author/${post.author_id}`} className="flex items-center gap-2 hover:text-accent transition-colors">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-medium">{post.author.name}</span>
            </Link>
          )}

          <span aria-hidden="true" className="hidden sm:inline">·</span>

          {/* Date, Reading time, and Like button grouped on mobile */}
          <div className="flex items-center gap-x-4 text-sm sm:text-base">
            {/* Date */}
            {post.published_at && (
              <time dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            )}

            <span aria-hidden="true">·</span>

            {/* Reading time */}
            <span>{readingTime} min read</span>

            <span aria-hidden="true">·</span>

            {/* Like button */}
            <LikeButton 
              postId={post.id} 
              initialCount={post.likes_count || 0}
              size="default"
            />
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-4 pt-4 border-t border-border">
          <ShareSection 
            title={post.title}
            url={`/articles/${post.slug}`}
            description={post.excerpt || post.seo_description || `Read "${post.title}" - a thoughtful article on RuntimeMind.`}
          />
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image_url && (
        <figure className="mb-8 md:mb-12 -mx-4 md:mx-0">
          <img
            src={post.cover_image_url}
            alt={`Cover image for ${post.title}`}
            className="w-full aspect-[2/1] object-cover md:rounded-[var(--radius-lg)]"
          />
        </figure>
      )}

      {/* Post Content */}
      <EditorContent 
        data={post.content}
        className="prose prose-lg max-w-none"
      />

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-sm bg-surface-inset hover:bg-hover text-text-secondary rounded-full border border-border transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 
        Series Navigation vs Related Posts:
        - If user came from series page → Show full prev/next navigation
        - If user opened post directly → Show series banner (if in series) + related posts
      */}
      {post.series_id && fromSeries ? (
        <SeriesNavigation postId={post.id} />
      ) : (
        <>
          {/* Show series banner if post is part of a series */}
          {post.series_id && (
            <div className="mt-12">
              <SeriesBanner postId={post.id} />
            </div>
          )}
          
          {/* Show more posts from author */}
          <MoreFromAuthor 
            authorId={post.author_id} 
            authorName={post.author?.name}
            authorAvatar={post.author?.avatar_url}
            currentPostId={post.id}
          />
        </>
      )}

      {/* Comments Section */}
      <CommentsSection 
        postId={post.id} 
        initialCount={post.comments_count || 0} 
      />

      {/* Author Bio (optional footer) */}
      {post.author?.bio && (
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-start gap-4">
            <Link href={`/author/${post.author_id}`}>
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
                />
              )}
            </Link>
            <div className="flex-1">
              <Link href={`/author/${post.author_id}`} className="font-semibold text-text-primary hover:text-accent transition-colors">
                {post.author.name}
              </Link>
              <p className="text-text-secondary mt-1">
                {post.author.bio}
              </p>
              {/* Social Links */}
              {(post.author.website || post.author.twitter || post.author.linkedin) && (
                <div className="flex items-center gap-3 mt-3">
                  {post.author.website && (
                    <a
                      href={post.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                      title="Website"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {post.author.twitter && (
                    <a
                      href={post.author.twitter.startsWith('http') ? post.author.twitter : `https://twitter.com/${post.author.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {post.author.linkedin && (
                    <a
                      href={post.author.linkedin.startsWith('http') ? post.author.linkedin : `https://linkedin.com/in/${post.author.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* Related Posts at the very end */}
      {!fromSeries && (
        <>
          <RelatedPosts 
            postId={post.id} 
            seriesId={post.series_id} 
            currentSlug={post.slug} 
          />
          
          {/* See more recommendations */}
          <div className="mt-8 text-center">
            <Link 
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-border hover:border-accent/50 hover:bg-accent/5 text-text-primary font-medium transition-all duration-300"
            >
              See more recommendations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </article>
  );
}

/**
 * ============================================================================
 * BLOG LISTING PAGE
 * ============================================================================
 * 
 * Shows all published blog posts with pagination.
 * 
 * SEO CONSIDERATIONS:
 * - Server-rendered for indexing
 * - Semantic HTML structure
 * - Proper heading hierarchy (H1 here, H2 in cards)
 * 
 * ============================================================================
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { getPublishedPosts, getPublishedPostCount, getTrendingTags } from '@/modules/blog/services';
import { PostGrid } from '@/modules/blog/components';
import { formatDate, calculateReadingTime } from '@/lib/utils';

/**
 * Page metadata for SEO
 */
export const metadata = {
  title: 'Blog',
  description: 'All articles and posts. Explore our collection of thoughtful writing.',
  openGraph: {
    title: 'Blog | RuntimeMind',
    description: 'All articles and posts from RuntimeMind.',
  },
};

/**
 * Revalidate every 60 seconds
 * Good balance between freshness and performance
 */
export const revalidate = 60;

export default async function BlogPage() {
  // Fetch all published posts
  const { data: posts, error } = await getPublishedPosts({ limit: 20 });
  const { data: tags } = await getTrendingTags();
  
  // Split posts: first for featured, rest for grid
  const featuredPost = posts?.[0];
  const secondaryPosts = posts?.slice(1, 4) || [];
  const remainingPosts = posts?.slice(4) || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Latest Stories
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
                Blog
              </h1>
            </div>
            <p className="text-text-muted max-w-md">
              Ideas, insights, and in-depth explorations. Updated regularly with fresh perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center text-text-muted">
          <p>Unable to load posts. Please try again later.</p>
        </div>
      )}

      {!error && posts && posts.length > 0 && (
        <>
          {/* Featured Section */}
          <section className="border-b border-border">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Main Featured Post */}
                {featuredPost && (
                  <Link href={`/blog/${featuredPost.slug}`} className="group block">
                    <article className="h-full">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-surface-inset">
                        {featuredPost.cover_image_url ? (
                          <Image
                            src={featuredPost.cover_image_url}
                            alt={featuredPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            priority
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-500/20" />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-medium text-text-primary">
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-text-muted line-clamp-2 text-lg">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          {featuredPost.author && (
                            <div className="flex items-center gap-2">
                              {featuredPost.author.avatar_url && (
                                <Image
                                  src={featuredPost.author.avatar_url}
                                  alt={featuredPost.author.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              )}
                              <span className="font-medium text-text-primary">{featuredPost.author.name}</span>
                            </div>
                          )}
                          {featuredPost.published_at && (
                            <>
                              <span>·</span>
                              <time>{formatDate(featuredPost.published_at)}</time>
                            </>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {calculateReadingTime(featuredPost.content || '')} min
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                {/* Secondary Posts Stack */}
                <div className="flex flex-col gap-6">
                  {secondaryPosts.map((post, index) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                      <article className="flex gap-5 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface transition-all">
                        {post.cover_image_url && (
                          <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-surface-inset flex-shrink-0">
                            <Image
                              src={post.cover_image_url}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span>{post.author?.name}</span>
                            <span>·</span>
                            <time>{formatDate(post.published_at)}</time>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tags/Categories Bar */}
          {tags && tags.length > 0 && (
            <section className="border-b border-border bg-surface/50">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                  <span className="flex items-center gap-2 text-sm text-text-muted flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                    Trending:
                  </span>
                  {tags.slice(0, 8).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-background border border-border text-sm text-text-primary hover:border-accent/50 cursor-pointer transition-colors flex-shrink-0"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Posts Grid */}
          {remainingPosts.length > 0 && (
            <section className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-text-primary">All Articles</h2>
                  <span className="text-sm text-text-muted">{posts.length} posts</span>
                </div>
                <PostGrid posts={remainingPosts} />
              </div>
            </section>
          )}

          {/* Load More / Explore CTA */}
          <section className="border-t border-border">
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
              <p className="text-text-muted mb-4">Want to explore more?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/blog/series"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                >
                  Browse Series
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-text-primary font-medium hover:bg-surface transition-colors"
                >
                  About Us
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {!error && (!posts || posts.length === 0) && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-inset flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h2>
          <p className="text-text-muted">Check back soon for new articles.</p>
        </div>
      )}
    </main>
  );
}

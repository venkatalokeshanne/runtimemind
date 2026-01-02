/**
 * ============================================================================
 * TOPIC PAGE - Articles filtered by topic
 * ============================================================================
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Folder, Clock } from 'lucide-react';
import { getPostsByTopic, getTopicsWithPosts } from '@/modules/articles/services';
import { PostGrid } from '@/modules/articles/components';
import { formatDate } from '@/lib/utils';

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);
  
  return {
    title: `${decodedTopic} Articles & Tutorials | RuntimeMind`,
    description: `Read the best ${decodedTopic} articles, tutorials, stories and guides. Discover insights and learn from writers on RuntimeMind.`,
    keywords: [decodedTopic, `${decodedTopic} articles`, `${decodedTopic} tutorials`, `learn ${decodedTopic}`, `${decodedTopic} guide`],
    alternates: {
      canonical: `https://runtimemind.vercel.app/articles/topic/${encodeURIComponent(decodedTopic.toLowerCase())}`,
    },
    openGraph: {
      title: `${decodedTopic} Articles & Tutorials | RuntimeMind`,
      description: `Read the best ${decodedTopic} articles, tutorials and guides on RuntimeMind.`,
      type: 'website',
      url: `https://runtimemind.vercel.app/articles/topic/${encodeURIComponent(decodedTopic.toLowerCase())}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedTopic} Articles | RuntimeMind`,
      description: `Read the best ${decodedTopic} articles and tutorials.`,
    },
  };
}

export const revalidate = 60;

export default async function TopicPage({ params }) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);
  
  // Fetch posts for this topic
  const { data: posts, error } = await getPostsByTopic(decodedTopic, { limit: 50 });
  const { data: allTopics } = await getTopicsWithPosts({ limit: 20 });
  
  // Filter out current topic from related topics
  const relatedTopics = (allTopics || []).filter(t => t !== decodedTopic).slice(0, 8);
  
  // Split posts
  const featuredPost = posts?.[0];
  const remainingPosts = posts?.slice(1) || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link 
            href="/articles" 
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-border bg-gradient-to-b from-surface/50 to-background">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Folder className="w-3.5 h-3.5" />
                Topic
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
                {decodedTopic}
              </h1>
            </div>
            <p className="text-text-muted max-w-md">
              {posts?.length || 0} article{posts?.length !== 1 ? 's' : ''} about {decodedTopic}
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

      {/* No Posts State */}
      {!error && (!posts || posts.length === 0) && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-inset flex items-center justify-center">
            <Folder className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No articles yet</h2>
          <p className="text-text-muted mb-6">There are no articles about {decodedTopic} yet.</p>
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            Browse All Articles
          </Link>
        </div>
      )}

      {!error && posts && posts.length > 0 && (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <section className="border-b border-border">
              <div className="max-w-6xl mx-auto px-6 py-12">
                <Link href={`/articles/${featuredPost.slug}`} className="group block">
                  <article className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Image */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface">
                      {featuredPost.cover_image_url ? (
                        <Image
                          src={featuredPost.cover_image_url}
                          alt={featuredPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                          <Folder className="w-16 h-16 text-accent/30" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        <Folder className="w-3 h-3" />
                        {decodedTopic}
                      </span>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent transition-colors">
                        {featuredPost.title}
                      </h2>
                      
                      {featuredPost.excerpt && (
                        <p className="text-text-secondary line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        {featuredPost.author && (
                          <span className="font-medium">{featuredPost.author.name}</span>
                        )}
                        {featuredPost.published_at && (
                          <>
                            <span>·</span>
                            <time dateTime={featuredPost.published_at}>
                              {formatDate(featuredPost.published_at)}
                            </time>
                          </>
                        )}
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPost.read_time_minutes || 5} min read
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            </section>
          )}

          {/* All Posts Grid */}
          {remainingPosts.length > 0 && (
            <section className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-text-primary">More in {decodedTopic}</h2>
                  <span className="text-sm text-text-muted">{remainingPosts.length} more article{remainingPosts.length !== 1 ? 's' : ''}</span>
                </div>
                <PostGrid posts={remainingPosts} />
              </div>
            </section>
          )}
        </>
      )}

      {/* Related Topics */}
      {relatedTopics.length > 0 && (
        <section className="border-t border-border bg-surface/30">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Explore More Topics</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((t) => (
                <Link
                  key={t}
                  href={`/articles/topic/${encodeURIComponent(t)}`}
                  className="px-4 py-2 rounded-full bg-surface border border-border text-text-secondary text-sm hover:border-accent/50 hover:text-accent transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

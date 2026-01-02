/**
 * ============================================================================
 * AUTHOR PROFILE PAGE
 * ============================================================================
 * 
 * Displays author profile and all their published posts.
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, Linkedin, Twitter, Calendar, FileText, Feather } from 'lucide-react';
import { getAuthorById, getPostsByAuthor } from '@/modules/articles/services';
import { getFollowerCount, getFollowingCount } from '@/modules/articles/services';
import { PostGrid } from '@/modules/articles/components';

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: author } = await getAuthorById(id);
  
  if (!author) {
    return { title: 'Author Not Found' };
  }

  const description = author.bio || `Read articles, stories and tutorials by ${author.name} on RuntimeMind. Discover their latest content.`;

  return {
    title: `${author.name} - Author Profile | RuntimeMind`,
    description: description,
    alternates: {
      canonical: `https://runtimemind.com/author/${id}`,
    },
    openGraph: {
      title: `${author.name} | RuntimeMind`,
      description: description,
      type: 'profile',
      url: `https://runtimemind.com/author/${id}`,
      images: author.avatar_url ? [{ url: author.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.name} | RuntimeMind`,
      description: description,
    },
  };
}

export const revalidate = 60;

export default async function AuthorPage({ params }) {
  const { id } = await params;
  
  // Fetch author and their posts
  const [authorResult, postsResult, followerResult, followingResult] = await Promise.all([
    getAuthorById(id),
    getPostsByAuthor(id, { includeDrafts: false }),
    getFollowerCount(id),
    getFollowingCount(id),
  ]);

  const { data: author, error: authorError } = authorResult;
  const { data: posts } = postsResult;
  const { count: followerCount } = followerResult;
  const { count: followingCount } = followingResult;

  if (authorError || !author) {
    notFound();
  }

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

      {/* Author Profile Header */}
      <section className="border-b border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-accent/20 flex items-center justify-center border-4 border-background shadow-lg">
                  <Feather className="w-12 h-12 text-accent" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {author.name}
              </h1>
              
              {author.bio && (
                <p className="text-text-secondary text-lg mb-4 max-w-2xl">
                  {author.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <FileText className="w-4 h-4" />
                  <span><strong className="text-text-primary">{posts?.length || 0}</strong> articles</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <span><strong className="text-text-primary">{followerCount || 0}</strong> followers</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <span><strong className="text-text-primary">{followingCount || 0}</strong> following</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors text-sm"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary mb-8">
            Articles by {author.name}
          </h2>

          {posts && posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-inset flex items-center justify-center">
                <FileText className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No articles yet</h3>
              <p className="text-text-muted">This author hasn't published any articles yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

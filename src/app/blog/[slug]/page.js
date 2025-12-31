/**
 * ============================================================================
 * INDIVIDUAL POST PAGE
 * ============================================================================
 * 
 * Displays a single blog post with full content.
 * 
 * ARCHITECTURE:
 * 
 * 1. DYNAMIC ROUTE:
 *    [slug] creates pages like /blog/my-post-title
 *    Slugs are SEO-friendly (keywords in URL)
 * 
 * 2. STATIC GENERATION:
 *    generateStaticParams pre-builds all post pages at build time.
 *    Result: Instant page loads, great for SEO.
 * 
 * 3. DYNAMIC METADATA:
 *    generateMetadata creates unique SEO metadata per post.
 *    Each post has its own title, description, OG tags.
 * 
 * ============================================================================
 */

import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/modules/blog/services';
import { PostContent } from '@/modules/blog/components';

/**
 * Generate static paths for all posts at build time.
 * 
 * WHY STATIC GENERATION:
 * - Blog posts rarely change after publishing
 * - Pre-rendered pages load instantly
 * - Better SEO (content ready for crawlers)
 * - Lower server costs (no runtime rendering)
 * 
 * @returns {Promise<Array<{slug: string}>>}
 */
export async function generateStaticParams() {
  const { data: slugs } = await getAllPostSlugs();
  
  if (!slugs) return [];
  
  return slugs.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate dynamic metadata for each post.
 * 
 * WHY DYNAMIC METADATA:
 * - Each post needs unique title and description
 * - Critical for SEO (unique meta per page)
 * - Open Graph tags for social sharing
 * 
 * @param {Object} params
 * @param {string} params.slug - Post slug from URL
 * @returns {Promise<import('next').Metadata>}
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: post } = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  // Use SEO fields if available, fall back to default values
  const metaTitle = post.seo_title || post.title;
  const metaDescription = post.seo_description || post.excerpt || `Read "${post.title}" on Ink Blog.`;
  const canonicalUrl = `https://runtimemind.com/blog/${slug}`;
  
  return {
    title: metaTitle,
    description: metaDescription,
    
    // Keywords from tags for SEO
    keywords: post.tags && post.tags.length > 0 ? post.tags : undefined,
    
    // Canonical URL to avoid duplicate content issues
    alternates: {
      canonical: canonicalUrl,
    },
    
    // Robots meta for indexing control
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    
    // Open Graph for social sharing (Facebook, LinkedIn, etc.)
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: canonicalUrl,
      siteName: 'RuntimeMind',
      locale: 'en_US',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : [],
      tags: post.tags || [],
      images: post.cover_image_url ? [
        {
          url: post.cover_image_url,
          width: 1200,
          height: 630,
          alt: metaTitle,
          type: 'image/jpeg',
        }
      ] : [
        {
          url: 'https://runtimemind.com/og-default.png',
          width: 1200,
          height: 630,
          alt: 'RuntimeMind Blog',
        }
      ],
    },
    
    // Twitter card (optimized for large preview)
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      site: '@runtimemind',
      creator: post.author?.twitter_handle || '@runtimemind',
      images: post.cover_image_url ? [post.cover_image_url] : ['https://runtimemind.com/og-default.png'],
    },
  };
}

/**
 * Revalidate pages periodically
 * Allows updates to reflect without full rebuild
 */
export const revalidate = 60;

/**
 * Post Page Component
 * 
 * @param {Object} props
 * @param {Promise<{slug: string}>} props.params - Route parameters
 * @param {Promise<{from?: string}>} props.searchParams - Query parameters
 */
export default async function PostPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const fromSeries = resolvedSearchParams?.from === 'series';
  
  const { data: post, error } = await getPostBySlug(slug);
  
  // 404 if post not found
  if (error?.code === 'NOT_FOUND' || !post) {
    notFound();
  }
  
  // Generic error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Something went wrong
          </h1>
          <p className="text-text-secondary">
            We couldn't load this post. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PostContent post={post} fromSeries={fromSeries} />
    </div>
  );
}

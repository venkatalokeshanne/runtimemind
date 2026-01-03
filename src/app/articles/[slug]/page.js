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
 *    [slug] creates pages like /articles/my-post-title
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
import { getPostBySlug, getAllPostSlugs } from '@/modules/articles/services';
import { PostContent, ViewTracker } from '@/modules/articles/components';

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
  const canonicalUrl = `https://www.runtimemind.com/articles/${slug}`;
  
  // Use cover image or generate placeholder from title
  // Append a numeric cache-busting `v` param (epoch ms) so crawlers refetch updated images
  const timestamp = post.updated_at ? Date.parse(post.updated_at) : post.published_at ? Date.parse(post.published_at) : Date.now();
  const cacheBuster = encodeURIComponent(timestamp);
  const ogImage = post.cover_image_url || `https://www.runtimemind.com/api/og?title=${encodeURIComponent(post.title)}&type=article&author=${encodeURIComponent(post.author?.name || '')}&v=${cacheBuster}`;
  
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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
          type: 'image/png',
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
      images: [ogImage],
    },
  };
}

/**
 * Revalidate pages periodically
 * Allows updates to reflect without full rebuild
 */
export const revalidate = 60;

/**
 * Generate Article JSON-LD structured data
 */
function generateArticleJsonLd(post, slug) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image_url || 'https://www.runtimemind.com/og-default.png',
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'RuntimeMind',
      url: post.author_id ? `https://www.runtimemind.com/author/${post.author_id}` : 'https://www.runtimemind.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RuntimeMind',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.runtimemind.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.runtimemind.com/articles/${slug}`,
    },
    keywords: post.tags?.join(', ') || '',
    wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    articleSection: post.topic || 'Technology',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    creativeWorkStatus: 'Published',
  };
}

/**
 * Generate BreadcrumbList JSON-LD for navigation
 */
function generateBreadcrumbJsonLd(post, slug) {
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.runtimemind.com' },
    { name: 'Articles', url: 'https://www.runtimemind.com/articles' },
  ];
  
  if (post.topic) {
    breadcrumbs.push({ 
      name: post.topic, 
      url: `https://www.runtimemind.com/articles/topic/${encodeURIComponent(post.topic.toLowerCase())}` 
    });
  }
  
  breadcrumbs.push({ name: post.title, url: `https://www.runtimemind.com/articles/${slug}` });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

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

  const articleJsonLd = generateArticleJsonLd(post, slug);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post, slug);

  return (
    <>
      {/* Track view count */}
      <ViewTracker postId={post.id} />
      
      {/* Article JSON-LD for rich search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      {/* Breadcrumb JSON-LD for navigation in search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <PostContent post={post} fromSeries={fromSeries} />
      </div>
    </>
  );
}

/**
 * ============================================================================
 * SITEMAP GENERATOR
 * ============================================================================
 * 
 * Generates sitemap.xml for search engine crawlers.
 * 
 * WHY SITEMAPS:
 * - Helps search engines discover all pages
 * - Indicates relative importance with priority
 * - Shows when content was last updated
 * - Critical for SEO
 * 
 * This uses Next.js's built-in sitemap generation.
 * The sitemap is automatically served at /sitemap.xml
 * 
 * ============================================================================
 */

import { getAllPostSlugs, getPublishedSeries, getTopicsWithPosts } from '@/modules/articles/services';

/**
 * Base URL for the site
 * In production, this should come from environment variable
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://runtimemind.com';

/**
 * Generate sitemap entries
 * 
 * @returns {Promise<import('next').MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic topic pages
  const { data: topics } = await getTopicsWithPosts();
  const topicPages = (topics || []).map((topic) => ({
    url: `${BASE_URL}/articles/topic/${encodeURIComponent((topic.topic || '').toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic article pages
  const { data: posts } = await getAllPostSlugs();
  
  const postPages = (posts || []).map((post) => ({
    url: `${BASE_URL}/articles/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic series pages
  const { data: seriesList } = await getPublishedSeries();
  
  const seriesPages = (seriesList || []).map((series) => ({
    url: `${BASE_URL}/series/${series.slug}`,
    lastModified: series.updated_at ? new Date(series.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticPages, ...topicPages, ...postPages, ...seriesPages];
}

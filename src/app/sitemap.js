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

import { getAllPostSlugs } from '@/modules/blog/services';

/**
 * Base URL for the site
 * In production, this should come from environment variable
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';

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
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic blog post pages
  const { data: posts } = await getAllPostSlugs();
  
  const postPages = (posts || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}

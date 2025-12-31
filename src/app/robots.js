/**
 * ============================================================================
 * ROBOTS.TXT GENERATOR
 * ============================================================================
 * 
 * Generates robots.txt for search engine crawlers.
 * 
 * WHY ROBOTS.TXT:
 * - Tells crawlers which pages to index
 * - Points to sitemap location
 * - Can block sensitive areas
 * 
 * ============================================================================
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';

/**
 * Generate robots.txt content
 * 
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',      // API routes
          '/admin/',    // Admin area (if added later)
          '/_next/',    // Next.js internals
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

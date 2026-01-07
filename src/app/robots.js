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

const normalizeBaseUrl = (value) => (value || '').trim().replace(/\/+$/, '');
const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) || 'https://www.runtimemind.com';

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
          '/api/',        // API routes
          '/dashboard/',  // Dashboard (private)
          '/login',       // Auth pages
          '/signup',      // Auth pages
          '/_next/',      // Next.js internals
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

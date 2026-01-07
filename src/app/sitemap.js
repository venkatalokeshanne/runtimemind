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

import { getAllPostSlugs, getAllPublishedSeries, getTopicsWithPosts } from '@/modules/articles/services';

/**
 * Base URL for the site
 * In production, this should come from environment variable
 */
const normalizeBaseUrl = (value) => (value || '').trim().replace(/\/+$/, '');
const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) || 'https://www.runtimemind.com';
const STATIC_LAST_MODIFIED = new Date(process.env.SITE_BUILD_TIMESTAMP || '2024-01-01');

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const candidate = value.publicUrl || value.url || value.href;
    return typeof candidate === 'string' ? candidate.trim() : '';
  }
  return '';
};

const escapeXmlEntities = (value) => {
  if (!value) return '';
  return value.replace(/&/g, '&amp;');
};

/**
 * Generate sitemap entries
 * 
 * @returns {Promise<import('next').MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/series`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/help`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Safe dynamic calls
  let topics = [];
  try {
    const res = await getTopicsWithPosts();
    topics = (res && res.data) || [];
  } catch (e) {
    topics = [];
  }

  let posts = [];
  try {
    const res = await getAllPostSlugs();
    posts = (res && res.data) || [];
  } catch (e) {
    posts = [];
  }

  let seriesList = [];
  try {
    const res = await getAllPublishedSeries();
    seriesList = (res && res.data) || [];
  } catch (e) {
    seriesList = [];
  }

  const topicPages = (topics || [])
    .map((t) => {
      const raw = (t && (t.topic || t.name || '')) + '';
      const slug = raw.trim() ? encodeURIComponent(raw.trim().toLowerCase()) : null;
      if (!slug) return null;
      return { url: `${BASE_URL}/articles/topic/${slug}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 };
    })
    .filter(Boolean);

  const postPages = (posts || []).map((post) => {
    const slug = post?.slug || post?.id;
    const updatedAt = post?.updated_at ? new Date(post.updated_at) : new Date();
    const resolvedImage = resolveImageUrl(post?.cover_image_url);
    const xmlSafeImage = resolvedImage ? escapeXmlEntities(resolvedImage) : '';

    return {
      url: `${BASE_URL}/articles/${encodeURIComponent(slug)}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      images: xmlSafeImage ? [xmlSafeImage] : undefined,
    };
  });

  const seriesPages = (seriesList || []).map((s) => {
    const slug = s?.slug || s?.id;
    const resolvedImage = resolveImageUrl(s?.cover_image_url);
    const xmlSafeImage = resolvedImage ? escapeXmlEntities(resolvedImage) : '';
    return {
      url: `${BASE_URL}/series/${encodeURIComponent(slug)}`,
      lastModified: s?.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
      images: xmlSafeImage ? [xmlSafeImage] : undefined,
    };
  });

  return [...staticPages, ...topicPages, ...postPages, ...seriesPages];
}

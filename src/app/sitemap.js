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
const normalizeBaseUrl = (value) => (value || '').trim().replace(/\/+$/, '');
const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) || 'https://www.runtimemind.com';

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const candidate = value.publicUrl || value.url || value.href;
    return typeof candidate === 'string' ? candidate.trim() : '';
  }
  return '';
};

/**
 * Generate sitemap entries
 * 
 * @returns {Promise<import('next').MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/series`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
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
    const res = await getPublishedSeries();
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
    const title = (post?.title || '').toString();
    const updatedAt = post?.updated_at ? new Date(post.updated_at) : new Date();
    const resolvedImage = resolveImageUrl(post?.cover_image_url);
    const image = resolvedImage
      ? resolvedImage
      : `${BASE_URL}/api/og?title=${encodeURIComponent(title || slug)}&type=article&author=${encodeURIComponent((post?.author_name || '').toString())}`;

    return {
      url: `${BASE_URL}/articles/${encodeURIComponent(slug)}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      images: image ? [image] : undefined,
    };
  });

  const seriesPages = (seriesList || []).map((s) => {
    const slug = s?.slug || s?.id;
    return { url: `${BASE_URL}/series/${encodeURIComponent(slug)}`, lastModified: s?.updated_at ? new Date(s.updated_at) : new Date(), changeFrequency: 'weekly', priority: 0.85 };
  });

  return [...staticPages, ...topicPages, ...postPages, ...seriesPages];
}

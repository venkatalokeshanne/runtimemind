/**
 * ============================================================================
 * RSS FEED ROUTE
 * ============================================================================
 * 
 * Generates an RSS 2.0 feed for articles. Available at /rss
 * Allows readers to subscribe to new content through RSS readers.
 * 
 * ============================================================================
 */

import { getPublishedPosts } from '@/modules/articles/services';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://runtimemind.com';
const SITE_TITLE = 'RuntimeMind';
const SITE_DESCRIPTION = 'Articles, stories, tutorials, and blog posts from writers and creators. Write and publish for free on RuntimeMind.';

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate RSS feed XML
 */
function generateRssFeed(posts) {
  const rssItems = posts.map(post => {
    const postUrl = `${SITE_URL}/articles/${post.slug}`;
    const pubDate = new Date(post.published_at || post.created_at).toUTCString();
    const coverImage = post.cover_image || `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}`;
    
    // Extract author name
    const authorName = post.author?.full_name || post.author?.username || 'RuntimeMind';
    
    // Get tags as categories
    const categories = (post.tags || [])
      .map(tag => `    <category>${escapeXml(tag)}</category>`)
      .join('\n');
    
    return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <description><![CDATA[${post.excerpt || ''}]]></description>
    <pubDate>${pubDate}</pubDate>
    <author>${escapeXml(authorName)}</author>
${categories}
    <enclosure url="${escapeXml(coverImage)}" type="image/png" />
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
${rssItems}
  </channel>
</rss>`;
}

/**
 * GET /rss - Returns RSS feed
 */
export async function GET() {
  try {
    // Fetch all published posts
    const posts = await getPublishedPosts();
    
    // Sort by date (newest first)
    const sortedPosts = posts.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB - dateA;
    });
    
    // Limit to latest 50 posts for performance
    const recentPosts = sortedPosts.slice(0, 50);
    
    // Generate RSS XML
    const feed = generateRssFeed(recentPosts);
    
    return new Response(feed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Return empty feed on error
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
  </channel>
</rss>`;
    
    return new Response(emptyFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  }
}

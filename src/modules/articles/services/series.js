/**
 * ============================================================================
 * SERIES SERVICE
 * ============================================================================
 * 
 * Data access layer for blog post series.
 * Uses raw fetch to avoid Supabase client issues.
 */

import { supabaseFetch, getAuthToken } from '@/lib/supabase/fetch';
import { slugify } from '@/lib/utils';

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock series data for development
const mockSeries = [
  {
    id: '1',
    slug: 'building-modern-react-apps',
    title: 'Building Modern React Apps',
    description: 'A comprehensive guide to building production-ready React applications from scratch.',
    cover_image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    author_id: '1',
    published: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    posts_count: 5,
    author: { name: 'Jane Doe', avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg' }
  },
  {
    id: '2',
    slug: 'mastering-nextjs',
    title: 'Mastering Next.js',
    description: 'Learn Next.js from basics to advanced patterns including App Router, Server Components, and more.',
    cover_image_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
    author_id: '1',
    published: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    posts_count: 3,
    author: { name: 'Jane Doe', avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg' }
  },
];

const SERIES_LIST_SELECT = 'id,slug,title,description,cover_image_url,published,created_at,updated_at,author_id';

/**
 * Helper to fetch and attach author profiles
 */
async function attachAuthors(items, authorIdField = 'author_id') {
  if (!items?.length) return items;
  
  const authorIds = [...new Set(items.map(i => i[authorIdField]).filter(Boolean))];
  if (!authorIds.length) return items;

  const { data: profiles } = await supabaseFetch(
    `profiles?select=id,name,avatar_url&id=in.(${authorIds.join(',')})`
  );

  const profileMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  return items.map(item => ({
    ...item,
    author: profileMap[item[authorIdField]] || null,
  }));
}

/**
 * Helper to add posts count to series
 */
async function addPostsCounts(seriesList) {
  if (!seriesList?.length) return seriesList;
  
  const seriesIds = seriesList.map(s => s.id);
  const { data: posts } = await supabaseFetch(
    `posts?select=id,series_id&series_id=in.(${seriesIds.join(',')})&published=eq.true`
  );

  const countMap = (posts || []).reduce((acc, p) => {
    acc[p.series_id] = (acc[p.series_id] || 0) + 1;
    return acc;
  }, {});

  return seriesList.map(s => ({
    ...s,
    posts_count: countMap[s.id] || 0,
  }));
}

/**
 * Get all published series
 */
export async function getPublishedSeries({ limit = 20, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    const published = mockSeries.filter(s => s.published);
    return {
      data: published.slice(offset, offset + limit),
      error: null,
      count: published.length
    };
  }

  const { data, error } = await supabaseFetch(
    `series?select=${SERIES_LIST_SELECT}&published=eq.true&order=created_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    return { data: null, error, count: 0 };
  }

  let result = await attachAuthors(data);
  result = await addPostsCounts(result);

  return { data: result, error: null, count: result?.length || 0 };
}

/**
 * Get series by slug (public view)
 */
export async function getSeriesBySlug(slug) {
  if (!isSupabaseConfigured) {
    const series = mockSeries.find(s => s.slug === slug && s.published);
    return { data: series || null, error: series ? null : { message: 'Not found' } };
  }

  const { data, error } = await supabaseFetch(
    `series?select=${SERIES_LIST_SELECT}&slug=eq.${slug}&published=eq.true&limit=1`
  );

  if (error || !data?.length) {
    return { data: null, error: error || { message: 'Not found' } };
  }

  let series = data[0];

  // Fetch author
  if (series.author_id) {
    const { data: profile } = await supabaseFetch(
      `profiles?select=id,name,avatar_url&id=eq.${series.author_id}&limit=1`
    );
    series.author = profile?.[0] || null;
  }

  // Fetch posts in series
  const { data: posts } = await supabaseFetch(
    `posts?select=id,slug,title,excerpt,cover_image_url,published_at,series_order,published&series_id=eq.${series.id}&published=eq.true&order=series_order.asc`
  );

  series.posts = posts || [];
  series.posts_count = series.posts.length;

  return { data: series, error: null };
}

/**
 * Get series by ID (for editing)
 */
export async function getSeriesById(id) {
  if (!isSupabaseConfigured) {
    const series = mockSeries.find(s => s.id === id);
    return { data: series || null, error: series ? null : { message: 'Not found' } };
  }

  const { data, error } = await supabaseFetch(
    `series?select=${SERIES_LIST_SELECT}&id=eq.${id}&limit=1`
  );

  if (error || !data?.length) {
    return { data: null, error: error || { message: 'Not found' } };
  }

  let series = data[0];
  const result = await attachAuthors([series]);
  
  return { data: result[0], error: null };
}

/**
 * Get all series for a user (including unpublished)
 */
export async function getUserSeries(authorId) {
  if (!isSupabaseConfigured) {
    const userSeries = mockSeries.filter(s => s.author_id === authorId);
    return { data: userSeries, error: null };
  }

  const { data, error } = await supabaseFetch(
    `series?select=${SERIES_LIST_SELECT}&author_id=eq.${authorId}&order=created_at.desc`
  );

  if (error) {
    return { data: null, error };
  }

  let result = await attachAuthors(data);
  result = await addPostsCounts(result);

  return { data: result, error: null };
}

/**
 * Get all series for dropdown (id, title only)
 */
export async function getSeriesForSelect(authorId) {
  if (!isSupabaseConfigured) {
    return { 
      data: mockSeries
        .filter(s => s.author_id === authorId)
        .map(s => ({ id: s.id, title: s.title })), 
      error: null 
    };
  }

  const { data, error } = await supabaseFetch(
    `series?select=id,title&author_id=eq.${authorId}&order=title.asc`
  );

  return { data, error };
}

/**
 * Create a new series
 */
export async function createSeries({ title, description, cover_image_url, published = false }) {
  const slug = slugify(title);
  const token = getAuthToken();

  if (!token) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  if (!isSupabaseConfigured) {
    const newSeries = {
      id: String(Date.now()),
      slug,
      title,
      description,
      cover_image_url,
      published,
      author_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      posts_count: 0
    };
    mockSeries.push(newSeries);
    return { data: newSeries, error: null };
  }

  // Note: author_id will be set by RLS policy or trigger based on auth.uid()
  const { data, error } = await supabaseFetch('series?select=*', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({
      slug,
      title,
      description,
      cover_image_url,
      published,
    }),
  });

  return { data: Array.isArray(data) ? data[0] : data, error };
}

/**
 * Update a series
 */
export async function updateSeries(id, updates) {
  if (!isSupabaseConfigured) {
    const index = mockSeries.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSeries[index] = { ...mockSeries[index], ...updates, updated_at: new Date().toISOString() };
      if (updates.title) {
        mockSeries[index].slug = slugify(updates.title);
      }
      return { data: mockSeries[index], error: null };
    }
    return { data: null, error: { message: 'Not found' } };
  }

  const updateData = { ...updates };
  if (updates.title) {
    updateData.slug = slugify(updates.title);
  }

  const { data, error } = await supabaseFetch(`series?id=eq.${id}&select=*`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(updateData),
  });

  return { data: Array.isArray(data) ? data[0] : data, error };
}

/**
 * Delete a series
 */
export async function deleteSeries(id) {
  if (!isSupabaseConfigured) {
    const index = mockSeries.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSeries.splice(index, 1);
      return { data: { id }, error: null };
    }
    return { data: null, error: { message: 'Not found' } };
  }

  const { error } = await supabaseFetch(`series?id=eq.${id}`, {
    method: 'DELETE',
  });

  return { data: error ? null : { id }, error };
}

/**
 * Get posts in a series
 */
export async function getPostsInSeries(seriesId) {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data, error } = await supabaseFetch(
    `posts?select=id,slug,title,excerpt,cover_image_url,published,published_at,series_order,created_at&series_id=eq.${seriesId}&published=eq.true&order=series_order.asc`
  );

  if (error) {
    console.error('Error fetching posts in series:', error);
  }

  return { data: data || [], error };
}

/**
 * Get series info for a post (for navigation)
 */
export async function getSeriesForPost(postId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  // Get post's series_id
  const { data: postData, error: postError } = await supabaseFetch(
    `posts?select=series_id,series_order&id=eq.${postId}&limit=1`
  );

  const post = postData?.[0];
  if (postError || !post?.series_id) {
    return { data: null, error: postError };
  }

  // Get series info
  const { data: seriesData, error: seriesError } = await supabaseFetch(
    `series?select=id,slug,title&id=eq.${post.series_id}&limit=1`
  );

  const series = seriesData?.[0];
  if (seriesError || !series) {
    return { data: null, error: seriesError };
  }

  // Get all published posts in series
  const { data: posts, error: postsError } = await supabaseFetch(
    `posts?select=id,slug,title,series_order&series_id=eq.${post.series_id}&published=eq.true&order=series_order.asc`
  );

  if (postsError) {
    return { data: null, error: postsError };
  }

  const allPosts = posts || [];
  const currentIndex = allPosts.findIndex(p => p.id === postId);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    data: {
      series: { id: series.id, slug: series.slug, title: series.title },
      currentIndex: currentIndex + 1,
      totalPosts: allPosts.length,
      prevPost,
      nextPost,
      allPosts
    },
    error: null
  };
}

/**
 * Count posts in series
 */
export async function getSeriesPostsCount(seriesId) {
  if (!isSupabaseConfigured) {
    return { count: 0, error: null };
  }

  const { data, error } = await supabaseFetch(
    `posts?select=id&series_id=eq.${seriesId}&published=eq.true`
  );

  return { count: Array.isArray(data) ? data.length : 0, error };
}

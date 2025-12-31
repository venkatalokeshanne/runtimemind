/**
 * ============================================================================
 * SERIES SERVICE
 * ============================================================================
 * 
 * Data access layer for blog post series.
 * Handles CRUD operations and querying for series.
 * 
 * ============================================================================
 */

import { supabase } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

/**
 * Check if Supabase is configured
 */
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Mock series data for development
 */
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
  {
    id: '3',
    slug: 'typescript-deep-dive',
    title: 'TypeScript Deep Dive',
    description: 'Everything you need to know about TypeScript, from basic types to advanced patterns.',
    cover_image_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    author_id: '2',
    published: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    posts_count: 0,
    author: { name: 'John Smith', avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg' }
  }
];

/**
 * Series fields for listings
 */
const SERIES_LIST_FIELDS = `
  id,
  slug,
  title,
  description,
  cover_image_url,
  published,
  created_at,
  updated_at,
  author_id,
  author:profiles(name, avatar_url),
  posts(id)
`;

/**
 * Helper to add posts_count to series data
 */
function addPostsCount(seriesData) {
  if (!seriesData) return seriesData;
  
  const transform = (s) => ({
    ...s,
    posts_count: Array.isArray(s.posts) ? s.posts.length : 0,
    posts: undefined // Remove the posts array, we only needed the count
  });
  
  if (Array.isArray(seriesData)) {
    return seriesData.map(transform);
  }
  return transform(seriesData);
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

  const { data, error, count } = await supabase
    .from('series')
    .select(SERIES_LIST_FIELDS, { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data: addPostsCount(data), error, count };
}

/**
 * Get series by slug (public view)
 */
/**
 * Get series by slug (public view)
 */
export async function getSeriesBySlug(slug) {
  if (!isSupabaseConfigured) {
    const series = mockSeries.find(s => s.slug === slug && s.published);
    return { data: series || null, error: series ? null : { message: 'Not found' } };
  }

  const { data, error } = await supabase
    .from('series')
    .select(`
      id,
      slug,
      title,
      description,
      cover_image_url,
      published,
      created_at,
      updated_at,
      author_id,
      author:profiles(name, avatar_url),
      posts(id, slug, title, excerpt, cover_image_url, published_at, series_order, published)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  // Filter to only published posts and sort by series_order
  if (data?.posts) {
    data.posts = data.posts
      .filter(p => p.published)
      .sort((a, b) => (a.series_order || 0) - (b.series_order || 0));
    data.posts_count = data.posts.length;
  }

  return { data, error };
}

/**
 * Get series by ID (for editing)
 */
export async function getSeriesById(id) {
  if (!isSupabaseConfigured) {
    const series = mockSeries.find(s => s.id === id);
    return { data: series || null, error: series ? null : { message: 'Not found' } };
  }

  const { data, error } = await supabase
    .from('series')
    .select(SERIES_LIST_FIELDS)
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Get all series for a user (including unpublished)
 */
export async function getUserSeries(authorId) {
  if (!isSupabaseConfigured) {
    const userSeries = mockSeries.filter(s => s.author_id === authorId);
    return { data: userSeries, error: null };
  }

  const { data, error } = await supabase
    .from('series')
    .select(SERIES_LIST_FIELDS)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  return { data: addPostsCount(data), error };
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

  const { data, error } = await supabase
    .from('series')
    .select('id, title')
    .eq('author_id', authorId)
    .order('title', { ascending: true });

  return { data, error };
}

/**
 * Create a new series
 */
export async function createSeries({ title, description, cover_image_url, published = false }) {
  const slug = slugify(title);

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

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  const { data, error } = await supabase
    .from('series')
    .insert({
      slug,
      title,
      description,
      cover_image_url,
      published,
      author_id: user.id
    })
    .select()
    .single();

  return { data, error };
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

  const { data, error } = await supabase
    .from('series')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
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

  const { data, error } = await supabase
    .from('series')
    .delete()
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Get posts in a series
 */
export async function getPostsInSeries(seriesId) {
  if (!isSupabaseConfigured) {
    // Return mock posts that belong to this series
    return { 
      data: [], 
      error: null 
    };
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      slug,
      title,
      excerpt,
      cover_image_url,
      published,
      published_at,
      series_order,
      created_at
    `)
    .eq('series_id', seriesId)
    .eq('published', true)
    .order('series_order', { ascending: true });

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

  // First get the post's series_id
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('series_id, series_order')
    .eq('id', postId)
    .single();

  if (postError || !post?.series_id) {
    return { data: null, error: postError };
  }

  // Get series info
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('id, slug, title')
    .eq('id', post.series_id)
    .single();

  if (seriesError || !series) {
    return { data: null, error: seriesError };
  }

  // Get all published posts in the series (separate query to avoid join issues)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, slug, title, series_order')
    .eq('series_id', post.series_id)
    .eq('published', true)
    .order('series_order', { ascending: true });

  if (postsError) {
    return { data: null, error: postsError };
  }

  const allPosts = posts || [];
  const currentIndex = allPosts.findIndex(p => p.id === postId);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    data: {
      series: {
        id: series.id,
        slug: series.slug,
        title: series.title
      },
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

  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId)
    .eq('published', true);

  return { count: count || 0, error };
}

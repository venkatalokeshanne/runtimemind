/**
 * Fetches trending tags by post count.
 * @param {Object} options
 * @param {number} options.limit - Max tags to return
 * @returns {Promise<{data: Tag[], error: Object|null}>}
 */
export async function getTrendingTags({ limit = 6 } = {}) {
  // Use mock data if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return {
      data: [
        { slug: 'react', name: 'React' },
        { slug: 'nextjs', name: 'Next.js' },
        { slug: 'javascript', name: 'JavaScript' },
        { slug: 'css', name: 'CSS' },
        { slug: 'webdev', name: 'WebDev' },
        { slug: 'backend', name: 'Backend' },
      ].slice(0, limit),
      error: null,
    };
  }
  // Query tags table, order by post count desc
  const { data, error } = await supabase
    .from('tags')
    .select('slug, name, posts:posts(count)')
    .order('posts.count', { ascending: false })
    .limit(limit);
  return {
    data: (data || []).map((t) => ({ slug: t.slug, name: t.name })),
    error,
  };
}
/**
 * Fetches the most active/popular authors by post count.
 * @param {Object} options
 * @param {number} options.limit - Max authors to return
 * @returns {Promise<{data: Author[], error: Object|null}>}
 */
export async function getPopularAuthors({ limit = 4 } = {}) {
  // Use mock data if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return {
      data: [
        { id: '1', name: 'Jane Doe', bio: 'Fullstack dev & writer', avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { id: '2', name: 'John Smith', bio: 'Cloud architect', avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { id: '3', name: 'Alice Lee', bio: 'Frontend specialist', avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg' },
        { id: '4', name: 'Bob Brown', bio: 'Backend engineer', avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg' },
      ].slice(0, limit),
      error: null,
    };
  }
  // Query profiles table, join with posts, count posts per author
  const { data, error } = await supabase
    .rpc('get_popular_authors', { limit_param: limit });
  // Fallback: If no RPC, fetch authors with most posts
  // (Assumes a 'profiles' table for authors)
  if (error || !data) {
    // Try fallback: select from profiles, order by post count
    const { data: profiles, error: fallbackError } = await supabase
      .from('profiles')
      .select('id, name, bio, avatar_url, posts:posts(count)')
      .order('posts.count', { ascending: false })
      .limit(limit);
    return {
      data: (profiles || []).map((p) => ({
        id: p.id,
        name: p.name,
        bio: p.bio,
        avatar_url: p.avatar_url,
      })),
      error: fallbackError,
    };
  }
  // If using RPC, data is already sorted
  return {
    data: data.map((a) => ({
      id: a.id,
      name: a.name,
      bio: a.bio,
      avatar_url: a.avatar_url,
    })),
    error: null,
  };
}
/**
 * ============================================================================
 * BLOG POST SERVICE
 * ============================================================================
 * 
 * Data access layer for blog posts.
 * 
 * ARCHITECTURAL PRINCIPLES:
 * 
 * 1. SEPARATION OF CONCERNS:
 *    This file handles ONLY Supabase queries for posts.
 *    No UI logic, no rendering, no React hooks.
 * 
 * 2. DEPENDENCY INVERSION:
 *    Components depend on this service's interface, not Supabase directly.
 *    If we switch to a different backend, only this file changes.
 * 
 * 3. SINGLE RESPONSIBILITY:
 *    Each function does one thing: fetch posts, fetch single post, etc.
 * 
 * 4. EXPLICIT ERROR HANDLING:
 *    All functions return { data, error } pattern.
 *    Callers decide how to handle errors (toast, redirect, etc.)
 * 
 * 5. DEVELOPMENT MODE:
 *    When Supabase isn't configured, falls back to mock data.
 *    Allows UI development without database setup.
 * 
 * ============================================================================
 */

import { supabase } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { getMockPosts, getMockPostBySlug, mockPosts } from '@/lib/mock-data';

/**
 * Check if Supabase is configured
 */
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Fields to select for post listings (not full content).
 * 
 * WHY LIMIT FIELDS:
 * - Reduce payload size for list views
 * - Content can be large, not needed for cards
 * - Join author data efficiently
 */
const POST_LIST_FIELDS = `
  id,
  slug,
  title,
  excerpt,
  cover_image_url,
  published,
  published_at,
  author_id
`;

/**
 * Fields to select for full post view.
 */
const POST_FULL_FIELDS = `
  id,
  slug,
  title,
  content,
  excerpt,
  cover_image_url,
  published,
  published_at,
  created_at,
  updated_at,
  author_id,
  series_id,
  series_order,
  tags,
  seo_title,
  seo_description,
  featured,
  read_time_minutes,
  view_count
`;

/**
 * Attach author profiles to posts by querying `profiles` separately.
 * This avoids relying on PostgREST foreign-key embedding which requires
 * an explicit FK in the database (posts.author_id -> profiles.id).
 */
async function attachAuthorsToPosts(posts = []) {
  const ids = Array.from(new Set(posts.map(p => p.author_id).filter(Boolean)));
  if (!ids.length) return posts.map(p => ({ ...p, author: null }));

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url')
    .in('id', ids);

  if (error) {
    console.error('Error fetching author profiles for posts:', error);
    return posts.map(p => ({ ...p, author: null }));
  }

  const byId = (profiles || []).reduce((acc, prof) => {
    acc[prof.id] = prof; return acc;
  }, {});

  return posts.map(p => ({ ...p, author: byId[p.author_id] || null }));
}

/**
 * Fetches all published posts for the homepage/blog listing.
 * 
 * @param {Object} options
 * @param {number} options.limit - Maximum posts to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: PostListItem[]|null, error: Object|null}>}
 */
export async function getPublishedPosts({ limit = 10, offset = 0 } = {}) {
  // Use mock data if Supabase isn't configured (development mode)
  if (!isSupabaseConfigured) {
    return getMockPosts({ limit, offset });
  }

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts:', error);
    return { 
      data: null, 
      error: { message: 'Failed to load posts', code: error.code } 
    };
  }
  // Attach author profiles to the posts
  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Fetches a single published post by slug.
 * 
 * WHY BY SLUG NOT ID:
 * - Slugs are used in URLs for SEO
 * - More readable URLs
 * - IDs are UUIDs, ugly in URLs
 * 
 * @param {string} slug - Post slug
 * @returns {Promise<{data: PostWithAuthor|null, error: Object|null}>}
 */
export async function getPostBySlug(slug) {
  // Use mock data if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return getMockPostBySlug(slug);
  }

  const { data, error } = await supabase
    .from('posts')
    .select(POST_FULL_FIELDS)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    // PGRST116 = Row not found (normal for 404)
    if (error.code === 'PGRST116') {
      return { 
        data: null, 
        error: { message: 'Post not found', code: 'NOT_FOUND' } 
      };
    }
    
    console.error('Error fetching post:', error);
    return { 
      data: null, 
      error: { message: 'Failed to load post', code: error.code } 
    };
  }

  // Attach author profile to the returned post
  try {
    const enriched = await attachAuthorsToPosts([data]);
    return { data: enriched[0] || null, error: null };
  } catch (e) {
    console.error('Failed to attach author to post:', e);
    return { data, error: null };
  }
}

/**
 * Fetches all post slugs for static generation.
 * 
 * USAGE: Next.js generateStaticParams
 * This allows pre-rendering all post pages at build time.
 * 
 * @returns {Promise<{data: {slug: string}[]|null, error: Object|null}>}
 */
export async function getAllPostSlugs() {
  // Use mock data if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return { 
      data: mockPosts.map(p => ({ slug: p.slug })), 
      error: null 
    };
  }

  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true);

  if (error) {
    console.error('Error fetching slugs:', error);
    return { data: null, error: { message: 'Failed to load slugs' } };
  }

  return { data, error: null };
}

/**
 * Fetches posts by author.
 * 
 * @param {string} authorId - Author UUID
 * @param {Object} options
 * @param {boolean} options.includeDrafts - Include unpublished posts (for author's own view)
 * @returns {Promise<{data: PostListItem[]|null, error: Object|null}>}
 */
export async function getPostsByAuthor(authorId, { includeDrafts = false } = {}) {
  if (!authorId) {
    console.warn('getPostsByAuthor called without authorId');
    return { data: [], error: null };
  }

  // If Supabase isn't configured (development mode), return filtered mock posts
  if (!isSupabaseConfigured) {
    try {
      const { data } = getMockPosts({ limit: 1000 });
      const filtered = (data || []).filter(p => p.author_id === authorId).filter(p => {
        if (includeDrafts) return true;
        return p.published;
      });
      return { data: filtered, error: null };
    } catch (e) {
      console.warn('Failed to load mock posts for author:', e);
      return { data: [], error: { message: 'Failed to load mock posts' } };
    }
  }

  let query = supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (!includeDrafts) {
    query = query.eq('published', true);
  }

  // Execute the query with defensive error handling and richer diagnostics
  if (!supabase) {
    console.error('Supabase client is not initialized in getPostsByAuthor (supabase is falsy). isSupabaseConfigured=', isSupabaseConfigured);
    return { data: [], error: { message: 'Supabase client not available' } };
  }

  let res;
  try {
    res = await query;
  } catch (err) {
    console.error('Exception while awaiting Supabase query in getPostsByAuthor:', err, { authorId, isSupabaseConfigured });
    return { data: [], error: { message: err?.message || String(err) } };
  }

  // Inspect response shape explicitly to avoid relying on JSON.stringify on complex objects
  const data = res && 'data' in res ? res.data : undefined;
  const error = res && 'error' in res ? res.error : undefined;
  const status = res && 'status' in res ? res.status : undefined;

  if (error) {
    try {
      console.error('Supabase getPostsByAuthor response details:', {
        hasData: !!data,
        dataSample: Array.isArray(data) ? (data[0] ? { id: data[0].id, title: data[0].title } : null) : null,
        error: { message: error.message, code: error.code, details: error.details },
        status,
        authorId,
        isSupabaseConfigured,
        envPresent: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      });
    } catch (e) {
      console.error('Supabase getPostsByAuthor response (raw):', res, 'authorId=', authorId);
    }

    return {
      data: [],
      error: {
        message: error.message || 'Failed to load posts',
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: status || null,
      },
    };
  }

  // Attach author profile(s) to these posts (they share the same authorId)
  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Creates a new post.
 * 
 * @param {CreatePostInput} input - Post data
 * @param {string} authorId - Author UUID
 * @returns {Promise<{data: Post|null, error: Object|null}>}
 */
export async function createPost(input, authorId) {
  // Generate slug from title
  const slug = slugify(input.title);

  const postData = {
    slug,
    title: input.title,
    content: input.content,
    excerpt: input.excerpt || null,
    cover_image_url: input.cover_image_url || null,
    author_id: authorId,
    published: input.published || false,
    published_at: input.published ? new Date().toISOString() : null,
    series_id: input.series_id || null,
    series_order: input.series_order || null,
    tags: input.tags || [],
    // SEO fields
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    featured: input.featured || false,
    read_time_minutes: input.read_time_minutes || 1,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    // Duplicate slug
    if (error.code === '23505') {
      return { 
        data: null, 
        error: { message: 'A post with this title already exists', code: 'DUPLICATE' } 
      };
    }
    
    console.error('Error creating post:', error);
    return { data: null, error: { message: 'Failed to create post' } };
  }

  return { data, error: null };
}

/**
 * Upload a cover image to Supabase Storage and return a public URL.
 * Stores files under the `covers/` folder by author id to keep things organized.
 * Returns { url, error }
 */
export async function uploadCoverImage(file, authorId) {
  if (!file) return { url: null, error: { message: 'No file provided' } };

  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured; skipping cover upload');
    return { url: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const filePath = `covers/${authorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('covers')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Error uploading cover image:', uploadError);
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: publicData, error: publicError } = await supabase
      .storage
      .from('covers')
      .getPublicUrl(uploadData.path);

    if (publicError) {
      console.error('Error getting public url for cover image:', publicError);
      return { url: null, error: publicError };
    }

    return { url: publicData.publicUrl, error: null };
  } catch (e) {
    console.error('Exception in uploadCoverImage:', e);
    return { url: null, error: { message: e?.message || String(e) } };
  }
}

/**
 * Upload inline images for post content to Supabase Storage and return a public URL.
 * Uses the `images` bucket and returns { url, error }.
 */
export async function uploadImage(file, authorId) {
  if (!file) return { url: null, error: { message: 'No file provided' } };
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured; skipping image upload');
    return { url: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const filePath = `images/${authorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { url: null, error: uploadError };
    }

    const { data: publicData, error: publicError } = await supabase
      .storage
      .from('images')
      .getPublicUrl(uploadData.path);

    if (publicError) {
      console.error('Error getting public url for image:', publicError);
      return { url: null, error: publicError };
    }

    return { url: publicData.publicUrl, error: null };
  } catch (e) {
    console.error('Exception in uploadImage:', e);
    return { url: null, error: { message: e?.message || String(e) } };
  }
}

/**
 * Updates an existing post.
 * 
 * @param {string} postId - Post UUID
 * @param {UpdatePostInput} input - Fields to update
 * @returns {Promise<{data: Post|null, error: Object|null}>}
 */
export async function updatePost(postId, input) {
  // If title changed, regenerate slug
  const updates = { ...input };
  if (input.title) {
    updates.slug = slugify(input.title);
  }

  // If publishing for first time, set published_at
  if (input.published && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return { data: null, error: { message: 'Failed to update post' } };
  }

  return { data, error: null };
}

/**
 * Deletes a post.
 * 
 * @param {string} postId - Post UUID
 * @returns {Promise<{data: null, error: Object|null}>}
 */
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return { data: null, error: { message: 'Failed to delete post' } };
  }

  return { data: null, error: null };
}

/**
 * Gets total count of published posts.
 * Useful for pagination.
 * 
 * @returns {Promise<{data: number|null, error: Object|null}>}
 */
export async function getPublishedPostCount() {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  if (error) {
    console.error('Error counting posts:', error);
    return { data: null, error: { message: 'Failed to count posts' } };
  }

  return { data: count, error: null };
}

/**
 * Get related posts for a given post.
 * 
 * Strategy:
 * 1. If post is in a series, show other posts from that series
 * 2. Otherwise, show recent posts (excluding current)
 * 
 * @param {string} postId - Current post ID
 * @param {string|null} seriesId - Series ID if post is in a series
 * @param {string} currentSlug - Current post slug to exclude
 * @param {number} limit - Max posts to return
 * @returns {Promise<{data: Post[], error: Object|null}>}
 */
export async function getRelatedPosts(postId, seriesId, currentSlug, limit = 4) {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  let query = supabase
    .from('posts')
    .select(`
      id,
      slug,
      title,
      excerpt,
      cover_image_url,
      published_at,
      series_id
    `)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(limit);

  if (seriesId) {
    // If in a series, prioritize posts from the same series
    query = query.eq('series_id', seriesId).order('series_order', { ascending: true });
  } else {
    // Otherwise, show recent posts
    query = query.order('published_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related posts:', error);
    return { data: [], error };
  }

  // If we got posts from series but need more, fetch recent posts
  if (seriesId && data && data.length < limit) {
    const remaining = limit - data.length;
    const existingIds = data.map(p => p.id);
    existingIds.push(postId);
    
    const { data: morePosts } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        cover_image_url,
        published_at,
        series_id
      `)
      .eq('published', true)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .order('published_at', { ascending: false })
      .limit(remaining);

    if (morePosts) {
      return { data: [...data, ...morePosts], error: null };
    }
  }

  return { data: data || [], error: null };
}

/**
 * Fetches posts from users that the current user follows.
 * Used for the "Following" feed tab.
 * 
 * @param {string} userId - Current user ID
 * @param {Object} options
 * @param {number} options.limit - Maximum posts to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: PostListItem[]|null, error: Object|null}>}
 */
export async function getFollowingPosts(userId, { limit = 10, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  // First get the list of users this user follows
  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (followsError) {
    console.error('Error fetching follows:', followsError);
    return { data: [], error: followsError };
  }

  if (!follows || follows.length === 0) {
    return { data: [], error: null };
  }

  const followingIds = follows.map(f => f.following_id);

  // Fetch posts from followed users
  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('published', true)
    .in('author_id', followingIds)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching following posts:', error);
    return { data: [], error };
  }

  // Attach author profiles
  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Fetches trending posts (most recent, could be enhanced with view counts later)
 * 
 * @param {Object} options
 * @param {number} options.limit - Maximum posts to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: PostListItem[]|null, error: Object|null}>}
 */
export async function getTrendingPosts({ limit = 10, offset = 0 } = {}) {
  // For now, trending = most recent published posts
  // Could be enhanced with view counts, likes, etc.
  return getPublishedPosts({ limit, offset });
}

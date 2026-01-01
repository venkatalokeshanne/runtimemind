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
        { id: '1', name: 'Jane Doe', bio: 'Fullstack dev & writer', avatar_url: 'https://ui-avatars.com/api/?name=Jane+Doe&background=6366f1&color=fff' },
        { id: '2', name: 'John Smith', bio: 'Cloud architect', avatar_url: 'https://ui-avatars.com/api/?name=John+Smith&background=8b5cf6&color=fff' },
        { id: '3', name: 'Alice Lee', bio: 'Frontend specialist', avatar_url: 'https://ui-avatars.com/api/?name=Alice+Lee&background=ec4899&color=fff' },
        { id: '4', name: 'Bob Brown', bio: 'Backend engineer', avatar_url: 'https://ui-avatars.com/api/?name=Bob+Brown&background=14b8a6&color=fff' },
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
  created_at,
  author_id,
  read_time_minutes,
  likes_count,
  comments_count,
  view_count
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
    .select('id, name, bio, avatar_url, website, linkedin, twitter')
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
 * Increment view count for a post.
 * 
 * Uses RPC to atomically increment the counter to avoid race conditions.
 * Falls back to regular update if RPC is not available.
 * 
 * @param {string} postId - Post UUID
 * @returns {Promise<{error: Object|null}>}
 */
export async function incrementViewCount(postId) {
  if (!isSupabaseConfigured || !postId) {
    return { error: null };
  }

  try {
    // Try using RPC for atomic increment (if function exists)
    const { error: rpcError } = await supabase.rpc('increment_view_count', {
      post_id: postId
    });

    // If RPC doesn't exist, fall back to regular update
    if (rpcError && rpcError.code === 'PGRST202') {
      // Fetch current count and increment
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      const newCount = (post?.view_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('posts')
        .update({ view_count: newCount })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating view count:', updateError);
        return { error: updateError };
      }
    } else if (rpcError) {
      console.error('Error incrementing view count:', rpcError);
      return { error: rpcError };
    }

    return { error: null };
  } catch (e) {
    console.error('Failed to increment view count:', e);
    return { error: { message: e.message } };
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
  console.log('createPost called with authorId:', authorId);
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    console.error('Supabase not configured');
    return { data: null, error: { message: 'Database not configured' } };
  }
  
  // Validate authorId upfront
  if (!authorId) {
    console.error('No authorId provided');
    return { data: null, error: { message: 'User ID is required' } };
  }
  
  // Generate slug from title
  const slug = slugify(input.title);
  console.log('Generated slug:', slug);

  // Log content size for debugging
  const contentSize = input.content?.length || 0;
  console.log('Content size (chars):', contentSize, '(~' + Math.round(contentSize / 1024) + 'KB)');

  // Warn if content is too large (Supabase has limits around 1MB for single inserts)
  if (contentSize > 500000) {
    console.warn('Content is very large (>500KB), this may fail');
    return { 
      data: null, 
      error: { 
        message: 'Content is too large. Please reduce the article size and try again.',
        code: 'CONTENT_TOO_LARGE'
      } 
    };
  }

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

  console.log('Inserting post data (size:', JSON.stringify(postData).length, 'bytes)...');
  
  try {
    const startTime = Date.now();
    
    // Get current session for auth token
    console.log('Getting session token...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session:', session ? 'found' : 'not found', 'in', Date.now() - startTime, 'ms');
    
    if (!session?.access_token) {
      console.error('No access token in session');
      return { data: null, error: { message: 'Not authenticated. Please log in again.' } };
    }
    
    // Use direct fetch with auth header to bypass any client issues
    console.log('Making direct fetch request...');
    const fetchStart = Date.now();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(postData),
      }
    );
    
    console.log('Fetch completed in', Date.now() - fetchStart, 'ms, status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Insert failed:', response.status, errorText);
      
      // Parse error if JSON
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.code === '23505') {
          return { data: null, error: { message: 'A post with this title already exists', code: 'DUPLICATE' } };
        }
        if (errorJson.code === '42501' || errorJson.message?.includes('policy')) {
          return { data: null, error: { message: 'Permission denied. Please log in again.', code: 'RLS_ERROR' } };
        }
        return { data: null, error: { message: errorJson.message || 'Failed to create post' } };
      } catch {
        return { data: null, error: { message: errorText || 'Failed to create post' } };
      }
    }
    
    const result = await response.json();
    const data = Array.isArray(result) ? result[0] : result;
    
    console.log('Insert result - data:', data?.id);
    return { data, error: null };
  } catch (err) {
    console.error('Insert exception:', err.name, err.message);
    return { data: null, error: { message: err.message || 'Failed to create post' } };
  }
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

/**
 * Gets user-specific statistics for dashboard
 * 
 * @param {string} userId - User ID to get stats for
 * @returns {Promise<{data: {totalPosts: number, publishedPosts: number, draftPosts: number, totalViews: number}|null, error: Object|null}>}
 */
export async function getUserStats(userId) {
  if (!userId) {
    console.warn('getUserStats called without userId');
    return { data: null, error: { message: 'User ID required' } };
  }

  // Use mock data if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return {
      data: {
        totalPosts: 12,
        publishedPosts: 8,
        draftPosts: 4,
        totalViews: 1247,
        changes: {
          postsThisMonth: 3,
          viewsThisWeek: 142
        }
      },
      error: null,
    };
  }

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total posts count
    const { count: totalCount, error: totalError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId);

    if (totalError) {
      console.error('Error counting total posts:', totalError);
      return { data: null, error: { message: 'Failed to fetch user stats' } };
    }

    // Get published posts count
    const { count: publishedCount, error: publishedError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('published', true);

    if (publishedError) {
      console.error('Error counting published posts:', publishedError);
      return { data: null, error: { message: 'Failed to fetch user stats' } };
    }

    // Get posts created this month
    const { count: postsThisMonth, error: monthError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .gte('created_at', oneMonthAgo.toISOString());

    if (monthError) {
      console.error('Error counting posts this month:', monthError);
    }

    // Get all posts with view counts and creation dates
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('view_count, created_at')
      .eq('author_id', userId);

    if (postsError) {
      console.error('Error fetching posts data:', postsError);
      return { data: null, error: { message: 'Failed to fetch user stats' } };
    }

    const totalViews = (postsData || []).reduce((sum, post) => sum + (post.view_count || 0), 0);
    
    // Calculate views from posts created this week (as a proxy for "views this week")
    // In a real app, you'd have a view_logs table with timestamps
    const viewsThisWeek = (postsData || [])
      .filter(post => new Date(post.created_at) >= oneWeekAgo)
      .reduce((sum, post) => sum + (post.view_count || 0), 0);

    const draftCount = (totalCount || 0) - (publishedCount || 0);

    return {
      data: {
        totalPosts: totalCount || 0,
        publishedPosts: publishedCount || 0,
        draftPosts: draftCount,
        totalViews: totalViews,
        changes: {
          postsThisMonth: postsThisMonth || 0,
          viewsThisWeek: viewsThisWeek
        }
      },
      error: null,
    };
  } catch (err) {
    console.error('Exception while fetching user stats:', err);
    return { data: null, error: { message: 'Failed to fetch user stats' } };
  }
}

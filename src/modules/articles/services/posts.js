/**
 * ============================================================================
 * BLOG POST SERVICE
 * ============================================================================
 * 
 * Data access layer for blog posts.
 * Uses raw fetch to avoid Supabase client issues.
 */

import { supabaseFetch, getAuthToken } from '@/lib/supabase/fetch';
import { slugify } from '@/lib/utils';
import { getMockPosts, getMockPostBySlug, mockPosts } from '@/lib/mock-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const POST_LIST_FIELDS = 'id,slug,title,excerpt,cover_image_url,published,published_at,created_at,author_id,read_time_minutes,likes_count,comments_count,view_count';
const POST_FULL_FIELDS = 'id,slug,title,content,excerpt,cover_image_url,published,published_at,created_at,updated_at,author_id,series_id,series_order,tags,seo_title,seo_description,featured,read_time_minutes,view_count';

/**
 * Attach author profiles to posts
 */
async function attachAuthorsToPosts(posts = []) {
  const ids = Array.from(new Set(posts.map(p => p.author_id).filter(Boolean)));
  if (!ids.length) return posts.map(p => ({ ...p, author: null }));

  const { data: profiles, error } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url,website,linkedin,twitter&id=in.(${ids.join(',')})`
  );

  if (error) {
    console.error('Error fetching author profiles:', error);
    return posts.map(p => ({ ...p, author: null }));
  }

  const byId = (profiles || []).reduce((acc, prof) => {
    acc[prof.id] = prof;
    return acc;
  }, {});

  return posts.map(p => ({ ...p, author: byId[p.author_id] || null }));
}

/**
 * Get trending tags
 */
export async function getTrendingTags({ limit = 6 } = {}) {
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

  const { data, error } = await supabaseFetch(`tags?select=slug,name&limit=${limit}`);
  return {
    data: (data || []).map(t => ({ slug: t.slug, name: t.name })),
    error,
  };
}

/**
 * Get topics that have published posts
 */
export async function getTopicsWithPosts({ limit = 10 } = {}) {
  if (!isSupabaseConfigured) {
    return {
      data: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'CSS'].slice(0, limit),
      error: null,
    };
  }

  // Fetch distinct topics from published posts
  const { data, error } = await supabaseFetch(
    `posts?select=topic&published=eq.true&topic=not.is.null&order=published_at.desc`
  );

  if (error) {
    console.error('Error fetching topics:', error);
    return { data: [], error };
  }

  // Get unique topics and limit
  const uniqueTopics = [...new Set((data || []).map(p => p.topic).filter(Boolean))].slice(0, limit);
  return { data: uniqueTopics, error: null };
}

/**
 * Get posts by topic
 */
export async function getPostsByTopic(topic, { limit = 20, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    const mockData = getMockPosts({ limit, offset });
    return mockData;
  }

  const { data, error } = await supabaseFetch(
    `posts?select=${POST_LIST_FIELDS},topic&published=eq.true&topic=eq.${encodeURIComponent(topic)}&order=published_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    console.error('Error fetching posts by topic:', error);
    return { data: null, error: { message: 'Failed to load posts', code: error.code } };
  }

  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Get popular authors
 */
export async function getPopularAuthors({ limit = 4 } = {}) {
  if (!isSupabaseConfigured) {
    return {
      data: [
        { id: '1', name: 'Jane Doe', bio: 'Fullstack dev & writer', avatar_url: 'https://ui-avatars.com/api/?name=Jane+Doe&background=6366f1&color=fff' },
        { id: '2', name: 'John Smith', bio: 'Cloud architect', avatar_url: 'https://ui-avatars.com/api/?name=John+Smith&background=8b5cf6&color=fff' },
      ].slice(0, limit),
      error: null,
    };
  }

  const { data, error } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url&limit=${limit}`
  );

  return {
    data: (data || []).map(p => ({
      id: p.id,
      name: p.name,
      bio: p.bio,
      avatar_url: p.avatar_url,
    })),
    error,
  };
}

/**
 * Get author by ID
 */
export async function getAuthorById(authorId) {
  if (!authorId) {
    return { data: null, error: { message: 'Author ID required' } };
  }

  if (!isSupabaseConfigured) {
    return {
      data: { id: authorId, name: 'Demo Author', bio: 'A passionate writer', avatar_url: null },
      error: null,
    };
  }

  const { data, error } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url,website,linkedin,twitter&id=eq.${authorId}&limit=1`
  );

  if (error) {
    console.error('Error fetching author:', error);
    return { data: null, error };
  }

  return { data: data?.[0] || null, error: null };
}

/**
 * Fetch published posts
 */
export async function getPublishedPosts({ limit = 10, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    return getMockPosts({ limit, offset });
  }

  const { data, error } = await supabaseFetch(
    `posts?select=${POST_LIST_FIELDS}&published=eq.true&order=published_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    console.error('Error fetching posts:', error);
    return { data: null, error: { message: 'Failed to load posts', code: error.code } };
  }

  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Fetch a single published post by slug
 */
export async function getPostBySlug(slug) {
  if (!isSupabaseConfigured) {
    return getMockPostBySlug(slug);
  }

  const { data, error } = await supabaseFetch(
    `posts?select=${POST_FULL_FIELDS}&slug=eq.${slug}&published=eq.true&limit=1`
  );

  if (error) {
    console.error('Error fetching post:', error);
    return { data: null, error: { message: 'Failed to load post', code: error.code } };
  }

  const post = data?.[0];
  if (!post) {
    return { data: null, error: { message: 'Post not found', code: 'NOT_FOUND' } };
  }

  try {
    const enriched = await attachAuthorsToPosts([post]);
    const resultPost = enriched[0] || null;

    // Attach series info (cover image) when available so UIs can fallback to series cover
    if (resultPost?.series_id) {
      try {
        const { data: seriesData } = await supabaseFetch(
          `series?select=id,slug,title,cover_image_url&id=eq.${resultPost.series_id}&limit=1`
        );
        resultPost.series = seriesData?.[0] || null;
      } catch (e) {
        // ignore series fetch failures
        resultPost.series = null;
      }
    }

    return { data: resultPost, error: null };
  } catch (e) {
    console.error('Failed to attach author:', e);
    return { data: post, error: null };
  }
}

/**
 * Fetch a single post by ID (used in dashboard edit flow).
 * Includes series relation and author attachment. Does NOT require published=true.
 */
export async function getPostById(id) {
  if (!id) return { data: null, error: { message: 'Post ID required' } };

  if (!isSupabaseConfigured) {
    // Try mock fallback
    const mock = getMockPosts({ limit: 1000 }).data || [];
    const found = mock.find(p => String(p.id) === String(id));
    if (!found) return { data: null, error: { message: 'Post not found' } };
    const enriched = await attachAuthorsToPosts([found]);
    return { data: enriched[0] || null, error: null };
  }

  try {
    const { data, error } = await supabaseFetch(
      `posts?select=${POST_FULL_FIELDS},series:series_id(id,title)&id=eq.${id}&limit=1`
    );

    if (error) {
      console.error('Error fetching post by id:', error);
      return { data: null, error };
    }

    const post = data?.[0];
    if (!post) return { data: null, error: { message: 'Post not found', code: 'NOT_FOUND' } };

    try {
      const enriched = await attachAuthorsToPosts([post]);
      return { data: enriched[0] || null, error: null };
    } catch (e) {
      console.error('Failed to attach author (by id):', e);
      return { data: post, error: null };
    }
  } catch (e) {
    console.error('Exception fetching post by id:', e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(postId) {
  if (!isSupabaseConfigured || !postId) {
    return { error: null };
  }

  try {
    // Get current count
    const { data: postData } = await supabaseFetch(
      `posts?select=view_count&id=eq.${postId}&limit=1`
    );

    const currentCount = postData?.[0]?.view_count || 0;
    
    // Increment
    const { error } = await supabaseFetch(`posts?id=eq.${postId}`, {
      method: 'PATCH',
      body: JSON.stringify({ view_count: currentCount + 1 }),
    });

    return { error };
  } catch (e) {
    console.error('Failed to increment view count:', e);
    return { error: { message: e.message } };
  }
}

/**
 * Get all post slugs for static generation
 */
export async function getAllPostSlugs() {
  if (!isSupabaseConfigured) {
    return { data: mockPosts.map(p => ({ slug: p.slug })), error: null };
  }

  const { data, error } = await supabaseFetch('posts?select=slug&published=eq.true');

  if (error) {
    console.error('Error fetching slugs:', error);
    return { data: null, error: { message: 'Failed to load slugs' } };
  }

  return { data, error: null };
}

/**
 * Fetch posts by author
 */
export async function getPostsByAuthor(authorId, { includeDrafts = false } = {}) {
  if (!authorId) {
    return { data: [], error: null };
  }

  if (!isSupabaseConfigured) {
    try {
      const { data } = getMockPosts({ limit: 1000 });
      const filtered = (data || []).filter(p => p.author_id === authorId).filter(p => includeDrafts || p.published);
      return { data: filtered, error: null };
    } catch (e) {
      return { data: [], error: { message: 'Failed to load mock posts' } };
    }
  }

  let url = `posts?select=${POST_LIST_FIELDS}&author_id=eq.${authorId}&order=created_at.desc`;
  if (!includeDrafts) {
    url += '&published=eq.true';
  }

  const { data, error } = await supabaseFetch(url);

  if (error) {
    console.error('Error fetching posts by author:', error);
    return { data: [], error };
  }

  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Create a new post
 */
export async function createPost(input, authorId) {
  console.log('createPost called with authorId:', authorId);
  
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Database not configured' } };
  }
  
  if (!authorId) {
    return { data: null, error: { message: 'User ID is required' } };
  }

  const token = await getAuthToken();
  if (!token) {
    return { data: null, error: { message: 'Not authenticated. Please log in again.' } };
  }
  
  const slug = slugify(input.title);
  const contentSize = input.content?.length || 0;
  
  if (contentSize > 500000) {
    return { 
      data: null, 
      error: { message: 'Content is too large. Please reduce the article size.', code: 'CONTENT_TOO_LARGE' } 
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
    topic: input.topic || null,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    featured: input.featured || false,
    read_time_minutes: input.read_time_minutes || 1,
  };

  const { data, error } = await supabaseFetch('posts?select=*', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(postData),
  });

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: { message: 'A post with this title already exists', code: 'DUPLICATE' } };
    }
    if (error.code === '42501' || error.message?.includes('policy')) {
      return { data: null, error: { message: 'Permission denied. Please log in again.', code: 'RLS_ERROR' } };
    }
    console.error('Error creating post:', error);
    return { data: null, error };
  }

  return { data: Array.isArray(data) ? data[0] : data, error: null };
}

/**
 * Upload cover image using fetch
 */
export async function uploadCoverImage(file, authorId) {
  if (!file) return { url: null, error: { message: 'No file provided' } };
  if (!isSupabaseConfigured) return { url: null, error: { message: 'Supabase not configured' } };

  const token = await getAuthToken();
  if (!token) return { url: null, error: { message: 'Not authenticated' } };

  try {
    const filePath = `${authorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    // Try primary buckets (prefer `blog-images`), fall back if bucket doesn't exist or returns 4xx
    const bucketsToTry = ['blog-images', 'covers'];
    for (const bucket of bucketsToTry) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
        },
        body: file,
      });

      if (res.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
        return { url: publicUrl, error: null };
      }

      // If 400/404 try next bucket, otherwise return error details
      const errBody = await res.json().catch(() => ({ message: res.statusText }));
      if (res.status >= 500) {
        return { url: null, error: errBody };
      }
      // continue to next bucket for 4xx
    }

    return { url: null, error: { message: 'Failed to upload cover image to configured buckets' } };
  } catch (e) {
    console.error('Error uploading cover:', e);
    return { url: null, error: { message: e.message } };
  }
}

/**
 * Upload inline image
 */
export async function uploadImage(file, authorId) {
  if (!file) return { url: null, error: { message: 'No file provided' } };
  if (!isSupabaseConfigured) return { url: null, error: { message: 'Supabase not configured' } };

  const token = await getAuthToken();
  if (!token) return { url: null, error: { message: 'Not authenticated' } };

  try {
    const filePath = `${authorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    const bucketsToTry = ['blog-images', 'images'];
    for (const bucket of bucketsToTry) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
        },
        body: file,
      });

      if (res.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
        return { url: publicUrl, error: null };
      }

      const errBody = await res.json().catch(() => ({ message: res.statusText }));
      if (res.status >= 500) {
        return { url: null, error: errBody };
      }
    }

    return { url: null, error: { message: 'Failed to upload image to configured buckets' } };
  } catch (e) {
    console.error('Error uploading image:', e);
    return { url: null, error: { message: e.message } };
  }
}

/**
 * Update a post
 */
export async function updatePost(postId, input) {
  const updates = { ...input };
  if (input.title) {
    updates.slug = slugify(input.title);
  }
  if (input.published && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseFetch(`posts?id=eq.${postId}&select=*`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(updates),
  });

  if (error) {
    console.error('Error updating post:', error);
    return { data: null, error: { message: 'Failed to update post' } };
  }

  return { data: Array.isArray(data) ? data[0] : data, error: null };
}

/**
 * Delete a post
 */
export async function deletePost(postId) {
  const { error } = await supabaseFetch(`posts?id=eq.${postId}`, {
    method: 'DELETE',
  });

  if (error) {
    console.error('Error deleting post:', error);
    return { data: null, error: { message: 'Failed to delete post' } };
  }

  return { data: null, error: null };
}

/**
 * Get published post count
 */
export async function getPublishedPostCount() {
  const { data, error } = await supabaseFetch('posts?select=id&published=eq.true');

  if (error) {
    console.error('Error counting posts:', error);
    return { data: null, error: { message: 'Failed to count posts' } };
  }

  return { data: Array.isArray(data) ? data.length : 0, error: null };
}

/**
 * Get related posts
 */
export async function getRelatedPosts(postId, seriesId, currentSlug, limit = 4) {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  let url = `posts?select=id,slug,title,excerpt,cover_image_url,published_at,series_id&published=eq.true&slug=neq.${currentSlug}&limit=${limit}`;
  
  if (seriesId) {
    url += `&series_id=eq.${seriesId}&order=series_order.asc`;
  } else {
    url += '&order=published_at.desc';
  }

  const { data, error } = await supabaseFetch(url);

  if (error) {
    console.error('Error fetching related posts:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get posts from followed users
 */
export async function getFollowingPosts(userId, { limit = 10, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  // Get follows
  const { data: follows, error: followsError } = await supabaseFetch(
    `follows?select=following_id&follower_id=eq.${userId}`
  );

  if (followsError || !follows?.length) {
    return { data: [], error: followsError };
  }

  const followingIds = follows.map(f => f.following_id);

  // Get posts
  const { data, error } = await supabaseFetch(
    `posts?select=${POST_LIST_FIELDS}&published=eq.true&author_id=in.(${followingIds.join(',')})&order=published_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    console.error('Error fetching following posts:', error);
    return { data: [], error };
  }

  const postsWithAuthors = await attachAuthorsToPosts(data || []);
  return { data: postsWithAuthors, error: null };
}

/**
 * Get trending posts
 */
export async function getTrendingPosts({ limit = 10, offset = 0 } = {}) {
  return getPublishedPosts({ limit, offset });
}

/**
 * Get user statistics
 */
export async function getUserStats(userId) {
  if (!userId) {
    return { data: null, error: { message: 'User ID required' } };
  }

  if (!isSupabaseConfigured) {
    return {
      data: {
        totalPosts: 12,
        publishedPosts: 8,
        draftPosts: 4,
        totalViews: 1247,
        changes: { postsThisMonth: 3, viewsThisWeek: 142 }
      },
      error: null,
    };
  }

  try {
    // Get all posts
    const { data: posts, error } = await supabaseFetch(
      `posts?select=id,published,view_count,created_at&author_id=eq.${userId}`
    );

    if (error) {
      return { data: null, error };
    }

    const allPosts = posts || [];
    const published = allPosts.filter(p => p.published);
    const totalViews = allPosts.reduce((sum, p) => sum + (p.view_count || 0), 0);

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const postsThisMonth = allPosts.filter(p => new Date(p.created_at) >= oneMonthAgo).length;
    const viewsThisWeek = allPosts
      .filter(p => new Date(p.created_at) >= oneWeekAgo)
      .reduce((sum, p) => sum + (p.view_count || 0), 0);

    return {
      data: {
        totalPosts: allPosts.length,
        publishedPosts: published.length,
        draftPosts: allPosts.length - published.length,
        totalViews,
        changes: { postsThisMonth, viewsThisWeek }
      },
      error: null,
    };
  } catch (err) {
    console.error('Exception in getUserStats:', err);
    return { data: null, error: { message: 'Failed to fetch user stats' } };
  }
}

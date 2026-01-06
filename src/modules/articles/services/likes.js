/**
 * ============================================================================
 * LIKES SERVICE
 * ============================================================================
 * 
 * Data access layer for post likes.
 * Uses raw fetch to avoid Supabase client issues.
 */

import { supabaseFetch, getAuthToken } from '@/lib/supabase/fetch';

// Short-lived in-memory cache for like lookups to avoid duplicate requests during navigation
const LIKE_INFO_TTL_MS = 15_000;
const likeInfoCache = new Map();
const likeInfoInFlight = new Map();

function buildLikeCacheKey(postId, authorId) {
  return `${postId || 'none'}:${authorId || 'anon'}`;
}

function getCachedLikeInfo(key) {
  const cached = likeInfoCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    likeInfoCache.delete(key);
    return null;
  }
  return cached.payload;
}

function setCachedLikeInfo(key, payload) {
  likeInfoCache.set(key, { payload, expiresAt: Date.now() + LIKE_INFO_TTL_MS });
}

// Check if Supabase is configured
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock likes for development
const mockLikes = new Map([
  ['1', new Set(['author-1', 'author-2', 'author-3'])],
  ['2', new Set(['author-1'])],
]);

/**
 * Get like count for a post
 */
export async function getLikeCount(postId) {
  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId) || mockLikes.get('1') || new Set();
    return { count: likes.size, error: null };
  }

  const { data, error } = await supabaseFetch(
    `likes?select=id&post_id=eq.${postId}`,
    { headers: { 'Prefer': 'count=exact' } }
  );

  return { count: Array.isArray(data) ? data.length : 0, error };
}

/**
 * Check if a user has liked a post
 */
export async function hasUserLiked(postId, authorId) {
  if (!authorId) {
    return { liked: false, error: null };
  }

  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId) || mockLikes.get('1') || new Set();
    return { liked: likes.has(authorId), error: null };
  }

  const { data, error } = await supabaseFetch(
    `likes?select=id&post_id=eq.${postId}&author_id=eq.${authorId}&limit=1`
  );

  return { liked: Array.isArray(data) && data.length > 0, error };
}

/**
 * Get like info for a post (count + user's like status)
 */
export async function getPostLikeInfo(postId, authorId = null) {
  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId) || mockLikes.get('1') || new Set();
    return {
      count: likes.size,
      liked: authorId ? likes.has(authorId) : false,
      error: null
    };
  }

  const cacheKey = buildLikeCacheKey(postId, authorId);
  const cached = getCachedLikeInfo(cacheKey);
  if (cached) {
    return cached;
  }

  const inflight = likeInfoInFlight.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const requestPromise = (async () => {
    // Get count
    const { data: countData, error: countError } = await supabaseFetch(
      `likes?select=id&post_id=eq.${postId}`
    );

    if (countError) {
      return { count: 0, liked: false, error: countError };
    }

    const count = Array.isArray(countData) ? countData.length : 0;

    // Check if user liked
    let liked = false;
    if (authorId) {
      const { data } = await supabaseFetch(
        `likes?select=id&post_id=eq.${postId}&author_id=eq.${authorId}&limit=1`
      );
      liked = Array.isArray(data) && data.length > 0;
    }

    const result = { count, liked, error: null };
    setCachedLikeInfo(cacheKey, result);
    return result;
  })();

  likeInfoInFlight.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    likeInfoInFlight.delete(cacheKey);
  }
}

/**
 * Like a post
 */
export async function likePost(postId, authorId) {
  if (!authorId) {
    return { success: false, error: { message: 'User must be logged in' } };
  }

  if (!isSupabaseConfigured) {
    if (!mockLikes.has(postId)) {
      mockLikes.set(postId, new Set());
    }
    mockLikes.get(postId).add(authorId);
    return { success: true, error: null };
  }

  const { error } = await supabaseFetch('likes', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, author_id: authorId }),
  });

  // Ignore duplicate error (user already liked)
  if (error?.code === '23505') {
    return { success: true, error: null };
  }

  return { success: !error, error };
}

/**
 * Unlike a post
 */
export async function unlikePost(postId, authorId) {
  if (!authorId) {
    return { success: false, error: { message: 'User must be logged in' } };
  }

  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId);
    if (likes) {
      likes.delete(authorId);
    }
    return { success: true, error: null };
  }

  const { error } = await supabaseFetch(
    `likes?post_id=eq.${postId}&author_id=eq.${authorId}`,
    { method: 'DELETE' }
  );

  return { success: !error, error };
}

/**
 * Toggle like on a post
 */
export async function toggleLike(postId, authorId) {
  if (!authorId) {
    return { liked: false, error: { message: 'User must be logged in' } };
  }

  const { liked: currentlyLiked, error: checkError } = await hasUserLiked(postId, authorId);
  
  if (checkError) {
    return { liked: false, error: checkError };
  }

  if (currentlyLiked) {
    const { error } = await unlikePost(postId, authorId);
    return { liked: false, error };
  } else {
    const { error } = await likePost(postId, authorId);
    return { liked: true, error };
  }
}

/**
 * Get posts liked by a user
 */
export async function getLikedPostIds(authorId) {
  if (!authorId) {
    return { data: [], error: null };
  }

  if (!isSupabaseConfigured) {
    const likedPosts = [];
    mockLikes.forEach((authors, postId) => {
      if (authors.has(authorId)) {
        likedPosts.push(postId);
      }
    });
    return { data: likedPosts, error: null };
  }

  const { data, error } = await supabaseFetch(
    `likes?select=post_id&author_id=eq.${authorId}`
  );

  return { 
    data: (data || []).map(l => l.post_id), 
    error 
  };
}

/**
 * ============================================================================
 * LIKES SERVICE
 * ============================================================================
 * 
 * Data access layer for post likes.
 * Handles like/unlike operations and count retrieval.
 * 
 * ============================================================================
 */

import { supabase } from '@/lib/supabase/client';

// Check if Supabase is configured (has URL and key)
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock likes for development
const mockLikes = new Map([
  ['1', new Set(['author-1', 'author-2', 'author-3'])], // post 1 has 3 likes
  ['2', new Set(['author-1'])], // post 2 has 1 like
]);

/**
 * Get like count for a post
 * @param {string} postId - The post ID
 * @returns {Promise<{count: number, error: Object|null}>}
 */
export async function getLikeCount(postId) {
  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId) || mockLikes.get('1') || new Set();
    return { count: likes.size, error: null };
  }

  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return { count: count || 0, error };
}

/**
 * Check if a user has liked a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID
 * @returns {Promise<{liked: boolean, error: Object|null}>}
 */
export async function hasUserLiked(postId, authorId) {
  if (!authorId) {
    return { liked: false, error: null };
  }

  if (!isSupabaseConfigured) {
    const likes = mockLikes.get(postId) || mockLikes.get('1') || new Set();
    return { liked: likes.has(authorId), error: null };
  }

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('author_id', authorId)
    .maybeSingle();

  return { liked: !!data, error };
}

/**
 * Get like info for a post (count + user's like status)
 * @param {string} postId - The post ID
 * @param {string|null} userId - The user ID (null if not logged in)
 * @returns {Promise<{count: number, liked: boolean, error: Object|null}>}
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

  // Get count
  const { count, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) {
    return { count: 0, liked: false, error: countError };
  }

  // Check if user liked
  let liked = false;
  if (authorId) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('author_id', authorId)
      .maybeSingle();
    liked = !!data;
  }

  return { count: count || 0, liked, error: null };
}

/**
 * Like a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error: Object|null}>}
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

  const { error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      author_id: authorId,
    });

  // Ignore duplicate error (user already liked)
  if (error?.code === '23505') {
    return { success: true, error: null };
  }

  return { success: !error, error };
}

/**
 * Unlike a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error: Object|null}>}
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

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('author_id', authorId);

  return { success: !error, error };
}

/**
 * Toggle like on a post
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID
 * @returns {Promise<{liked: boolean, error: Object|null}>}
 */
export async function toggleLike(postId, authorId) {
  if (!authorId) {
    return { liked: false, error: { message: 'User must be logged in' } };
  }

  // Check current state
  const { liked: currentlyLiked, error: checkError } = await hasUserLiked(postId, authorId);
  
  if (checkError) {
    return { liked: false, error: checkError };
  }

  // Toggle
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
 * @param {string} userId - The user ID
 * @returns {Promise<{data: string[], error: Object|null}>}
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

  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .eq('author_id', authorId);

  return { 
    data: (data || []).map(l => l.post_id), 
    error 
  };
}

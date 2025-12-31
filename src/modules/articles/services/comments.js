/**
 * ============================================================================
 * COMMENTS SERVICE
 * ============================================================================
 * 
 * Data access layer for post comments.
 * Handles fetching, creating, updating, and deleting comments.
 * 
 * ============================================================================
 */

import { supabase } from '@/lib/supabase/client';

// Check if Supabase is configured (has URL and key)
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock comments for development
const mockComments = [
  {
    id: '1',
    post_id: '1',
    author_id: '1',
    content: 'Great article! This really helped me understand the concept better.',
    parent_id: null,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: '1',
      name: 'Jane Doe',
      avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
  },
  {
    id: '2',
    post_id: '1',
    author_id: '2',
    content: 'Thanks for the detailed explanation. Would love to see more content like this!',
    parent_id: null,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    author: {
      id: '2',
      name: 'John Smith',
      avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
  },
  {
    id: '3',
    post_id: '1',
    author_id: '3',
    content: 'I agree! The examples were very clear.',
    parent_id: '1',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    author: {
      id: '3',
      name: 'Alice Lee',
      avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
  },
];

/**
 * Fetch all comments for a post
 * @param {string} postId - The post ID
 * @returns {Promise<{data: Comment[], error: Object|null}>}
 */
export async function getCommentsByPostId(postId) {
  if (!isSupabaseConfigured) {
    // Filter mock comments for this post
    const comments = mockComments.filter(c => c.post_id === postId || c.post_id === '1');
    return { data: comments, error: null };
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      post_id,
      author_id,
      content,
      parent_id,
      created_at,
      updated_at,
      author:profiles!author_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Get comment count for a post
 * @param {string} postId - The post ID
 * @returns {Promise<{count: number, error: Object|null}>}
 */
export async function getCommentCount(postId) {
  if (!isSupabaseConfigured) {
    const count = mockComments.filter(c => c.post_id === postId || c.post_id === '1').length;
    return { count, error: null };
  }

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return { count: count || 0, error };
}

/**
 * Create a new comment
 * @param {Object} params
 * @param {string} params.postId - The post ID
 * @param {string} params.userId - The user ID
 * @param {string} params.content - The comment content
 * @param {string|null} params.parentId - Parent comment ID for replies
 * @returns {Promise<{data: Comment|null, error: Object|null}>}
 */
export async function createComment({ postId, authorId, content, parentId = null }) {
  if (!isSupabaseConfigured) {
    const newComment = {
      id: String(mockComments.length + 1),
      post_id: postId,
      author_id: authorId,
      content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: authorId,
        name: 'Current User',
        avatar_url: null,
      },
    };
    mockComments.push(newComment);
    return { data: newComment, error: null };
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      parent_id: parentId,
    })
    .select(`
      id,
      post_id,
      author_id,
      content,
      parent_id,
      created_at,
      updated_at,
      author:profiles!author_id (
        id,
        name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

/**
 * Update a comment
 * @param {string} commentId - The comment ID
 * @param {string} content - The new content
 * @returns {Promise<{data: Comment|null, error: Object|null}>}
 */
export async function updateComment(commentId, content) {
  if (!isSupabaseConfigured) {
    const comment = mockComments.find(c => c.id === commentId);
    if (comment) {
      comment.content = content;
      comment.updated_at = new Date().toISOString();
    }
    return { data: comment || null, error: null };
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .select(`
      id,
      post_id,
      author_id,
      content,
      parent_id,
      created_at,
      updated_at,
      author:profiles!author_id (
        id,
        name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

/**
 * Delete a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export async function deleteComment(commentId) {
  if (!isSupabaseConfigured) {
    const index = mockComments.findIndex(c => c.id === commentId);
    if (index > -1) {
      mockComments.splice(index, 1);
    }
    return { success: true, error: null };
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  return { success: !error, error };
}

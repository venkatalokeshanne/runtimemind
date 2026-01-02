/**
 * ============================================================================
 * COMMENTS SERVICE
 * ============================================================================
 * 
 * Data access layer for post comments.
 * Uses raw fetch to avoid Supabase client issues.
 */

import { supabaseFetch } from '@/lib/supabase/fetch';

// Check if Supabase is configured
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
    created_at: new Date(Date.now() - 86400000).toISOString(),
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
    created_at: new Date(Date.now() - 3600000).toISOString(),
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
    created_at: new Date(Date.now() - 1800000).toISOString(),
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
 */
export async function getCommentsByPostId(postId) {
  if (!isSupabaseConfigured) {
    const comments = mockComments.filter(c => c.post_id === postId || c.post_id === '1');
    return { data: comments, error: null };
  }

  try {
    // Get comments
    const { data: commentsData, error: commentsError } = await supabaseFetch(
      `comments?select=id,post_id,author_id,content,parent_id,created_at,updated_at&post_id=eq.${postId}&order=created_at.asc`
    );

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return { data: [], error: commentsError };
    }

    if (!commentsData?.length) {
      return { data: [], error: null };
    }

    // Get unique author IDs
    const authorIds = [...new Set(commentsData.map(c => c.author_id))];

    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabaseFetch(
      `profiles?select=id,name,avatar_url&id=in.(${authorIds.join(',')})`
    );

    if (profilesError) {
      console.error('Error fetching author profiles:', profilesError);
      return { 
        data: commentsData.map(c => ({ ...c, author: null })), 
        error: null 
      };
    }

    // Map profiles to comments
    const profilesMap = (profilesData || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    const commentsWithAuthors = commentsData.map(comment => ({
      ...comment,
      author: profilesMap[comment.author_id] || null
    }));

    return { data: commentsWithAuthors, error: null };

  } catch (err) {
    console.error('Exception in getCommentsByPostId:', err);
    return { data: [], error: { message: 'Failed to fetch comments' } };
  }
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId) {
  if (!isSupabaseConfigured) {
    const comments = mockComments.filter(c => c.post_id === postId || c.post_id === '1');
    return { count: comments.length, error: null };
  }

  const { data, error } = await supabaseFetch(
    `comments?select=id&post_id=eq.${postId}`
  );

  return { count: Array.isArray(data) ? data.length : 0, error };
}

/**
 * Create a new comment
 */
export async function createComment({ postId, authorId, content, parentId = null }) {
  if (!authorId) {
    return { data: null, error: { message: 'User must be logged in' } };
  }

  if (!isSupabaseConfigured) {
    const newComment = {
      id: String(Date.now()),
      post_id: postId,
      author_id: authorId,
      content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: { id: authorId, name: 'Current User', avatar_url: null },
    };
    mockComments.push(newComment);
    return { data: newComment, error: null };
  }

  const body = {
    post_id: postId,
    author_id: authorId,
    content,
  };
  if (parentId) {
    body.parent_id = parentId;
  }

  const { data, error } = await supabaseFetch('comments?select=*', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  });

  if (error) {
    console.error('Error creating comment:', error);
    return { data: null, error };
  }

  // Fetch author profile for the new comment
  const comment = Array.isArray(data) ? data[0] : data;
  if (comment) {
    const { data: profile } = await supabaseFetch(
      `profiles?select=id,name,avatar_url&id=eq.${authorId}&limit=1`
    );
    comment.author = Array.isArray(profile) ? profile[0] : null;
  }

  return { data: comment, error: null };
}

/**
 * Update a comment
 */
export async function updateComment(commentId, content, authorId) {
  if (!authorId) {
    return { data: null, error: { message: 'User must be logged in' } };
  }

  if (!isSupabaseConfigured) {
    const comment = mockComments.find(c => c.id === commentId);
    if (comment && comment.author_id === authorId) {
      comment.content = content;
      comment.updated_at = new Date().toISOString();
      return { data: comment, error: null };
    }
    return { data: null, error: { message: 'Comment not found or unauthorized' } };
  }

  const { data, error } = await supabaseFetch(
    `comments?id=eq.${commentId}&author_id=eq.${authorId}&select=*`,
    {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({ content }),
    }
  );

  return { data: Array.isArray(data) ? data[0] : data, error };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId, authorId) {
  if (!authorId) {
    return { success: false, error: { message: 'User must be logged in' } };
  }

  if (!isSupabaseConfigured) {
    const index = mockComments.findIndex(c => c.id === commentId && c.author_id === authorId);
    if (index !== -1) {
      mockComments.splice(index, 1);
      return { success: true, error: null };
    }
    return { success: false, error: { message: 'Comment not found or unauthorized' } };
  }

  const { error } = await supabaseFetch(
    `comments?id=eq.${commentId}&author_id=eq.${authorId}`,
    { method: 'DELETE' }
  );

  return { success: !error, error };
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(commentId) {
  if (!isSupabaseConfigured) {
    const comment = mockComments.find(c => c.id === commentId);
    return { data: comment || null, error: comment ? null : { message: 'Not found' } };
  }

  const { data, error } = await supabaseFetch(
    `comments?select=id,post_id,author_id,content,parent_id,created_at,updated_at&id=eq.${commentId}&limit=1`
  );

  const comment = Array.isArray(data) ? data[0] : null;

  if (comment) {
    // Fetch author profile
    const { data: profile } = await supabaseFetch(
      `profiles?select=id,name,avatar_url&id=eq.${comment.author_id}&limit=1`
    );
    comment.author = Array.isArray(profile) ? profile[0] : null;
  }

  return { data: comment, error };
}

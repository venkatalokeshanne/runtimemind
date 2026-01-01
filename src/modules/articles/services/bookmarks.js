/**
 * ============================================================================
 * BOOKMARKS SERVICE
 * ============================================================================
 * 
 * Handles user reading list / saved posts functionality.
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Get user's bookmarked posts
 */
export async function getUserBookmarks(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      post:posts!post_id (
        id,
        slug,
        title,
        excerpt,
        cover_image_url,
        published_at,
        author_id,
        read_time_minutes
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return { data: [], error };
  }

  // Fetch author info separately for each post
  if (data?.length) {
    const authorIds = [...new Set(data.map(b => b.post?.author_id).filter(Boolean))];
    
    if (authorIds.length) {
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', authorIds);
      
      const authorMap = (authors || []).reduce((acc, a) => {
        acc[a.id] = a;
        return acc;
      }, {});

      // Attach author to each post
      data.forEach(bookmark => {
        if (bookmark.post?.author_id) {
          bookmark.post.author = authorMap[bookmark.post.author_id] || null;
        }
      });
    }
  }

  return { data, error: null };
}

/**
 * Check if a post is bookmarked by user
 */
export async function isPostBookmarked(userId, postId) {
  if (!userId || !postId) {
    return false;
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }

  return !!data;
}

/**
 * Get bookmark status for multiple posts
 */
export async function getBookmarkStatuses(userId, postIds) {
  if (!userId || !postIds?.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (error) {
    console.error('Error fetching bookmark statuses:', error);
    return {};
  }

  // Return as a map: { postId: true, ... }
  return data.reduce((acc, { post_id }) => {
    acc[post_id] = true;
    return acc;
  }, {});
}

/**
 * Add a bookmark
 */
export async function addBookmark(userId, postId) {
  if (!userId || !postId) {
    return { data: null, error: { message: 'User ID and Post ID required' } };
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, post_id: postId })
    .select()
    .single();

  if (error) {
    // Handle duplicate bookmark gracefully
    if (error.code === '23505') {
      return { data: null, error: null }; // Already bookmarked, not an error
    }
    console.error('Error adding bookmark:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(userId, postId) {
  if (!userId || !postId) {
    return { error: { message: 'User ID and Post ID required' } };
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) {
    console.error('Error removing bookmark:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export async function toggleBookmark(userId, postId) {
  const isBookmarked = await isPostBookmarked(userId, postId);
  
  if (isBookmarked) {
    await removeBookmark(userId, postId);
    return { bookmarked: false };
  } else {
    await addBookmark(userId, postId);
    return { bookmarked: true };
  }
}

// ============================================================================
// SERIES BOOKMARKS
// ============================================================================

/**
 * Get user's bookmarked series
 */
export async function getUserSeriesBookmarks(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('series_bookmarks')
    .select(`
      id,
      created_at,
      series:series!series_id (
        id,
        slug,
        title,
        description,
        cover_image_url,
        author_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching series bookmarks:', error);
    return { data: [], error };
  }

  // Fetch author info separately
  if (data?.length) {
    const authorIds = [...new Set(data.map(b => b.series?.author_id).filter(Boolean))];
    
    if (authorIds.length) {
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', authorIds);
      
      const authorMap = (authors || []).reduce((acc, a) => {
        acc[a.id] = a;
        return acc;
      }, {});

      data.forEach(bookmark => {
        if (bookmark.series?.author_id) {
          bookmark.series.author = authorMap[bookmark.series.author_id] || null;
        }
      });
    }
  }

  return { data, error: null };
}

/**
 * Check if a series is bookmarked by user
 */
export async function isSeriesBookmarked(userId, seriesId) {
  if (!userId || !seriesId) {
    return false;
  }

  const { data, error } = await supabase
    .from('series_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('series_id', seriesId)
    .maybeSingle();

  if (error) {
    console.error('Error checking series bookmark:', error);
    return false;
  }

  return !!data;
}

/**
 * Get bookmark status for multiple series
 */
export async function getSeriesBookmarkStatuses(userId, seriesIds) {
  if (!userId || !seriesIds?.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('series_bookmarks')
    .select('series_id')
    .eq('user_id', userId)
    .in('series_id', seriesIds);

  if (error) {
    console.error('Error fetching series bookmark statuses:', error);
    return {};
  }

  return data.reduce((acc, { series_id }) => {
    acc[series_id] = true;
    return acc;
  }, {});
}

/**
 * Add a series bookmark
 */
export async function addSeriesBookmark(userId, seriesId) {
  if (!userId || !seriesId) {
    return { data: null, error: { message: 'User ID and Series ID required' } };
  }

  const { data, error } = await supabase
    .from('series_bookmarks')
    .insert({ user_id: userId, series_id: seriesId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: null }; // Already bookmarked
    }
    console.error('Error adding series bookmark:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Remove a series bookmark
 */
export async function removeSeriesBookmark(userId, seriesId) {
  if (!userId || !seriesId) {
    return { error: { message: 'User ID and Series ID required' } };
  }

  const { error } = await supabase
    .from('series_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('series_id', seriesId);

  if (error) {
    console.error('Error removing series bookmark:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Toggle series bookmark
 */
export async function toggleSeriesBookmark(userId, seriesId) {
  const isBookmarked = await isSeriesBookmarked(userId, seriesId);
  
  if (isBookmarked) {
    await removeSeriesBookmark(userId, seriesId);
    return { bookmarked: false };
  } else {
    await addSeriesBookmark(userId, seriesId);
    return { bookmarked: true };
  }
}

/**
 * ============================================================================
 * FOLLOWS SERVICE
 * ============================================================================
 * 
 * Handles user follow/unfollow functionality.
 * Uses raw fetch to avoid Supabase client issues.
 */

import { supabaseFetch } from '@/lib/supabase/fetch';

/**
 * Get users that a user is following
 */
export async function getFollowing(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabaseFetch(
    `follows?select=id,created_at,following_id&follower_id=eq.${userId}&order=created_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    console.error('Error fetching following:', error);
    return { data: [], error };
  }

  if (!data?.length) {
    return { data: [], error: null };
  }

  // Fetch profiles separately
  const userIds = data.map(f => f.following_id);
  const { data: profiles } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url&id=in.(${userIds.join(',')})`
  );

  const profileMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const result = data
    .map(f => profileMap[f.following_id])
    .filter(Boolean);

  return { data: result, error: null };
}

/**
 * Get users who follow a user
 */
export async function getFollowers(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabaseFetch(
    `follows?select=id,created_at,follower_id&following_id=eq.${userId}&order=created_at.desc&offset=${offset}&limit=${limit}`
  );

  if (error) {
    console.error('Error fetching followers:', error);
    return { data: [], error };
  }

  if (!data?.length) {
    return { data: [], error: null };
  }

  // Fetch profiles separately
  const userIds = data.map(f => f.follower_id);
  const { data: profiles } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url&id=in.(${userIds.join(',')})`
  );

  const profileMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const result = data
    .map(f => profileMap[f.follower_id])
    .filter(Boolean);

  return { data: result, error: null };
}

/**
 * Check if user A follows user B
 */
export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) {
    return false;
  }

  const { data, error } = await supabaseFetch(
    `follows?select=id&follower_id=eq.${followerId}&following_id=eq.${followingId}&limit=1`
  );

  if (error) {
    console.error('Error checking follow status:', error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

/**
 * Follow a user
 */
export async function followUser(followerId, followingId) {
  if (!followerId || !followingId) {
    return { error: { message: 'Both user IDs required' } };
  }

  if (followerId === followingId) {
    return { error: { message: 'Cannot follow yourself' } };
  }

  const { data, error } = await supabaseFetch('follows?select=*', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });

  if (error) {
    // Handle duplicate gracefully
    if (error.code === '23505') {
      return { data: null, error: null };
    }
    console.error('Error following user:', error);
    return { data: null, error };
  }

  return { data: Array.isArray(data) ? data[0] : data, error: null };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId, followingId) {
  if (!followerId || !followingId) {
    return { error: { message: 'Both user IDs required' } };
  }

  const { error } = await supabaseFetch(
    `follows?follower_id=eq.${followerId}&following_id=eq.${followingId}`,
    { method: 'DELETE' }
  );

  if (error) {
    console.error('Error unfollowing user:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Toggle follow status
 */
export async function toggleFollow(followerId, followingId) {
  const currentlyFollowing = await isFollowing(followerId, followingId);
  
  if (currentlyFollowing) {
    await unfollowUser(followerId, followingId);
    return { following: false };
  } else {
    await followUser(followerId, followingId);
    return { following: true };
  }
}

/**
 * Get follower count for a user
 */
export async function getFollowerCount(userId) {
  if (!userId) {
    return { count: 0, error: null };
  }

  const { data, error } = await supabaseFetch(
    `follows?select=id&following_id=eq.${userId}`
  );

  return { count: Array.isArray(data) ? data.length : 0, error };
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId) {
  if (!userId) {
    return { count: 0, error: null };
  }

  const { data, error } = await supabaseFetch(
    `follows?select=id&follower_id=eq.${userId}`
  );

  return { count: Array.isArray(data) ? data.length : 0, error };
}

/**
 * Get follow stats for a user
 */
export async function getFollowStats(userId) {
  if (!userId) {
    return { followers: 0, following: 0, error: null };
  }

  const [followersResult, followingResult] = await Promise.all([
    getFollowerCount(userId),
    getFollowingCount(userId),
  ]);

  return {
    followers: followersResult.count,
    following: followingResult.count,
    error: followersResult.error || followingResult.error,
  };
}

/**
 * Get follow statuses for multiple users (batch check)
 */
export async function getFollowStatuses(followerId, userIds) {
  if (!followerId || !userIds?.length) {
    return {};
  }

  const { data, error } = await supabaseFetch(
    `follows?select=following_id&follower_id=eq.${followerId}&following_id=in.(${userIds.join(',')})`
  );

  if (error) {
    console.error('Error fetching follow statuses:', error);
    return {};
  }

  return (data || []).reduce((acc, { following_id }) => {
    acc[following_id] = true;
    return acc;
  }, {});
}

/**
 * Get suggested users to follow
 */
export async function getSuggestedUsers(userId, { limit = 5 } = {}) {
  // Get profiles that the user isn't already following
  const { data: profiles, error } = await supabaseFetch(
    `profiles?select=id,name,bio,avatar_url&limit=${limit * 2}`
  );

  if (error) {
    console.error('Error fetching suggested users:', error);
    return { data: [], error };
  }

  let suggestions = profiles || [];
  
  // Filter out the current user
  if (userId) {
    suggestions = suggestions.filter(p => p.id !== userId);
    
    // Filter out already followed users
    if (suggestions.length > 0) {
      const statuses = await getFollowStatuses(userId, suggestions.map(p => p.id));
      suggestions = suggestions.filter(p => !statuses[p.id]);
    }
  }

  return { data: suggestions.slice(0, limit), error: null };
}

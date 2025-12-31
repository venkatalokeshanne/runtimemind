/**
 * ============================================================================
 * FOLLOWS SERVICE
 * ============================================================================
 * 
 * Handles user follow/unfollow functionality.
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Get users that a user is following
 */
export async function getFollowing(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      following_id
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching following:', error);
    return { data: [], error };
  }

  if (!data?.length) {
    return { data: [], error: null };
  }

  // Fetch profiles separately
  const userIds = data.map(f => f.following_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url')
    .in('id', userIds);

  // Return flattened user data
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

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      follower_id
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching followers:', error);
    return { data: [], error };
  }

  if (!data?.length) {
    return { data: [], error: null };
  }

  // Fetch profiles separately
  const userIds = data.map(f => f.follower_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url')
    .in('id', userIds);

  // Return flattened user data
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

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error);
  }

  return !!data;
}

/**
 * Get follow status for multiple users
 */
export async function getFollowStatuses(followerId, userIds) {
  if (!followerId || !userIds?.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', followerId)
    .in('following_id', userIds);

  if (error) {
    console.error('Error fetching follow statuses:', error);
    return {};
  }

  // Return as a map: { userId: true, ... }
  return data.reduce((acc, { following_id }) => {
    acc[following_id] = true;
    return acc;
  }, {});
}

/**
 * Follow a user
 */
export async function followUser(followerId, followingId) {
  if (!followerId || !followingId) {
    return { data: null, error: { message: 'Follower ID and Following ID required' } };
  }

  if (followerId === followingId) {
    return { data: null, error: { message: 'Cannot follow yourself' } };
  }

  const { data, error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();

  if (error) {
    // Handle already following gracefully
    if (error.code === '23505') {
      return { data: null, error: null };
    }
    console.error('Error following user:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId, followingId) {
  if (!followerId || !followingId) {
    return { error: { message: 'Follower ID and Following ID required' } };
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Toggle follow (follow if not following, unfollow if following)
 */
export async function toggleFollow(followerId, followingId) {
  const following = await isFollowing(followerId, followingId);
  
  if (following) {
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
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting follower count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId) {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    console.error('Error getting following count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get suggested users to follow (users who have posts, excluding already following)
 */
export async function getSuggestedUsers(userId, { limit = 5 } = {}) {
  if (!userId) {
    return { data: [], error: null };
  }

  // Get users the current user is already following
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map(f => f.following_id) || [];
  followingIds.push(userId); // Exclude self

  // Get users with published posts, excluding already following
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      bio,
      avatar_url
    `)
    .not('id', 'in', `(${followingIds.join(',')})`)
    .limit(limit);

  if (error) {
    console.error('Error fetching suggested users:', error);
    return { data: [], error };
  }

  return { data, error: null };
}

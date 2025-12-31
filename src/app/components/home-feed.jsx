'use client';

/**
 * ============================================================================
 * HOME FEED - Logged-in User Experience (Medium-style)
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Clock, Bookmark, MoreHorizontal, TrendingUp, Sparkles, Users, Feather, Check } from 'lucide-react';
import { Button } from '@/ui/button';
import { 
  toggleBookmark, 
  getBookmarkStatuses,
  getUserBookmarks,
  toggleFollow,
  getFollowStatuses,
  getSuggestedUsers,
  getFollowingPosts,
  getTrendingPosts,
} from '@/modules/blog/services';

/**
 * Feed tabs for filtering content
 */
const FEED_TABS = [
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

/**
 * Post Card - Medium-style article card
 */
function PostCard({ post, featured = false, userId, isBookmarked, onToggleBookmark }) {
  const [saving, setSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!userId || saving) return;
    
    setSaving(true);
    try {
      await onToggleBookmark(post.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={`group py-6 ${featured ? '' : 'border-b border-border'}`}>
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-xs font-medium text-accent">
                  {post.author?.name?.[0] || 'A'}
                </span>
              </div>
            )}
            <Link 
              href={`/blog?author=${post.author?.id}`}
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              {post.author?.name || 'Anonymous'}
            </Link>
            {post.series && (
              <>
                <span className="text-text-muted">in</span>
                <Link 
                  href={`/blog/series/${post.series.slug}`}
                  className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
                >
                  {post.series.title}
                </Link>
              </>
            )}
          </div>

          {/* Title & Excerpt */}
          <Link href={`/blog/${post.slug}`} className="block group/link">
            <h2 className={`font-bold text-text-primary group-hover/link:text-accent transition-colors mb-2 line-clamp-2 ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-text-secondary line-clamp-2 text-sm mb-3">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>
                {post.published_at 
                  ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Draft'
                }
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                5 min read
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBookmark}
                disabled={saving}
                className={`p-1.5 rounded-full transition-colors ${isBookmarked ? 'text-accent' : 'text-text-muted hover:text-text-secondary'} ${saving ? 'opacity-50' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-1.5 rounded-full text-text-muted hover:text-text-secondary transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.cover_image_url && (
          <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
            <div className={`relative overflow-hidden rounded-lg ${featured ? 'w-40 h-40 md:w-52 md:h-40' : 'w-28 h-28 md:w-36 md:h-28'}`}>
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * Follow Button Component
 */
function FollowButton({ userId, targetUserId, isFollowing: initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleToggle = async () => {
    if (!userId || loading) return;
    
    setLoading(true);
    try {
      const result = await toggleFollow(userId, targetUserId);
      setFollowing(result.following);
      if (onToggle) onToggle(targetUserId, result.following);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={following ? 'ghost' : 'outline'} 
      size="sm" 
      className={`rounded-full text-xs ${following ? 'text-accent' : ''}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : following ? <><Check className="w-3 h-3 mr-1" /> Following</> : 'Follow'}
    </Button>
  );
}

/**
 * Sidebar - Trending & Recommendations
 */
function Sidebar({ tags, series, userId, suggestedUsers, followStatuses, onToggleFollow, userBookmarks }) {
  return (
    <aside className="space-y-8">
      {/* Staff Picks */}
      <div>
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Staff Picks
        </h3>
        <div className="space-y-4">
          {series?.slice(0, 2).map((s) => (
            <Link 
              key={s.id}
              href={`/blog/series/${s.slug}`}
              className="block group"
            >
              <div className="flex items-center gap-2 mb-1">
                {s.author?.avatar_url && (
                  <Image
                    src={s.author.avatar_url}
                    alt={s.author.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="text-xs text-text-muted">{s.author?.name}</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                {s.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      {tags && tags.length > 0 && (
        <div>
          <h3 className="font-bold text-text-primary mb-4">Recommended topics</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 7).map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog/tag/${tag.slug}`}
                className="px-3 py-1.5 rounded-full bg-surface-inset text-text-secondary text-sm hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Who to follow */}
      {suggestedUsers && suggestedUsers.length > 0 && (
        <div>
          <h3 className="font-bold text-text-primary mb-4">Who to follow</h3>
          <div className="space-y-4">
            {suggestedUsers.map((writer) => (
              <div key={writer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {writer.avatar_url ? (
                    <Image
                      src={writer.avatar_url}
                      alt={writer.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Feather className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{writer.name}</p>
                    <p className="text-xs text-text-muted line-clamp-1">{writer.bio || 'Writer'}</p>
                  </div>
                </div>
                <FollowButton 
                  userId={userId}
                  targetUserId={writer.id}
                  isFollowing={followStatuses[writer.id] || false}
                  onToggle={onToggleFollow}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading list */}
      <div className="p-4 rounded-xl bg-surface-inset border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            Reading list
          </h3>
          {userBookmarks?.length > 0 && (
            <Link href="/dashboard/bookmarks" className="text-xs text-accent hover:underline">
              See all
            </Link>
          )}
        </div>
        {userBookmarks?.length > 0 ? (
          <div className="space-y-3">
            {userBookmarks.slice(0, 3).map((bookmark) => (
              <Link 
                key={bookmark.id} 
                href={`/blog/${bookmark.post?.slug}`}
                className="block group"
              >
                <h4 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {bookmark.post?.title}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {bookmark.post?.author?.name || 'Anonymous'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Click the <Bookmark className="w-3 h-3 inline" /> on any story to save it.
          </p>
        )}
      </div>

      {/* Footer links */}
      <div className="text-xs text-text-muted space-x-3">
        <Link href="/about" className="hover:text-text-secondary">About</Link>
        <Link href="/help" className="hover:text-text-secondary">Help</Link>
        <Link href="/terms" className="hover:text-text-secondary">Terms</Link>
        <Link href="/privacy" className="hover:text-text-secondary">Privacy</Link>
      </div>
    </aside>
  );
}

/**
 * Main Home Feed Component
 */
export function HomeFeed({ posts: initialPosts, tags, series }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Bookmark states
  const [bookmarkStatuses, setBookmarkStatuses] = useState({});
  const [userBookmarks, setUserBookmarks] = useState([]);
  
  // Follow states
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followStatuses, setFollowStatuses] = useState({});

  // Load bookmark and follow statuses on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadStatuses = async () => {
      // Load bookmark statuses for current posts
      if (posts?.length) {
        const postIds = posts.map(p => p.id);
        const statuses = await getBookmarkStatuses(user.id, postIds);
        setBookmarkStatuses(statuses);
      }

      // Load user's bookmarks for sidebar
      const { data: bookmarks } = await getUserBookmarks(user.id, { limit: 5 });
      setUserBookmarks(bookmarks || []);

      // Load suggested users
      const { data: suggested } = await getSuggestedUsers(user.id, { limit: 5 });
      setSuggestedUsers(suggested || []);

      // Load follow statuses for suggested users
      if (suggested?.length) {
        const userIds = suggested.map(u => u.id);
        const fStatuses = await getFollowStatuses(user.id, userIds);
        setFollowStatuses(fStatuses);
      }
    };

    loadStatuses();
  }, [user?.id, posts]);

  // Handle tab change
  const handleTabChange = useCallback(async (tabId) => {
    if (tabId === activeTab) return;
    
    setActiveTab(tabId);
    setLoading(true);
    setOffset(0);
    
    try {
      let newPosts;
      
      if (tabId === 'following') {
        const { data } = await getFollowingPosts(user?.id, { limit: 10, offset: 0 });
        newPosts = data || [];
      } else if (tabId === 'trending') {
        const { data } = await getTrendingPosts({ limit: 10, offset: 0 });
        newPosts = data || [];
      } else {
        // For You = initial posts
        newPosts = initialPosts || [];
      }
      
      setPosts(newPosts);
      setHasMore(newPosts.length >= 10);
      
      // Update bookmark statuses for new posts
      if (user?.id && newPosts.length) {
        const postIds = newPosts.map(p => p.id);
        const statuses = await getBookmarkStatuses(user.id, postIds);
        setBookmarkStatuses(statuses);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id, initialPosts]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const newOffset = offset + 10;
    
    try {
      let newPosts;
      
      if (activeTab === 'following') {
        const { data } = await getFollowingPosts(user?.id, { limit: 10, offset: newOffset });
        newPosts = data || [];
      } else if (activeTab === 'trending') {
        const { data } = await getTrendingPosts({ limit: 10, offset: newOffset });
        newPosts = data || [];
      } else {
        // For You - would need a getForYouPosts function, for now use published posts
        const { data } = await getTrendingPosts({ limit: 10, offset: newOffset });
        newPosts = data || [];
      }
      
      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(newOffset);
        
        // Update bookmark statuses
        if (user?.id) {
          const postIds = newPosts.map(p => p.id);
          const statuses = await getBookmarkStatuses(user.id, postIds);
          setBookmarkStatuses(prev => ({ ...prev, ...statuses }));
        }
      }
      
      setHasMore(newPosts.length >= 10);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, activeTab, user?.id]);

  // Toggle bookmark handler
  const handleToggleBookmark = useCallback(async (postId) => {
    if (!user?.id) return;
    
    const result = await toggleBookmark(user.id, postId);
    setBookmarkStatuses(prev => ({
      ...prev,
      [postId]: result.bookmarked
    }));

    // Refresh the sidebar bookmarks list
    const { data: bookmarks } = await getUserBookmarks(user.id, { limit: 5 });
    setUserBookmarks(bookmarks || []);
  }, [user?.id]);

  // Toggle follow handler
  const handleToggleFollow = useCallback((targetUserId, isFollowing) => {
    setFollowStatuses(prev => ({
      ...prev,
      [targetUserId]: isFollowing
    }));
  }, []);

  if (!user) return null;

  const featuredPost = posts?.[0];
  const feedPosts = posts?.slice(1) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center gap-12 lg:gap-16">
          {/* Main Feed */}
          <main className="w-full max-w-2xl">
            {/* Feed Tabs */}
            <div className="flex items-center gap-8 border-b border-border mb-6 sticky top-0 bg-background z-10 py-2">
              {FEED_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id 
                      ? 'text-text-primary' 
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && posts.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-muted">Loading posts...</p>
              </div>
            )}

            {/* Empty State for Following */}
            {!loading && posts.length === 0 && activeTab === 'following' && (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">No posts from people you follow</h3>
                <p className="text-text-muted mb-4">Start following writers to see their posts here.</p>
                <Button onClick={() => handleTabChange('for-you')}>
                  Explore posts
                </Button>
              </div>
            )}

            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-4 pb-6 border-b border-border">
                <PostCard 
                  post={featuredPost} 
                  featured 
                  userId={user?.id}
                  isBookmarked={bookmarkStatuses[featuredPost.id]}
                  onToggleBookmark={handleToggleBookmark}
                />
              </div>
            )}

            {/* Feed Posts */}
            <div className="divide-y divide-border">
              {feedPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  userId={user?.id}
                  isBookmarked={bookmarkStatuses[post.id]}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && posts.length > 0 && (
              <div className="py-8 text-center">
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load more'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <Sidebar 
                tags={tags} 
                series={series}
                userId={user?.id}
                suggestedUsers={suggestedUsers}
                followStatuses={followStatuses}
                onToggleFollow={handleToggleFollow}
                userBookmarks={userBookmarks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

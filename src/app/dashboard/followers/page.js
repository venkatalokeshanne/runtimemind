'use client';

/**
 * ============================================================================
 * FOLLOWERS PAGE - View followers and following
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, Feather, Check } from 'lucide-react';
import { Button } from '@/ui/button';
import { 
  getFollowers, 
  getFollowing, 
  toggleFollow,
  getFollowerCount,
  getFollowingCount,
} from '@/modules/articles/services';

/**
 * User Card Component
 */
function UserCard({ user, currentUserId, isFollowing: initialFollowing, showFollowButton = true, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!currentUserId || loading || user.id === currentUserId) return;
    
    setLoading(true);
    try {
      const result = await toggleFollow(currentUserId, user.id);
      setFollowing(result.following);
      if (onToggle) onToggle(user.id, result.following);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <Link href={`/articles?author=${user.id}`} className="flex items-center gap-3 group">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Feather className="w-5 h-5 text-accent" />
          </div>
        )}
        <div>
          <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
            {user.name}
          </p>
          <p className="text-sm text-text-muted line-clamp-1">
            {user.bio || 'Writer'}
          </p>
        </div>
      </Link>
      
      {showFollowButton && user.id !== currentUserId && (
        <Button 
          variant={following ? 'ghost' : 'outline'} 
          size="sm" 
          className={`rounded-full ${following ? 'text-accent' : ''}`}
          onClick={handleToggle}
          disabled={loading}
        >
          {loading ? '...' : following ? (
            <><Check className="w-4 h-4 mr-1" /> Following</>
          ) : (
            <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Main Followers Page
 */
export default function FollowersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followingStatuses, setFollowingStatuses] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load data
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setLoading(true);
      
      // Get counts
      const fCount = await getFollowerCount(user.id);
      const fgCount = await getFollowingCount(user.id);
      setFollowerCount(fCount);
      setFollowingCount(fgCount);

      // Get followers
      const { data: followersList } = await getFollowers(user.id);
      setFollowers(followersList || []);

      // Get following
      const { data: followingList } = await getFollowing(user.id);
      setFollowing(followingList || []);

      // Build a map of who the user is following (for follow-back buttons)
      const followingMap = (followingList || []).reduce((acc, f) => {
        acc[f.id] = true;
        return acc;
      }, {});
      setFollowingStatuses(followingMap);

      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  // Handle follow toggle
  const handleToggle = useCallback((targetUserId, isFollowing) => {
    setFollowingStatuses(prev => ({
      ...prev,
      [targetUserId]: isFollowing
    }));
    
    // Update counts
    setFollowingCount(prev => isFollowing ? prev + 1 : prev - 1);
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayList = activeTab === 'followers' ? followers : following;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              Connections
            </h1>
            <p className="text-text-muted text-sm">
              {followerCount} followers · {followingCount} following
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('followers')}
            className={`pb-3 text-sm font-medium relative transition-colors ${
              activeTab === 'followers' 
                ? 'text-text-primary' 
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Followers ({followerCount})
            {activeTab === 'followers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`pb-3 text-sm font-medium relative transition-colors ${
              activeTab === 'following' 
                ? 'text-text-primary' 
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Following ({followingCount})
            {activeTab === 'following' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* Empty State */}
        {displayList.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'}
            </h2>
            <p className="text-text-muted mb-6">
              {activeTab === 'followers' 
                ? 'Share your posts to get more followers!'
                : 'Discover writers to follow on the homepage.'}
            </p>
            <Button onClick={() => router.push('/')}>
              Explore writers
            </Button>
          </div>
        )}

        {/* User List */}
        <div>
          {displayList.map((person) => (
            <UserCard 
              key={person.id} 
              user={person}
              currentUserId={user.id}
              isFollowing={followingStatuses[person.id] || false}
              showFollowButton={activeTab === 'followers'}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

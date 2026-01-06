'use client';

/**
 * ============================================================================
 * LIKE BUTTON COMPONENT
 * ============================================================================
 * 
 * A button to like/unlike posts with animated feedback.
 * Shows login prompt for unauthenticated users.
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { toggleLike, getPostLikeInfo } from '@/modules/articles/services';

/**
 * Format large numbers (1000 -> 1k)
 */
function formatCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toString();
}

/**
 * Like button component
 */
export function LikeButton({ 
  postId, 
  initialCount = 0, 
  initialLiked = false,
  size = 'default', // 'small' | 'default' | 'large'
  showCount = true,
  className = '',
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch initial like status for authenticated users; unauthenticated viewers use
  // the server-provided counts to avoid an extra network call on page load.
  useEffect(() => {
    async function fetchLikeInfo() {
      const { count: likeCount, liked: userLiked, error } = await getPostLikeInfo(postId, user?.id);
      if (!error) {
        setCount(likeCount);
        setLiked(userLiked);
      }
    }

    if (postId && user?.id) {
      fetchLikeInfo();
    }
  }, [postId, user?.id]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Show login hint briefly
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 2000);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    setLiked(!liked);
    setCount(prev => liked ? prev - 1 : prev + 1);
    setIsLoading(true);

    const { liked: newLiked, error } = await toggleLike(postId, user.id);
    
    if (error) {
      // Revert on error
      setLiked(liked);
      setCount(count);
    } else {
      setLiked(newLiked);
    }
    
    setIsLoading(false);
  };

  // Size classes
  const sizeClasses = {
    small: {
      button: 'gap-1 text-xs',
      icon: 'w-3.5 h-3.5',
    },
    default: {
      button: 'gap-1.5 text-sm',
      icon: 'w-4 h-4',
    },
    large: {
      button: 'gap-2 text-base',
      icon: 'w-5 h-5',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          inline-flex items-center ${sizes.button} transition-colors
          ${liked 
            ? 'text-red-500' 
            : 'text-text-muted hover:text-red-500'
          }
          ${isLoading ? 'opacity-70' : ''}
          ${className}
        `}
        whileTap={{ scale: 0.95 }}
        title={mounted ? (user ? (liked ? 'Unlike' : 'Like') : 'Sign in to like') : 'Like'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={liked ? 'filled' : 'outline'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Heart 
              className={sizes.icon}
              fill={liked ? 'currentColor' : 'none'}
            />
          </motion.div>
        </AnimatePresence>
        
        {showCount && (
          <span className="min-w-[1ch]">{formatCount(count)}</span>
        )}
      </motion.button>

      {/* Login hint tooltip */}
      <AnimatePresence>
        {showLoginHint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface-inset border border-border rounded-lg text-xs text-text-primary whitespace-nowrap shadow-lg z-10"
          >
            <a href="/login" className="text-accent hover:underline">Sign in</a> to like posts
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-inset border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact like indicator (for cards)
 */
export function LikeIndicator({ count = 0, liked = false, className = '' }) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1 text-xs
        ${liked ? 'text-red-500' : 'text-text-muted'}
        ${className}
      `}
    >
      <Heart 
        className="w-3.5 h-3.5"
        fill={liked ? 'currentColor' : 'none'}
      />
      {formatCount(count)}
    </span>
  );
}

export default LikeButton;

/**
 * ============================================================================
 * VIEW TRACKER COMPONENT
 * ============================================================================
 * 
 * Client component that tracks article views.
 * Increments view count once per session to avoid duplicate counting.
 * 
 * ============================================================================
 */

'use client';

import { useEffect, useRef } from 'react';
import { incrementViewCount } from '@/modules/articles/services/posts';

/**
 * ViewTracker Component
 * 
 * Tracks a view for the given post ID.
 * Uses sessionStorage to prevent counting multiple views in the same session.
 * 
 * @param {Object} props
 * @param {string} props.postId - The post ID to track
 */
export function ViewTracker({ postId }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!postId || hasTracked.current) return;

    // Check if this post was already viewed in this session
    const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
    
    if (viewedPosts.includes(postId)) {
      return;
    }

    // Mark as tracked to prevent duplicate calls
    hasTracked.current = true;

    // Increment view count
    incrementViewCount(postId).then(() => {
      // Add to viewed posts in session
      viewedPosts.push(postId);
      sessionStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
    }).catch((err) => {
      console.error('Failed to track view:', err);
      hasTracked.current = false; // Allow retry on error
    });
  }, [postId]);

  // This component renders nothing
  return null;
}

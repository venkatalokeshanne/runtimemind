/**
 * ============================================================================
 * POST LIST COMPONENT
 * ============================================================================
 * 
 * Renders a grid of post cards.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. RESPONSIVE GRID:
 *    1 column on mobile, 2 on tablet, 3 on desktop.
 *    Uses CSS Grid, not Flexbox, for predictable sizing.
 * 
 * 2. STAGGERED ANIMATION:
 *    Posts fade in sequentially using Framer Motion.
 *    Creates visual flow without being distracting.
 * 
 * 3. EMPTY STATE:
 *    Handles no-posts gracefully with helpful message.
 * 
 * ============================================================================
 */

'use client';

import { motion } from 'framer-motion';
import { PostCard } from './post-card';

/**
 * Animation variants for the container.
 * Staggered children create a cascade effect.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Stagger delay between each child
      staggerChildren: 0.1,
    },
  },
};

/**
 * Animation variants for each post card.
 */
const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * PostList Component
 * 
 * @param {Object} props
 * @param {Array} props.posts - Array of post objects
 */
export function PostList({ posts }) {
  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">
          No posts yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
    >
      {posts.map((post) => (
        <motion.div 
          key={post.id} 
          variants={itemVariants}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
}

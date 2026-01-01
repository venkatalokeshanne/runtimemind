/**
 * ============================================================================
 * STATS CARD COMPONENT
 * ============================================================================
 * 
 * Individual stat card component with loading states and animations.
 * 
 * ============================================================================
 */

import { motion } from 'framer-motion';

export function StatsCard({ stat, index, loading }) {
  const Icon = stat.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface border border-border rounded-[var(--radius-lg)] p-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <p className="text-sm text-text-muted">{stat.label}</p>
          <p className="text-2xl font-bold text-text-primary">
            {loading ? (
              <span className="inline-block w-16 h-8 bg-border rounded animate-pulse" />
            ) : (
              stat.value
            )}
          </p>
        </div>
      </div>
      <p className="text-xs text-text-muted mt-4">
        {loading ? (
          <span className="inline-block w-20 h-3 bg-border rounded animate-pulse" />
        ) : (
          stat.change
        )}
      </p>
    </motion.div>
  );
}
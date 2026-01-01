/**
 * ============================================================================
 * STATS GRID COMPONENT
 * ============================================================================
 * 
 * Grid of stats cards with loading states.
 * 
 * ============================================================================
 */

import { StatsCard } from './StatsCard';

export function StatsGrid({ stats, loading }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <StatsCard 
          key={stat.label} 
          stat={stat} 
          index={index} 
          loading={loading} 
        />
      ))}
    </div>
  );
}
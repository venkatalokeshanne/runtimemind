/**
 * ============================================================================
 * QUICK ACTIONS COMPONENT
 * ============================================================================
 * 
 * Grid of quick action links for common dashboard tasks.
 * 
 * ============================================================================
 */

import { PenSquare, FileText, Layers, Bookmark, Users } from 'lucide-react';
import { QuickActionItem } from './QuickActionItem';

const QUICK_ACTIONS = [
  {
    href: '/dashboard/new',
    icon: PenSquare,
    title: 'Write a new post',
    description: 'Share your thoughts with the world'
  },
  {
    href: '/dashboard/posts',
    icon: FileText,
    title: 'Manage posts',
    description: 'View and edit your blog posts'
  },
  {
    href: '/dashboard/series',
    icon: Layers,
    title: 'Manage series',
    description: 'Create and organize multi-part tutorials'
  },
  {
    href: '/dashboard/bookmarks',
    icon: Bookmark,
    title: 'Reading list',
    description: 'View your saved articles'
  },
  {
    href: '/dashboard/followers',
    icon: Users,
    title: 'Followers',
    description: 'Manage your connections'
  }
];

export function QuickActions() {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionItem key={action.href} {...action} />
        ))}
      </div>
    </div>
  );
}
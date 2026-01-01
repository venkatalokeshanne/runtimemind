/**
 * ============================================================================
 * QUICK ACTION ITEM COMPONENT
 * ============================================================================
 * 
 * Individual quick action link component.
 * 
 * ============================================================================
 */

import Link from 'next/link';

export function QuickActionItem({ href, icon: Icon, title, description }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </Link>
  );
}
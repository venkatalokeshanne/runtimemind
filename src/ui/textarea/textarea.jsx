/**
 * ============================================================================
 * TEXTAREA COMPONENT
 * ============================================================================
 * 
 * Multi-line text input for blog content, bios, etc.
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-[var(--radius-md)]',
        'border border-border bg-background',
        'px-4 py-3 text-base text-text-primary',
        'placeholder:text-text-muted',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-y',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };

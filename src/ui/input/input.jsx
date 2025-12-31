/**
 * ============================================================================
 * INPUT COMPONENT
 * ============================================================================
 * 
 * Reusable text input with consistent styling.
 * Supports all standard input types.
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(function Input(
  { className, type = 'text', ...props },
  ref
) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[var(--radius-md)]',
        'border border-border bg-surface',
        'px-4 py-2 text-base text-text-primary',
        'placeholder:text-text-muted',
        'transition-colors duration-150',
        'shadow-sm',
        'hover:border-border-strong',
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };

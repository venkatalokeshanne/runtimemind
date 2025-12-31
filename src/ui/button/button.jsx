/**
 * ============================================================================
 * BUTTON COMPONENT
 * ============================================================================
 * 
 * A versatile button component following shadcn/ui patterns.
 * 
 * DESIGN PRINCIPLES:
 * 
 * 1. SINGLE RESPONSIBILITY:
 *    This component handles only button styling and behavior.
 *    Business logic lives in parent components.
 * 
 * 2. COMPOSITION OVER INHERITANCE:
 *    Uses the Slot pattern to allow rendering as different elements.
 *    <Button asChild><Link href="/foo">Click</Link></Button>
 * 
 * 3. VARIANTS WITH CLASS-VARIANCE-AUTHORITY:
 *    CVA provides type-safe, composable variant definitions.
 *    Easier to maintain than long conditional class strings.
 * 
 * 4. ACCESSIBLE BY DEFAULT:
 *    Proper focus states, disabled handling, and semantic HTML.
 * 
 * ============================================================================
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variant definitions using CVA.
 * 
 * WHY CVA:
 * - Single source of truth for all variants
 * - Composable (variant + size combinations)
 * - Easy to extend without touching component logic
 * - Works great with Tailwind's autocomplete
 */
const buttonVariants = cva(
  // Base styles applied to ALL buttons
  [
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-accent focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    // Prevent text selection on double-click
    'select-none',
  ],
  {
    variants: {
      /**
       * VARIANT: Visual style
       * 
       * - default: Primary action (one per section)
       * - secondary: Alternative actions
       * - outline: Less prominent actions
       * - ghost: Minimal actions (navigation, toggles)
       * - link: Inline text actions
       */
      variant: {
        default: [
          'bg-accent text-white',
          'hover:bg-accent-hover',
          'shadow-sm',
        ],
        secondary: [
          'bg-surface text-text-primary',
          'border border-border',
          'shadow-sm',
          'hover:bg-hover hover:border-border-strong',
        ],
        outline: [
          'border border-border-strong',
          'bg-transparent text-text-primary',
          'hover:bg-hover hover:border-border-strong',
        ],
        ghost: [
          'bg-transparent text-text-primary',
          'hover:bg-hover',
        ],
        link: [
          'bg-transparent text-accent',
          'underline-offset-4 hover:underline',
          'p-0 h-auto',
        ],
        destructive: [
          'bg-error text-white',
          'hover:bg-error/90',
          'shadow-sm',
        ],
      },
      
      /**
       * SIZE: Button dimensions
       * 
       * Following an 8px grid for consistent spacing.
       * Heights: 32px (sm), 40px (default), 48px (lg)
       */
      size: {
        sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
        default: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-md)]',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
      },
    },
    
    // Default variants if not specified
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Button Component
 * 
 * @param {object} props
 * @param {'default'|'secondary'|'outline'|'ghost'|'link'} props.variant - Visual style
 * @param {'sm'|'default'|'lg'|'icon'} props.size - Button size
 * @param {boolean} props.asChild - Render as child element (for Link, etc.)
 * @param {string} props.className - Additional classes
 * @param {React.Ref} ref - Forwarded ref
 */
const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  // Slot allows this button to render as its child element
  // Useful for wrapping Next.js Link or other components
  const Comp = asChild ? Slot : 'button';
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };

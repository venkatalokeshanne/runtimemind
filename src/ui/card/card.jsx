/**
 * ============================================================================
 * CARD COMPONENT
 * ============================================================================
 * 
 * Composable card components for containing content.
 * 
 * COMPOSITION PATTERN:
 * Cards are built from multiple sub-components:
 * - Card (container)
 * - CardHeader (optional header area)
 * - CardTitle (heading)
 * - CardDescription (subtitle)
 * - CardContent (main content)
 * - CardFooter (actions area)
 * 
 * This pattern allows flexible composition:
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Container
 * 
 * WHY THESE STYLES:
 * - bg-surface: Pure white in light mode for contrast against page bg
 * - border: Clear boundary 
 * - shadow: Subtle elevation for depth
 * - rounded-lg: Soft but not playful
 */
const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-surface',
        'border border-border',
        'rounded-[var(--radius-lg)]',
        'shadow-sm',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

/**
 * Card Header
 * Contains title and description with proper spacing.
 */
const CardHeader = React.forwardRef(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

/**
 * Card Title
 * Semantic heading (h3 by default) for accessibility.
 */
const CardTitle = React.forwardRef(function CardTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-tight tracking-tight',
        'text-text-primary',
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

/**
 * Card Description
 * Secondary text below the title.
 */
const CardDescription = React.forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

/**
 * Card Content
 * Main content area with horizontal padding.
 * Vertical padding removed from top to flow from header.
 */
const CardContent = React.forwardRef(function CardContent(
  { className, ...props },
  ref
) {
  return (
    <div 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props} 
    />
  );
});
CardContent.displayName = 'CardContent';

/**
 * Card Footer
 * Actions area with flex layout for buttons.
 */
const CardFooter = React.forwardRef(function CardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

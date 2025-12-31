/**
 * ============================================================================
 * LABEL COMPONENT
 * ============================================================================
 * 
 * Form label with consistent styling.
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef(function Label(
  { className, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-text-primary',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export { Label };

import { cn } from '@/lib/utils';

export function Container({ children, className, size = 'default' }) {
  const sizes = {
    default: 'max-w-7xl',
    sm: 'max-w-5xl',
    lg: 'max-w-screen-2xl',
    prose: 'max-w-6xl',
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className)}>
      {children}
    </div>
  );
}

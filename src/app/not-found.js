/**
 * ============================================================================
 * NOT FOUND PAGE (404)
 * ============================================================================
 * 
 * Custom 404 page for when content is not found.
 * 
 * ============================================================================
 */

import Link from 'next/link';
import { Button } from '@/ui/button';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Indicator */}
        <p className="text-6xl font-bold text-accent mb-4">404</p>
        
        {/* Message */}
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles">Browse posts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

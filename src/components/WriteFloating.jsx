"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Feather } from 'lucide-react';
import { Button } from '@/ui/button';
import { useAuth } from '@/lib/auth';

export default function WriteFloating() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide the write button on the public homepage when the user is not signed in
  if (!user && pathname === '/') return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Link href="/dashboard/new" aria-label="Write new article">
        <Button className="rounded-full p-3 shadow-lg bg-accent text-white hover:bg-accent-dark" title="Write new article">
          <Feather className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
}

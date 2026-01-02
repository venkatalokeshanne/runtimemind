"use client";

import Link from 'next/link';
import { Feather } from 'lucide-react';
import { Button } from '@/ui/button';

export default function WriteFloating() {
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

/**
 * DASHBOARD LAYOUT
 * Layout for authenticated dashboard pages.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Top row removed - account menu is provided in the global header */}

          {/* Main Content (writing-focused) */}
          <main className="min-h-[60vh]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

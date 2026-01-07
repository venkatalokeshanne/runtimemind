"use client";

import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function LogoIfLoggedOut({ siteName = 'RuntimeMind' }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Only show on the public homepage when not signed in
  if (loading) return null;
  if (user) return null;
  if (pathname !== '/') return null;

  return (
    <Image
      src="/logo.png"
      alt={`${siteName} logo`}
      width={48}
      height={48}
      className="inline-block w-12 h-12 rounded mr-3 object-cover align-middle"
    />
  );
}

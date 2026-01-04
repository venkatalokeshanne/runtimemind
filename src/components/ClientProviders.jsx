"use client";

import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth';
import { UserProvider } from '@/lib/auth/UserContext';

export default function ClientProviders({ children, session }) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider session={session} refetchInterval={300000} refetchOnWindowFocus={false}>
        <UserProvider initialSession={session}>{children}</UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

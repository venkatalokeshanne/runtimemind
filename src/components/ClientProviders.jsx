"use client";

import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth';

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

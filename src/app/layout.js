/**
 * ============================================================================
 * ROOT LAYOUT
 * ============================================================================
 * 
 * The root layout wraps all pages and provides:
 * - Global styles
 * - Theme provider
 * - Site header and footer
 * - SEO metadata defaults
 * 
 * ARCHITECTURE:
 * 
 * 1. SERVER COMPONENT:
 *    This is a Server Component by default. It renders on the server
 *    for SEO benefits. Only children can be Client Components.
 * 
 * 2. METADATA API:
 *    Uses Next.js Metadata API for SEO. Each page can override these
 *    defaults with its own metadata export.
 * 
 * 3. THEME SCRIPT:
 *    Inline script prevents flash of wrong theme on load.
 *    Runs before React hydrates.
 * 
 * ============================================================================
 */

import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth';
import { SiteHeader, SiteFooter } from '@/modules/layout/components';
import './globals.css';

/**
 * FONT CONFIGURATION
 * 
 * We use:
 * - Geist Sans: Modern, clean sans-serif for UI
 * - Geist Mono: Matching monospace for code
 * - Newsreader: Beautiful serif for post content (optional)
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * SEO METADATA
 * 
 * Default metadata applied to all pages.
 * Individual pages can override with their own `metadata` export.
 * 
 * SEO BEST PRACTICES:
 * - Title template includes site name
 * - Description under 160 characters
 * - Open Graph for social sharing
 * - robots configuration for indexing
 */
export const metadata = {
  metadataBase: new URL('https://runtimemind.vercel.app'),
  title: {
    default: 'RuntimeMind - Write & Share Articles, Stories & Ideas',
    template: '%s | RuntimeMind',
  },
  description: 'Write and publish articles, stories, tutorials, and blog posts. A free platform for writers, developers, and creators to share ideas with the world.',
  keywords: ['write articles online', 'publish blog posts', 'free blogging platform', 'write stories', 'share ideas', 'tech articles', 'programming tutorials', 'content writing', 'blogging site', 'article publishing', 'creative writing platform', 'developer blog'],
  authors: [{ name: 'RuntimeMind', url: 'https://runtimemind.vercel.app' }],
  creator: 'RuntimeMind',
  publisher: 'RuntimeMind',
  
  // Favicon configuration
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  
  // Canonical and alternates
  alternates: {
    canonical: 'https://runtimemind.vercel.app',
    types: {
      'application/rss+xml': 'https://runtimemind.vercel.app/rss',
    },
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://runtimemind.vercel.app',
    siteName: 'RuntimeMind',
    title: 'RuntimeMind - Write & Share Articles, Stories & Ideas',
    description: 'Write and publish articles, stories, tutorials, and blog posts. A free platform for writers and creators to share ideas.',
    images: [
      {
        url: '/api/og?title=RuntimeMind&type=website',
        width: 1200,
        height: 630,
        alt: 'RuntimeMind - Write & Share Articles, Stories & Ideas',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@runtimemind',
    creator: '@runtimemind',
    title: 'RuntimeMind - Write & Share Articles, Stories & Ideas',
    description: 'Write and publish articles, stories, tutorials, and blog posts. A free platform for writers and creators.',
    images: ['/api/og?title=RuntimeMind&type=website'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add your IDs when available)
  // verification: {
  //   google: 'your-google-verification-id',
  //   yandex: 'your-yandex-verification-id',
  // },
};

/**
 * Viewport configuration
 * Separate from metadata as per Next.js 14+ requirements
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F10' },
  ],
};

/**
 * Theme initialization script
 * 
 * WHY INLINE SCRIPT:
 * This runs before React hydrates, preventing flash of wrong theme.
 * We check localStorage and system preference, then apply class immediately.
 */
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('runtimemind-theme');
      var isDark = theme === 'dark' || 
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    } catch (e) {}
  })();
`;

/**
 * JSON-LD Structured Data for the entire site
 * Helps search engines understand the site structure
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://runtimemind.vercel.app/#website',
      url: 'https://runtimemind.vercel.app',
      name: 'RuntimeMind',
      description: 'Tech articles, programming tutorials, and software development insights.',
      publisher: {
        '@id': 'https://runtimemind.vercel.app/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://runtimemind.vercel.app/articles?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': 'https://runtimemind.vercel.app/#organization',
      name: 'RuntimeMind',
      url: 'https://runtimemind.vercel.app',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://runtimemind.vercel.app/#logo',
        url: 'https://runtimemind.vercel.app/logo.png',
        contentUrl: 'https://runtimemind.vercel.app/logo.png',
        caption: 'RuntimeMind',
      },
      sameAs: [
        // Add your social media URLs here
        // 'https://twitter.com/runtimemind',
        // 'https://github.com/runtimemind',
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning // Required for theme script
    >
      <head>
        {/* Theme initialization - must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans antialiased
          min-h-screen flex flex-col
        `}
      >
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <Suspense fallback={<div className="h-16 bg-surface border-b border-border" />}>
              <SiteHeader siteName="RuntimeMind" />
            </Suspense>
            
            {/* Main content area - grows to fill space, pt-16 for fixed header */}
            <main className="flex-1 pt-16">
              {children}
            </main>
            
            <SiteFooter siteName="RuntimeMind" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


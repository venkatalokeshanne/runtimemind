/**
 * Series Section Metadata
 */

export const metadata = {
  title: 'Series - Multi-Part Tutorials & Guides',
  description: 'Explore curated series of multi-part tutorials, guides and learning paths. Deep dive into complex topics with step-by-step content.',
  keywords: ['series', 'tutorial series', 'multi-part tutorials', 'learning path', 'guides'],
  alternates: {
    canonical: 'https://www.runtimemind.com/series',
  },
  openGraph: {
    title: 'Series - Multi-Part Tutorials & Guides | RuntimeMind',
    description: 'Explore curated series of multi-part tutorials and learning paths.',
    url: 'https://www.runtimemind.com/series',
    type: 'website',
    images: [{ url: '/api/og?title=Series&type=page', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Series | RuntimeMind',
    description: 'Explore curated series of multi-part tutorials and learning paths.',
    images: ['/api/og?title=Series&type=page'],
  },
};

export default function SeriesLayout({ children }) {
  return children;
}

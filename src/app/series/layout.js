/**
 * Series Section Metadata
 */

export const metadata = {
  title: 'Series - Multi-Part Programming Tutorials',
  description: 'Explore our curated series of multi-part programming tutorials. Deep dive into complex topics with step-by-step guides.',
  keywords: ['programming series', 'tutorial series', 'multi-part tutorials', 'coding courses', 'learning path'],
  alternates: {
    canonical: 'https://runtimemind.com/series',
  },
  openGraph: {
    title: 'Series - Multi-Part Programming Tutorials | RuntimeMind',
    description: 'Explore our curated series of multi-part programming tutorials.',
    url: 'https://runtimemind.com/series',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Series | RuntimeMind',
    description: 'Explore our curated series of multi-part programming tutorials.',
  },
};

export default function SeriesLayout({ children }) {
  return children;
}

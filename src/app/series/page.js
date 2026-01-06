import SeriesPageClient from './SeriesPageClient';

export const metadata = {
  title: 'Series - Curated Reading Paths & Multi-Part Guides',
  description:
    'Browse RuntimeMind series to follow structured learning paths and multi-part guides authored by our community.',
  alternates: {
    canonical: 'https://www.runtimemind.com/series',
  },
  openGraph: {
    title: 'Series | RuntimeMind',
    description:
      'Explore curated series that bundle related articles into focused learning journeys.',
    url: 'https://www.runtimemind.com/series',
    type: 'website',
    images: [{ url: '/api/og?title=Series&type=page', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Series | RuntimeMind',
    description:
      'Explore curated series that bundle related articles into focused learning journeys.',
    images: ['/api/og?title=Series&type=page'],
  },
};

export const revalidate = 120;

export default function SeriesPage() {
  return <SeriesPageClient />;
}

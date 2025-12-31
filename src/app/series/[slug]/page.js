/**
 * ============================================================================
 * SERIES DETAIL PAGE
 * ============================================================================
 * 
 * Server component wrapper that provides SEO metadata for individual series.
 * Delegates rendering to client component for interactivity.
 * 
 * ============================================================================
 */

import { getSeriesBySlug } from '@/modules/articles/services';
import SeriesClient from './SeriesClient';

/**
 * Generate dynamic metadata for each series
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: series } = await getSeriesBySlug(slug);
  
  if (!series) {
    return {
      title: 'Series Not Found',
    };
  }
  
  const metaTitle = series.title;
  const metaDescription = series.description || `Explore the "${series.title}" series on RuntimeMind.`;
  const canonicalUrl = `https://runtimemind.com/series/${slug}`;
  
  // Use cover image or generate placeholder from title
  const ogImage = series.cover_image_url || `https://runtimemind.com/api/og?title=${encodeURIComponent(series.title)}&type=series`;
  
  return {
    title: metaTitle,
    description: metaDescription,
    
    alternates: {
      canonical: canonicalUrl,
    },
    
    openGraph: {
      title: `${metaTitle} | RuntimeMind Series`,
      description: metaDescription,
      type: 'website',
      url: canonicalUrl,
      siteName: 'RuntimeMind',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        }
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${metaTitle} | RuntimeMind`,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

/**
 * Revalidate pages periodically
 */
export const revalidate = 60;

/**
 * Series Detail Page
 */
export default async function SeriesDetailPage({ params }) {
  const { slug } = await params;
  
  // Pre-fetch series data for JSON-LD
  const { data: series } = await getSeriesBySlug(slug);
  
  // Generate JSON-LD for the series
  const seriesJsonLd = series ? {
    '@context': 'https://schema.org',
    '@type': 'CreativeWorkSeries',
    name: series.title,
    description: series.description,
    url: `https://runtimemind.com/series/${slug}`,
    image: series.cover_image_url || 'https://runtimemind.com/og-default.png',
    publisher: {
      '@type': 'Organization',
      name: 'RuntimeMind',
      url: 'https://runtimemind.com',
    },
  } : null;
  
  return (
    <>
      {seriesJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }}
        />
      )}
      <SeriesClient slug={slug} />
    </>
  );
}

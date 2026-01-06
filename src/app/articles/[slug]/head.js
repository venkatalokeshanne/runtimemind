import React from 'react';
import { cache } from 'react';
import { getPostBySlug } from '@/modules/articles/services';

const getPostBySlugCached = cache(async (slug) => getPostBySlug(slug));

export default async function Head({ params }) {
  const { slug } = params;
  const { data: post } = await getPostBySlugCached(slug);

  if (!post) return null;

  const timestamp = post.updated_at ? Date.parse(post.updated_at) : post.published_at ? Date.parse(post.published_at) : Date.now();
  const cacheBuster = encodeURIComponent(timestamp);
  const ogImage = post.cover_image_url || post.series?.cover_image_url || `https://www.runtimemind.com/api/og?title=${encodeURIComponent(post.title)}&type=article&author=${encodeURIComponent(post.author?.name || '')}&v=${cacheBuster}`;

  return (
    <>
      <link rel="image_src" href={ogImage} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
    </>
  );
}

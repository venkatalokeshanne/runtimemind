import React from 'react';
import { getPostBySlug } from '@/modules/articles/services';

export default async function Head({ params }) {
  const { slug } = params;
  const { data: post } = await getPostBySlug(slug);

  if (!post) return null;

  const cacheBuster = encodeURIComponent(post.updated_at || post.published_at || Date.now());
  const ogImage = post.cover_image_url || `https://runtimemind.vercel.app/api/og?title=${encodeURIComponent(post.title)}&type=article&author=${encodeURIComponent(post.author?.name || '')}&v=${cacheBuster}`;

  return (
    <>
      <link rel="image_src" href={ogImage} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
    </>
  );
}

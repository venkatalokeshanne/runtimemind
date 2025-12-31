/**
 * ============================================================================
 * HOME PAGE - Runtimemind (Creative Redesign)
 * ============================================================================
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Feather, BookOpen, Sparkles, Clock, Layers, Users, PenTool, Bookmark, ArrowUpRight } from 'lucide-react';
import { getPublishedPosts, getTrendingTags, getPublishedSeries } from '@/modules/articles/services';
import { Button } from '@/ui/button';
import { HomePageClient } from './components/home-page-client';

export const metadata = {
  title: 'Runtimemind | Tech Blog for Developers',
  description: 'Explore in-depth technical articles, tutorials, and insights for modern software development.',
};

export const revalidate = 60;

export default async function HomePage() {
  const { data: posts } = await getPublishedPosts({ limit: 12 });
  const { data: tags } = await getTrendingTags({ limit: 8 });
  const { data: series } = await getPublishedSeries({ limit: 3 });

  const featuredPost = posts?.[0];
  const recentPosts = posts?.slice(1, 12) || [];

  return (
    <HomePageClient posts={posts} tags={tags} series={series}>
      {/* Landing Page for logged-out users */}
      <div className="min-h-screen bg-background">
        {/* Floating Write CTA */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button 
            size="lg" 
            className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group rounded-full" 
            asChild
          >
            <Link href="/dashboard/new">
              <PenTool className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">Write</span>
            </Link>
          </Button>
        </div>

        {/* Hero Section - Preserved */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent/10 via-transparent to-transparent">
          <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 flex flex-col items-center text-center gap-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight mb-2">
              <span className="text-accent">Runtimemind</span> —
              <span className="block text-text-secondary text-2xl md:text-3xl font-medium mt-2">Where developers shape tomorrow's tech</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-6">
              Editorial insights, deep dives, and a platform to share your voice. Read, write, and connect with the minds building the future.
            </p>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/articles/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-surface-inset text-text-secondary border border-border text-xs hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      {/* Fresh Ink - Bento Grid Layout */}
      {recentPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Feather className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Fresh Ink</h2>
                <p className="text-sm text-text-muted">Latest from the community</p>
              </div>
            </div>
            <Link 
              href="/articles"
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1 group"
            >
              All articles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {/* Featured Post */}
              {featuredPost && (
                <Link 
                  href={`/articles/${featuredPost.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all duration-300 min-h-[300px]"
                >
                  {featuredPost.cover_image_url ? (
                    <Image
                      src={featuredPost.cover_image_url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium mb-4">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2 mb-4">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      {featuredPost.author?.name && (
                        <span className="flex items-center gap-1.5">
                          {featuredPost.author.avatar_url && (
                            <Image 
                              src={featuredPost.author.avatar_url} 
                              alt={featuredPost.author.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          {featuredPost.author.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        5 min read
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Two posts below featured */}
              <div className="grid grid-cols-2 gap-4">
                {recentPosts.slice(6, 8).map((post) => (
                  <Link 
                    key={post.id}
                    href={`/articles/${post.slug}`}
                    className="group relative rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 min-h-[180px]"
                  >
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column - Stacked content */}
            <div className="flex flex-col gap-4">
              {/* Medium Cards Row */}
              <div className="grid grid-cols-2 gap-4">
                {recentPosts.slice(0, 2).map((post) => (
                  <Link 
                    key={post.id}
                    href={`/articles/${post.slug}`}
                    className="group relative rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 min-h-[180px]"
                  >
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* List Cards */}
              <div className="flex flex-col gap-3">
                {recentPosts.slice(2, 6).map((post, idx) => (
                  <Link 
                    key={post.id}
                    href={`/articles/${post.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-accent/50 hover:bg-surface-elevated transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        {post.author?.name} · {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Series Section - Book Shelf Aesthetic */}
      {series && series.length > 0 && (
        <section className="relative py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-inset/50 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Deep Dives</h2>
                  <p className="text-sm text-text-muted">Multi-part series by our writers</p>
                </div>
              </div>
              <Link 
                href="/series"
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1 group"
              >
                Browse all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Series Cards - Book Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group relative"
                >
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-4 bottom-4 w-2 rounded-l-md bg-accent/60 group-hover:bg-accent transition-colors" />
                  
                  <div className="ml-2 rounded-xl overflow-hidden bg-surface border border-border group-hover:border-accent/30 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                    {/* Cover */}
                    <div className="relative h-40 overflow-hidden">
                      {s.cover_image_url ? (
                        <Image
                          src={s.cover_image_url}
                          alt={s.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-accent/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                      
                      {/* Part count badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border text-xs font-medium text-text-secondary">
                        {s.posts_count || 0} parts
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-1 mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                        {s.description || 'A curated series of in-depth articles'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        {s.author?.avatar_url && (
                          <Image 
                            src={s.author.avatar_url} 
                            alt={s.author?.name || 'Author'}
                            width={18}
                            height={18}
                            className="rounded-full"
                          />
                        )}
                        <span>{s.author?.name || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Topics to Explore - Visual Grid */}
      {tags && tags.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Explore Topics</h2>
                <p className="text-sm text-text-muted">Find your next deep dive</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tags.slice(0, 8).map((tag, idx) => {
              const gradients = [
                'from-blue-500/20 to-cyan-500/10',
                'from-purple-500/20 to-pink-500/10',
                'from-orange-500/20 to-yellow-500/10',
                'from-green-500/20 to-emerald-500/10',
                'from-red-500/20 to-rose-500/10',
                'from-indigo-500/20 to-violet-500/10',
                'from-teal-500/20 to-cyan-500/10',
                'from-fuchsia-500/20 to-purple-500/10',
              ];
              return (
                <Link
                  key={tag.slug}
                  href={`/articles/tag/${tag.slug}`}
                  className="group relative p-6 rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-50 group-hover:opacity-80 transition-opacity`} />
                  <div className="relative">
                    <span className="text-3xl font-bold text-text-primary/20 absolute -top-2 -left-1">
                      #
                    </span>
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors mt-4">
                      {tag.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {tag.count || 0} articles
                    </p>
                  </div>
                  <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Why Runtimemind - Value Proposition */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-inset/30 via-transparent to-surface-inset/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Why write here?</h2>
            <p className="text-text-secondary">A platform designed by developers, for developers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Feather,
                title: 'Distraction-free Writing',
                description: 'A beautiful, modern editor that lets you focus on what matters—your words and ideas.',
              },
              {
                icon: Layers,
                title: 'Build Series',
                description: 'Create multi-part tutorials and guides. Connect your articles into comprehensive learning paths.',
              },
              {
                icon: Users,
                title: 'Join the Community',
                description: 'Connect with fellow developers, share knowledge, and grow together in a supportive environment.',
              },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group relative p-8 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote / Inspiration Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-surface border border-border p-10 md:p-16 text-center">
          <div className="absolute top-6 left-8 text-8xl font-serif text-accent/10">"</div>
          <div className="absolute bottom-6 right-8 text-8xl font-serif text-accent/10 rotate-180">"</div>
          
          <blockquote className="relative max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl font-medium text-text-primary leading-relaxed mb-6">
              The best way to learn is to teach. The best way to understand is to explain. Write not just to share, but to discover.
            </p>
            <footer className="text-sm text-text-muted">
              — The Runtimemind Philosophy
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Editor's Picks / Trending */}
      {recentPosts.length > 2 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Editor's Picks</h2>
                <p className="text-sm text-text-muted">Hand-selected reads</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((post) => (
              <Link 
                key={post.id}
                href={`/articles/${post.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      <Feather className="w-12 h-12 text-accent/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-auto">
                    {post.author?.avatar_url && (
                      <Image 
                        src={post.author.avatar_url} 
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{post.author?.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      5 min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/5 via-surface to-surface-elevated border border-border p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent mb-4">
                <Sparkles className="w-4 h-4" />
                Stay Updated
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Get the best in your inbox
              </h2>
              <p className="text-text-secondary">
                Weekly curated articles, tutorials, and insights. No spam, just quality content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-all"
              />
              <Button className="whitespace-nowrap">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section className="container mx-auto px-4 pb-20 md:pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 via-surface to-surface-elevated border border-border p-8 md:p-12 lg:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <PenTool className="w-8 h-8 text-accent" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Share your story
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
              Join fellow developers in sharing knowledge, experiences, and insights. Your voice matters here.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="group">
                <Link href="/dashboard/new">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Writing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/articles">
                  Explore Articles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </HomePageClient>
  );
}

-- ============================================================================
-- DATABASE SCHEMA: Ink Blog
-- ============================================================================
--
-- This file contains the complete PostgreSQL schema for the blog platform.
-- Run this in your Supabase SQL Editor to set up the database.
--
-- DESIGN PRINCIPLES:
-- 1. Minimal schema - only what's needed, nothing more
-- 2. SEO-optimized - slugs for clean URLs, proper indexing
-- 3. Audit-friendly - created_at, updated_at on all tables
-- 4. RLS-ready - designed with Row Level Security in mind
--
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- UUID generation for primary keys
-- WHY UUIDs:
-- - No sequential guessing (security)
-- - Safe for distributed systems
-- - Can be generated client-side
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
--
-- Extends Supabase's built-in auth.users with public profile data.
-- 
-- WHY SEPARATE FROM AUTH:
-- - auth.users is in a protected schema, not directly accessible via API
-- - We need public profile data (name, avatar) readable by anyone
-- - This pattern is recommended by Supabase
--

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key matches auth.users.id (1:1 relationship)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Display name for the author
  -- NOT NULL: Authors must have a name to display on posts
  name TEXT NOT NULL,
  
  -- Optional author bio for author pages
  bio TEXT,
  
  -- Avatar URL (stored in Supabase Storage)
  -- NULL means use default avatar
  avatar_url TEXT,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for potential future queries by name
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(name);

-- Comment for documentation
COMMENT ON TABLE public.profiles IS 'Public user profiles extending auth.users';

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
--
-- Core content table for blog posts.
--
-- DESIGN DECISIONS:
-- 1. slug is unique and indexed - primary way to access posts via URL
-- 2. content stores markdown - simpler than rich text, portable
-- 3. excerpt is manually set - AI-generated excerpts often miss the point
-- 4. published flag - enables draft functionality
-- 5. No categories/tags initially - YAGNI (You Ain't Gonna Need It)
--

CREATE TABLE IF NOT EXISTS public.posts (
  -- UUID primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- URL-friendly identifier
  -- UNIQUE: Each post needs a unique URL
  -- NOT NULL: Every post must be addressable
  slug TEXT UNIQUE NOT NULL,
  
  -- Post title (displayed in lists, page title, OG tags)
  -- NOT NULL: Posts must have titles for SEO and UX
  title TEXT NOT NULL,
  
  -- Full post content in Markdown format
  -- WHY MARKDOWN:
  -- - Portable (can migrate to any platform)
  -- - Version control friendly
  -- - Simple to render (many libraries available)
  -- - Authors can write in any markdown editor
  content TEXT NOT NULL,
  
  -- Short description for SEO meta and post cards
  -- WHY MANUAL:
  -- - Auto-truncation often cuts at bad points
  -- - Author knows best what to highlight
  -- - Better for SEO meta descriptions
  excerpt TEXT,
  
  -- Cover image URL (stored in Supabase Storage)
  -- NULL means no cover image
  cover_image_url TEXT,
  
  -- Foreign key to the author
  -- NOT NULL: Every post must have an author
  -- ON DELETE CASCADE: If author deleted, their posts are too
  -- (Alternative: SET NULL to preserve posts with "deleted user")
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Publication status
  -- FALSE: Draft (only visible to author)
  -- TRUE: Published (visible to everyone)
  published BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- When the post was published (NULL if draft)
  -- WHY SEPARATE FROM created_at:
  -- - Posts may be drafted then published later
  -- - Allows scheduling (set published_at in future)
  published_at TIMESTAMPTZ,
  
  -- Tags for categorization and SEO
  -- Stored as TEXT array for flexibility
  -- Used for: filtering, related posts, SEO keywords
  tags TEXT[] DEFAULT '{}',
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES FOR POSTS
-- ============================================================================
--
-- INDEX STRATEGY:
-- Index columns that are:
-- 1. Used in WHERE clauses (slug, published, author_id)
-- 2. Used in ORDER BY (published_at, created_at)
-- 
-- AVOID over-indexing:
-- - Indexes slow down writes
-- - Only add indexes for actual query patterns
--

-- Primary lookup: finding a post by slug
-- This is the most common query (every page view)
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);

-- List published posts, newest first
-- Used on homepage and archive pages
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published, published_at DESC)
  WHERE published = TRUE;

-- Find posts by author
-- Used on author profile pages
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);

-- Full-text search (optional, for future search feature)
-- GIN index on title and content for fast text search
CREATE INDEX IF NOT EXISTS posts_search_idx ON public.posts 
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- GIN index for tags array queries (finding posts by tag)
CREATE INDEX IF NOT EXISTS posts_tags_idx ON public.posts USING GIN (tags);

COMMENT ON TABLE public.posts IS 'Blog posts with markdown content';
COMMENT ON COLUMN public.posts.tags IS 'Array of tags for categorization and SEO keywords';

-- ============================================================================
-- SERIES TABLE
-- ============================================================================
--
-- Allows grouping posts into a series (multi-part tutorials, courses, etc.)
--
-- DESIGN DECISIONS:
-- 1. slug is unique - for clean URLs (/blog/series/building-react-app)
-- 2. author_id - each series belongs to one author
-- 3. published - hide incomplete series from public
-- 4. cover_image_url - visual identity for the series
--

CREATE TABLE IF NOT EXISTS public.series (
  -- UUID primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- URL-friendly identifier
  slug TEXT UNIQUE NOT NULL,
  
  -- Series title
  title TEXT NOT NULL,
  
  -- Series description (what readers will learn)
  description TEXT,
  
  -- Cover image for series cards
  cover_image_url TEXT,
  
  -- Author of the series
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Publication status
  published BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for series
CREATE INDEX IF NOT EXISTS series_slug_idx ON public.series(slug);
CREATE INDEX IF NOT EXISTS series_author_idx ON public.series(author_id);
CREATE INDEX IF NOT EXISTS series_published_idx ON public.series(published) WHERE published = TRUE;

COMMENT ON TABLE public.series IS 'Groups of related posts forming a series';

-- ============================================================================
-- ADD SERIES COLUMNS TO POSTS
-- ============================================================================
--
-- Links posts to series with ordering.
--

ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS series_order INTEGER DEFAULT 0;

-- Index for finding posts in a series
CREATE INDEX IF NOT EXISTS posts_series_idx ON public.posts(series_id, series_order) 
  WHERE series_id IS NOT NULL;

COMMENT ON COLUMN public.posts.series_id IS 'Optional series this post belongs to';
COMMENT ON COLUMN public.posts.series_order IS 'Order within the series (1, 2, 3...)';

-- ============================================================================
-- SERIES UPDATED_AT TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS series_updated_at ON public.series;
CREATE TRIGGER series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SERIES RLS POLICIES
-- ============================================================================

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Anyone can read published series
DROP POLICY IF EXISTS series_select_public ON public.series;
CREATE POLICY series_select_public ON public.series
  FOR SELECT
  USING (published = TRUE OR auth.uid() = author_id);

-- Authenticated users can create series as themselves
DROP POLICY IF EXISTS series_insert_authenticated ON public.series;
CREATE POLICY series_insert_authenticated ON public.series
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Authors can update their own series
DROP POLICY IF EXISTS series_update_own ON public.series;
CREATE POLICY series_update_own ON public.series
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own series
DROP POLICY IF EXISTS series_delete_own ON public.series;
CREATE POLICY series_delete_own ON public.series
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
--
-- Automatically updates updated_at timestamp when a row is modified.
-- 
-- WHY A TRIGGER:
-- - Guaranteed to run (can't forget to update it)
-- - Works for all update methods (API, dashboard, SQL)
-- - Single source of truth for "when was this changed"
--

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply trigger to posts
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
--
-- When a new user signs up via Supabase Auth, automatically create
-- their profile record.
--
-- WHY:
-- - Ensures every auth user has a profile
-- - User doesn't need to manually create profile
-- - Profile is ready immediately after signup
--

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $handle_new_user$
DECLARE
  display_name TEXT;
  first_last TEXT;
  given_family TEXT;
  nested_name TEXT;
  nested_full TEXT;
BEGIN
  first_last := trim(concat_ws(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name'));
  given_family := trim(concat_ws(' ', NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'family_name'));
  nested_name := NULLIF(NEW.raw_user_meta_data->'user'->>'name', '');
  nested_full := NULLIF(NEW.raw_user_meta_data->'user'->>'full_name', '');
  display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(nested_name, ''),
    NULLIF(nested_full, ''),
    NULLIF(first_last, ''),
    NULLIF(given_family, ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    display_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$handle_new_user$ LANGUAGE plpgsql SECURITY DEFINER;

-- Listen for new users in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
--
-- RLS ensures users can only access data they're authorized to see.
-- This is CRITICAL for security - without RLS, the anon key can access everything!
--
-- POLICY NAMING CONVENTION:
-- [table]_[action]_[who] e.g., posts_select_public
--

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Anyone can read any profile (needed to show author info on posts)
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only delete their own profile (cascades to posts)
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- READING POSTS:
-- - Published posts: Anyone can read
-- - Drafts: Only the author can read
DROP POLICY IF EXISTS posts_select_public ON public.posts;
CREATE POLICY posts_select_public ON public.posts
  FOR SELECT
  USING (
    published = TRUE 
    OR auth.uid() = author_id
  );

-- CREATING POSTS:
-- - Must be authenticated
-- - Can only create posts as yourself (author_id = your user id)
DROP POLICY IF EXISTS posts_insert_authenticated ON public.posts;
CREATE POLICY posts_insert_authenticated ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
  );

-- UPDATING POSTS:
-- - Can only update your own posts
DROP POLICY IF EXISTS posts_update_own ON public.posts;
CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- DELETING POSTS:
-- - Can only delete your own posts
DROP POLICY IF EXISTS posts_delete_own ON public.posts;
CREATE POLICY posts_delete_own ON public.posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================================================
--
-- Create a storage bucket for blog images.
-- Run this in Supabase Storage settings or via SQL:
--

-- Create the bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images
DROP POLICY IF EXISTS storage_read_public ON storage.objects;
CREATE POLICY storage_read_public ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS storage_insert_authenticated ON storage.objects;
CREATE POLICY storage_insert_authenticated ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' 
    AND auth.uid() IS NOT NULL
  );

-- Allow users to update/delete their own images
-- (Images are stored with path: user_id/filename)
DROP POLICY IF EXISTS storage_update_own ON storage.objects;
CREATE POLICY storage_update_own ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS storage_delete_own ON storage.objects;
CREATE POLICY storage_delete_own ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- SAMPLE DATA (Tech-focused content for development)
-- ============================================================================

-- Sample profiles (using your real user ID + demo users)
-- Note: Your user ID is used for the first profile so you can manage this content
INSERT INTO public.profiles (id, name, bio, avatar_url)
VALUES 
  ('f499d079-a53f-4a8e-a4a0-6fc55337c5b7', 'Anne V', 'Full-stack developer passionate about React, TypeScript, and building great developer experiences. Currently working on AI-powered tools.', 'https://randomuser.me/api/portraits/women/44.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- Sample series (all owned by your account)
INSERT INTO public.series (id, slug, title, description, author_id, published, cover_image_url)
VALUES 
  ('aaaa1111-1111-1111-1111-111111111111', 'modern-react-patterns', 'Modern React Patterns', 'Master advanced React patterns including compound components, render props, custom hooks, and state machines. Build scalable and maintainable React applications.', 'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'),
  ('aaaa2222-2222-2222-2222-222222222222', 'building-apis-with-nodejs', 'Building Production APIs with Node.js', 'Learn to build robust, scalable REST APIs with Node.js, Express, and PostgreSQL. Covers authentication, validation, testing, and deployment.', 'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800'),
  ('aaaa3333-3333-3333-3333-333333333333', 'devops-fundamentals', 'DevOps Fundamentals', 'From zero to hero with DevOps. Learn CI/CD, Docker, Kubernetes, and infrastructure as code.', 'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800'),
  ('aaaa4444-4444-4444-4444-444444444444', 'typescript-masterclass', 'TypeScript Masterclass', 'Deep dive into TypeScript from basics to advanced type system features. Generics, utility types, and type-safe patterns.', 'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', false, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  published = EXCLUDED.published;

-- Sample posts (all owned by your account)
INSERT INTO public.posts (id, slug, title, content, excerpt, author_id, published, published_at, series_id, series_order)
VALUES 
  -- React Series Posts
  ('bbbb1111-1111-1111-1111-111111111111', 'understanding-react-server-components', 'Understanding React Server Components', 
   '<h2>What are React Server Components?</h2>
<p>React Server Components (RSC) represent a paradigm shift in how we build React applications. They allow components to run exclusively on the server, reducing the JavaScript bundle sent to the client.</p>
<h3>Key Benefits</h3>
<ul>
<li><strong>Zero bundle size</strong> - Server components don''t add to your JS bundle</li>
<li><strong>Direct backend access</strong> - Query databases directly in components</li>
<li><strong>Automatic code splitting</strong> - Client components are lazy-loaded</li>
</ul>
<h3>When to Use Server Components</h3>
<p>Use server components when you need to fetch data, access backend resources, or render static content. Use client components for interactivity, browser APIs, and state management.</p>
<pre><code>// This runs on the server!
async function BlogPost({ slug }) {
  const post = await db.posts.findUnique({ where: { slug } });
  return &lt;article&gt;{post.content}&lt;/article&gt;;
}</code></pre>
<p>Server components are the future of React development, and understanding them is essential for modern web development.</p>',
   'Learn how React Server Components work and when to use them for optimal performance.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '7 days',
   'aaaa1111-1111-1111-1111-111111111111', 1),

  ('bbbb1112-1111-1111-1111-111111111111', 'custom-hooks-best-practices', 'Custom Hooks: Best Practices and Patterns',
   '<h2>Building Reusable Logic with Custom Hooks</h2>
<p>Custom hooks are the most elegant way to share stateful logic between React components. Let''s explore patterns that make your hooks maintainable and reusable.</p>
<h3>The Rules of Hooks</h3>
<ol>
<li>Only call hooks at the top level</li>
<li>Only call hooks from React functions</li>
<li>Name custom hooks starting with "use"</li>
</ol>
<h3>A Practical Example: useAsync</h3>
<pre><code>function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    asyncFn()
      .then(data => setState({ loading: false, error: null, data }))
      .catch(error => setState({ loading: false, error, data: null }));
  }, deps);

  return state;
}</code></pre>
<p>This hook encapsulates the common pattern of loading, error, and data states for async operations.</p>',
   'Master the art of creating custom React hooks with these battle-tested patterns.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '5 days',
   'aaaa1111-1111-1111-1111-111111111111', 2),

  ('bbbb1113-1111-1111-1111-111111111111', 'compound-components-pattern', 'The Compound Components Pattern',
   '<h2>Building Flexible Component APIs</h2>
<p>Compound components let you create expressive, declarative APIs for complex UI patterns. Think of how HTML select and option work together.</p>
<h3>Building a Tabs Component</h3>
<pre><code>&lt;Tabs defaultValue="tab1"&gt;
  &lt;Tabs.List&gt;
    &lt;Tabs.Trigger value="tab1"&gt;Account&lt;/Tabs.Trigger&gt;
    &lt;Tabs.Trigger value="tab2"&gt;Settings&lt;/Tabs.Trigger&gt;
  &lt;/Tabs.List&gt;
  &lt;Tabs.Content value="tab1"&gt;Account content&lt;/Tabs.Content&gt;
  &lt;Tabs.Content value="tab2"&gt;Settings content&lt;/Tabs.Content&gt;
&lt;/Tabs&gt;</code></pre>
<p>This pattern provides flexibility while maintaining a clean API. Users can customize structure without prop drilling.</p>',
   'Create flexible and intuitive component APIs using the compound components pattern.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '3 days',
   'aaaa1111-1111-1111-1111-111111111111', 3),

  -- Node.js Series Posts
  ('bbbb2221-2222-2222-2222-222222222222', 'setting-up-express-typescript', 'Setting Up Express with TypeScript',
   '<h2>Modern Express Setup</h2>
<p>Let''s set up a production-ready Express server with TypeScript, proper error handling, and best practices.</p>
<h3>Project Structure</h3>
<pre><code>src/
├── controllers/
├── middleware/
├── routes/
├── services/
├── types/
└── index.ts</code></pre>
<h3>Essential Dependencies</h3>
<pre><code>npm install express cors helmet
npm install -D typescript @types/express @types/node ts-node-dev</code></pre>
<h3>Type-Safe Request Handlers</h3>
<pre><code>import { Request, Response, NextFunction } from ''express'';

interface CreateUserBody {
  email: string;
  name: string;
}

export const createUser = async (
  req: Request&lt;{}, {}, CreateUserBody&gt;,
  res: Response,
  next: NextFunction
) => {
  // Full type safety here!
};</code></pre>',
   'Bootstrap a production-ready Express.js project with TypeScript and modern tooling.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '10 days',
   'aaaa2222-2222-2222-2222-222222222222', 1),

  ('bbbb2222-2222-2222-2222-222222222222', 'authentication-with-jwt', 'Implementing JWT Authentication',
   '<h2>Secure Authentication with JSON Web Tokens</h2>
<p>JWT authentication is a stateless approach to securing your API. Let''s implement it properly with refresh tokens and security best practices.</p>
<h3>Token Strategy</h3>
<ul>
<li><strong>Access Token</strong>: Short-lived (15 min), stored in memory</li>
<li><strong>Refresh Token</strong>: Long-lived (7 days), stored in httpOnly cookie</li>
</ul>
<h3>Implementation</h3>
<pre><code>import jwt from ''jsonwebtoken'';

export function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: ''15m'' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: ''7d'' }
  );
  
  return { accessToken, refreshToken };
}</code></pre>
<p>Remember to always hash passwords with bcrypt and validate all inputs!</p>',
   'Implement secure JWT authentication with access tokens, refresh tokens, and best practices.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '8 days',
   'aaaa2222-2222-2222-2222-222222222222', 2),

  -- DevOps Series Posts
  ('bbbb3331-3333-3333-3333-333333333333', 'docker-for-developers', 'Docker for Developers: A Practical Guide',
   '<h2>Containerize Your Applications</h2>
<p>Docker has revolutionized how we develop, ship, and run applications. Let''s learn the essentials every developer should know.</p>
<h3>Your First Dockerfile</h3>
<pre><code>FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "dist/index.js"]</code></pre>
<h3>Multi-Stage Builds</h3>
<p>Reduce image size by using multi-stage builds:</p>
<pre><code>FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]</code></pre>
<p>This approach can reduce your image size by 50% or more!</p>',
   'Master Docker fundamentals with practical examples for your development workflow.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '14 days',
   'aaaa3333-3333-3333-3333-333333333333', 1),

  ('bbbb3332-3333-3333-3333-333333333333', 'github-actions-cicd', 'CI/CD with GitHub Actions',
   '<h2>Automate Your Pipeline</h2>
<p>GitHub Actions makes it easy to automate testing, building, and deploying your code. Let''s set up a complete CI/CD pipeline.</p>
<h3>Basic Workflow</h3>
<pre><code>name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == ''refs/heads/main''
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh</code></pre>
<p>This workflow runs tests on every PR and deploys on merge to main.</p>',
   'Set up automated testing and deployment with GitHub Actions for your projects.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '12 days',
   'aaaa3333-3333-3333-3333-333333333333', 2),

  -- Standalone posts (not in series)
  ('bbbb4441-4444-4444-4444-444444444444', 'why-typescript-is-worth-it', 'Why TypeScript is Worth the Learning Curve',
   '<h2>The Case for TypeScript</h2>
<p>After years of writing JavaScript, switching to TypeScript can feel like a burden. But the investment pays off significantly. Here''s why.</p>
<h3>Catching Bugs Before Runtime</h3>
<p>TypeScript catches entire categories of bugs at compile time:</p>
<ul>
<li>Typos in property names</li>
<li>Incorrect function arguments</li>
<li>Null/undefined access</li>
<li>Missing switch cases</li>
</ul>
<h3>Better Developer Experience</h3>
<p>With TypeScript, your IDE becomes incredibly powerful:</p>
<ul>
<li><strong>Autocomplete</strong> - Know what properties are available</li>
<li><strong>Refactoring</strong> - Rename symbols across your codebase</li>
<li><strong>Documentation</strong> - Types serve as inline documentation</li>
</ul>
<h3>The Learning Curve is Overstated</h3>
<p>You can adopt TypeScript gradually. Start with <code>any</code> types and progressively add stricter types. The compiler is your friend, not your enemy.</p>',
   'Discover why TypeScript''s benefits far outweigh the initial learning investment.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '1 day',
   NULL, NULL),

  ('bbbb4442-4444-4444-4444-444444444444', 'postgres-performance-tips', '10 PostgreSQL Performance Tips You Should Know',
   '<h2>Optimize Your Database</h2>
<p>PostgreSQL is powerful out of the box, but these tips will help you squeeze out even more performance.</p>
<h3>1. Use EXPLAIN ANALYZE</h3>
<pre><code>EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = ''...'';
</code></pre>
<h3>2. Create Proper Indexes</h3>
<p>Index columns used in WHERE, JOIN, and ORDER BY clauses.</p>
<h3>3. Use Partial Indexes</h3>
<pre><code>CREATE INDEX posts_published_idx ON posts(published_at) 
WHERE published = true;</code></pre>
<h3>4. Batch Your Inserts</h3>
<p>Insert multiple rows in a single statement instead of one at a time.</p>
<h3>5. Use Connection Pooling</h3>
<p>Tools like PgBouncer can dramatically improve connection handling.</p>
<p>These optimizations can make your database 10x faster with minimal effort!</p>',
   'Essential PostgreSQL performance optimizations every developer should implement.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '4 days',
   NULL, NULL),

  ('bbbb4443-4444-4444-4444-444444444444', 'kubernetes-vs-serverless', 'Kubernetes vs Serverless: When to Use What',
   '<h2>Choosing the Right Architecture</h2>
<p>Both Kubernetes and serverless have their place. Understanding when to use each can save you time, money, and headaches.</p>
<h3>Choose Serverless When:</h3>
<ul>
<li>Traffic is unpredictable or spiky</li>
<li>You want zero infrastructure management</li>
<li>Functions run for less than 15 minutes</li>
<li>Cost optimization is critical for low traffic</li>
</ul>
<h3>Choose Kubernetes When:</h3>
<ul>
<li>You need consistent, predictable performance</li>
<li>Workloads run continuously</li>
<li>You need fine-grained control over infrastructure</li>
<li>You''re running stateful applications</li>
</ul>
<h3>The Hybrid Approach</h3>
<p>Many teams use both: Kubernetes for core services and serverless for event-driven workloads. This gives you the best of both worlds.</p>',
   'A practical guide to choosing between Kubernetes and serverless architectures.',
   'f499d079-a53f-4a8e-a4a0-6fc55337c5b7', true, NOW() - INTERVAL '6 days',
   NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at,
  series_id = EXCLUDED.series_id,
  series_order = EXCLUDED.series_order;

-- ============================================================================
-- BOOKMARKS TABLE
-- ============================================================================
--
-- Allows users to save posts to their reading list.
--

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User who bookmarked
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Post that was bookmarked
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  -- When it was bookmarked
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: user can only bookmark a post once
  UNIQUE(user_id, post_id)
);

-- Index for fetching user's bookmarks
CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookmarks_post_idx ON public.bookmarks(post_id);

COMMENT ON TABLE public.bookmarks IS 'User reading lists / saved posts';

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookmarks
DROP POLICY IF EXISTS bookmarks_select_own ON public.bookmarks;
CREATE POLICY bookmarks_select_own ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookmarks for themselves
DROP POLICY IF EXISTS bookmarks_insert_own ON public.bookmarks;
CREATE POLICY bookmarks_insert_own ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
DROP POLICY IF EXISTS bookmarks_delete_own ON public.bookmarks;
CREATE POLICY bookmarks_delete_own ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SERIES BOOKMARKS TABLE
-- ============================================================================
--
-- Allows users to save series to their reading list.
--

CREATE TABLE IF NOT EXISTS public.series_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User who bookmarked
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Series that was bookmarked
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  
  -- When it was bookmarked
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: user can only bookmark a series once
  UNIQUE(user_id, series_id)
);

-- Index for fetching user's series bookmarks
CREATE INDEX IF NOT EXISTS series_bookmarks_user_idx ON public.series_bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS series_bookmarks_series_idx ON public.series_bookmarks(series_id);

COMMENT ON TABLE public.series_bookmarks IS 'User saved series';

-- Enable RLS
ALTER TABLE public.series_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own series bookmarks
DROP POLICY IF EXISTS series_bookmarks_select_own ON public.series_bookmarks;
CREATE POLICY series_bookmarks_select_own ON public.series_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create series bookmarks for themselves
DROP POLICY IF EXISTS series_bookmarks_insert_own ON public.series_bookmarks;
CREATE POLICY series_bookmarks_insert_own ON public.series_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own series bookmarks
DROP POLICY IF EXISTS series_bookmarks_delete_own ON public.series_bookmarks;
CREATE POLICY series_bookmarks_delete_own ON public.series_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOLLOWS TABLE
-- ============================================================================
--
-- Allows users to follow other users.
--

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User who is following
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- User being followed
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- When the follow happened
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: can only follow someone once
  UNIQUE(follower_id, following_id),
  
  -- Constraint: can't follow yourself
  CHECK (follower_id != following_id)
);

-- Index for fetching followers/following lists
CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id, created_at DESC);

COMMENT ON TABLE public.follows IS 'User follow relationships';

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see follow relationships
DROP POLICY IF EXISTS follows_select_public ON public.follows;
CREATE POLICY follows_select_public ON public.follows
  FOR SELECT
  USING (true);

-- Users can create follows for themselves
DROP POLICY IF EXISTS follows_insert_own ON public.follows;
CREATE POLICY follows_insert_own ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows (unfollow)
DROP POLICY IF EXISTS follows_delete_own ON public.follows;
CREATE POLICY follows_delete_own ON public.follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================================
-- ADD FOLLOWER/FOLLOWING COUNTS TO PROFILES
-- ============================================================================

-- Helper function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.follows WHERE following_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Helper function to get following count
CREATE OR REPLACE FUNCTION get_following_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.follows WHERE follower_id = profile_id;
$$ LANGUAGE SQL STABLE;

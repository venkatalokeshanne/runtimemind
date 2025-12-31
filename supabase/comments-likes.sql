-- ============================================================================
-- COMMENTS AND LIKES SCHEMA UPDATE
-- ============================================================================
--
-- Run this in your Supabase SQL Editor to add comments and likes functionality.
--
-- ============================================================================

-- ============================================================================
-- ENSURE update_updated_at FUNCTION EXISTS
-- ============================================================================
-- This function may already exist from schema.sql, but we create it if not

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
--
-- Stores comments on posts. Users must be logged in to comment.
--

CREATE TABLE IF NOT EXISTS public.comments (
  -- UUID primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The post this comment belongs to
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  -- The user who wrote the comment (references profiles.id, not user_id)
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Comment content (plain text or markdown)
  content TEXT NOT NULL,
  
  -- Parent comment for replies (NULL for top-level comments)
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS comments_post_idx ON public.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS comments_author_idx ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id) WHERE parent_id IS NOT NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS comments_updated_at ON public.comments;
CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.comments IS 'Comments on posts by authenticated users';

-- ============================================================================
-- COMMENTS RLS POLICIES
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments on published posts
DROP POLICY IF EXISTS comments_select_public ON public.comments;
CREATE POLICY comments_select_public ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = comments.post_id 
      AND (posts.published = TRUE OR posts.author_id = auth.uid())
    )
  );

-- Authenticated users can create comments
DROP POLICY IF EXISTS comments_insert_authenticated ON public.comments;
CREATE POLICY comments_insert_authenticated ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Users can update their own comments
DROP POLICY IF EXISTS comments_update_own ON public.comments;
CREATE POLICY comments_update_own ON public.comments
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments, post authors can delete any comment on their posts
DROP POLICY IF EXISTS comments_delete_own ON public.comments;
CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE
  USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = comments.post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- ============================================================================
-- LIKES TABLE
-- ============================================================================
--
-- Stores likes on posts. Each user can like a post once.
--

CREATE TABLE IF NOT EXISTS public.likes (
  -- UUID primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The post that was liked
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  -- The user who liked the post (references profiles.id)
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- When the like was created
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure each user can only like a post once
  CONSTRAINT likes_unique_author_post UNIQUE (post_id, author_id)
);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS likes_post_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS likes_author_idx ON public.likes(author_id);

COMMENT ON TABLE public.likes IS 'Post likes by authenticated users (one per user per post)';

-- ============================================================================
-- LIKES RLS POLICIES
-- ============================================================================

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes (for counts)
DROP POLICY IF EXISTS likes_select_public ON public.likes;
CREATE POLICY likes_select_public ON public.likes
  FOR SELECT
  USING (true);

-- Authenticated users can create likes
DROP POLICY IF EXISTS likes_insert_authenticated ON public.likes;
CREATE POLICY likes_insert_authenticated ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Users can delete (unlike) their own likes
DROP POLICY IF EXISTS likes_delete_own ON public.likes;
CREATE POLICY likes_delete_own ON public.likes
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- ADD COUNTS COLUMNS TO POSTS (OPTIONAL - FOR PERFORMANCE)
-- ============================================================================
--
-- These denormalized count columns improve read performance.
-- They're updated via triggers when comments/likes change.
--

ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- ============================================================================
-- TRIGGER FUNCTIONS TO UPDATE COUNTS
-- ============================================================================

-- Update likes_count when likes change
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS likes_count_trigger ON public.likes;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count when comments change
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS comments_count_trigger ON public.comments;
CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ============================================================================
-- INITIALIZE EXISTING COUNTS
-- ============================================================================
-- Run this once after adding the columns to sync with existing data

UPDATE public.posts p
SET 
  likes_count = (SELECT COUNT(*) FROM public.likes l WHERE l.post_id = p.id),
  comments_count = (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id);

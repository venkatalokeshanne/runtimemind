/**
 * ============================================================================
 * MY POSTS PAGE
 * ============================================================================
 * 
 * Lists all posts by the logged-in author.
 * Shows both published and draft posts.
 * 
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText, 
  PenSquare, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Globe,
  FileEdit,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getPostsByAuthor, deletePost } from '@/modules/blog/services';
import { Button } from '@/ui/button';
import { formatDate } from '@/lib/utils';

export default function MyPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    async function loadPosts() {
      if (!user) return;

      const { data, error } = await getPostsByAuthor(user.id, { includeDrafts: true });
      if (error) {
        try {
          console.error('Failed to load author posts:', JSON.parse(JSON.stringify(error)));
        } catch (e) {
          console.error('Failed to load author posts (raw):', error);
        }
        setPosts([]);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }

    loadPosts();
  }, [user]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  async function handleDelete(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    await deletePost(postId);
    setPosts(posts.filter(p => p.id !== postId));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Posts</h1>
          <p className="text-text-secondary mt-1">
            Manage your published and draft posts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <PenSquare className="w-4 h-4 mr-2" />
            New post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All ({posts.length})
        </FilterButton>
        <FilterButton 
          active={filter === 'published'} 
          onClick={() => setFilter('published')}
        >
          <Globe className="w-4 h-4 mr-1" />
          Published ({publishedCount})
        </FilterButton>
        <FilterButton 
          active={filter === 'draft'} 
          onClick={() => setFilter('draft')}
        >
          <FileEdit className="w-4 h-4 mr-1" />
          Drafts ({draftCount})
        </FilterButton>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] divide-y divide-border">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <Link 
                    href={`/dashboard/edit/${post.id}`}
                    className="text-lg font-semibold text-text-primary hover:text-accent transition-colors line-clamp-1"
                  >
                    {post.title}
                  </Link>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.published 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {post.published ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <FileEdit className="w-3 h-3" />
                          Draft
                        </>
                      )}
                    </span>
                    
                    {/* Date */}
                    <span>
                      {post.published_at 
                        ? formatDate(post.published_at)
                        : `Created ${formatDate(post.created_at)}`
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {post.published && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/edit/${post.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                    className="text-error hover:text-error hover:bg-error/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ filter }) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-12 text-center">
      <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
      <p className="text-text-secondary mb-4">
        {filter === 'published' && "You haven't published any posts yet."}
        {filter === 'draft' && "You don't have any drafts."}
        {filter === 'all' && "You haven't written any posts yet."}
      </p>
      <Button asChild>
        <Link href="/dashboard/new">
          <PenSquare className="w-4 h-4 mr-2" />
          Write your first post
        </Link>
      </Button>
    </div>
  );
}

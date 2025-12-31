/**
 * ============================================================================
 * DASHBOARD - SERIES LIST PAGE
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  FileText,
  Loader2,
  Search,
  Layers
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSeries, deleteSeries } from '@/modules/articles/services';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { cn } from '@/lib/utils';

export default function SeriesListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadSeries();
    }
  }, [user, authLoading]);

  async function loadSeries() {
    setLoading(true);
    const { data, error } = await getUserSeries(user.id);
    if (!error && data) {
      setSeries(data);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    setDeleting(true);
    const { error } = await deleteSeries(id);
    if (!error) {
      setSeries(prev => prev.filter(s => s.id !== id));
    }
    setDeleting(false);
    setDeleteConfirm(null);
  }

  const filteredSeries = series.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-6 h-6 text-accent" />
            My Series
          </h1>
          <p className="text-text-secondary mt-1">
            Group your posts into series for structured learning
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/series/new">
            <Plus className="w-4 h-4" />
            New Series
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          type="text"
          placeholder="Search series..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Layers className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {search ? 'No series found' : 'No series yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {search ? 'Try a different search term' : 'Create your first series to group related posts'}
          </p>
          {!search && (
            <Button asChild>
              <Link href="/dashboard/series/new">Create Series</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredSeries.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <SeriesCard
                  series={item}
                  onDelete={() => setDeleteConfirm(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-xl border border-border shadow-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">Delete Series?</h3>
              <p className="text-text-secondary mb-6">
                This will remove the series but keep all posts. Posts will no longer be grouped.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SeriesCard({ series, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Cover Image */}
        {series.cover_image_url ? (
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-inset">
            <img
              src={series.cover_image_url}
              alt={series.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg shrink-0 bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {series.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  series.published
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                )}>
                  {series.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {series.posts_count || 0} posts
                </span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-hover transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-text-secondary" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 z-20 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      <Link
                        href={`/dashboard/series/${series.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                      <Link
                        href={`/series/${series.slug}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {series.description && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">
              {series.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

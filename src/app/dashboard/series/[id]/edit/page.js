/**
 * ============================================================================
 * DASHBOARD - EDIT SERIES PAGE
 * ============================================================================
 */

'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  X,
  Layers,
  Save,
  Globe,
  Eye,
  EyeOff,
  GripVertical,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getSeriesById, updateSeries, getPostsInSeries, uploadCoverImage } from '@/modules/articles/services';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { cn } from '@/lib/utils';

export default function EditSeriesPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [published, setPublished] = useState(false);
  const [posts, setPosts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && id) {
      loadSeries();
    }
  }, [user, authLoading, id]);

  async function loadSeries() {
    setLoading(true);
    
    const [seriesRes, postsRes] = await Promise.all([
      getSeriesById(id),
      getPostsInSeries(id)
    ]);

    if (seriesRes.data) {
      setTitle(seriesRes.data.title || '');
      setDescription(seriesRes.data.description || '');
      setCoverPreview(seriesRes.data.cover_image_url || null);
      setPublished(seriesRes.data.published || false);
    }

    if (postsRes.data) {
      setPosts(postsRes.data);
    }

    setLoading(false);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(publish = null) {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let cover_image_url = coverPreview;

      // Upload new cover image if selected
      if (coverImage) {
        const { data: imageData, error: imageError } = await uploadCoverImage(coverImage);
        if (imageError) {
          throw new Error('Failed to upload cover image');
        }
        cover_image_url = imageData.url;
      }

      // Update series
      const { data, error: updateError } = await updateSeries(id, {
        title: title.trim(),
        description: description.trim() || null,
        cover_image_url,
        published: publish !== null ? publish : published
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update series');
      }

      router.push('/dashboard/series');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-hover flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-6 h-6 text-accent" />
            Edit Series
          </h1>
          <p className="text-text-secondary">Update series details and manage posts</p>
        </div>
        <span className={cn(
          'text-sm px-3 py-1 rounded-full',
          published
            ? 'bg-success/10 text-success'
            : 'bg-warning/10 text-warning'
        )}>
          {published ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Cover Image
          </label>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-[3/1] bg-surface-inset">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-colors flex flex-col items-center justify-center gap-2 bg-surface"
            >
              <ImageIcon className="w-8 h-8 text-text-muted" />
              <span className="text-sm text-text-secondary">Click to upload cover image</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Series Title *
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Building a React App from Scratch"
            className="text-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will readers learn in this series?"
            rows={4}
            className={cn(
              'flex w-full rounded-[var(--radius-md)]',
              'border border-border bg-surface',
              'px-4 py-3 text-base text-text-primary',
              'placeholder:text-text-muted',
              'transition-colors duration-150',
              'shadow-sm resize-none',
              'hover:border-border-strong',
              'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent'
            )}
          />
        </div>

        {/* Posts in Series */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Posts in Series ({posts.length})
          </label>
          {posts.length === 0 ? (
            <div className="p-6 bg-surface rounded-xl border border-border text-center">
              <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-secondary text-sm">
                No posts added yet. Add posts when creating or editing a post.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
                >
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{post.title}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    post.published
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  )}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleSubmit()}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
          
          {published ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleSubmit(false)}
              disabled={saving}
            >
              <EyeOff className="w-4 h-4" />
              Unpublish
            </Button>
          ) : (
            <Button
              className="gap-2"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              <Globe className="w-4 h-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

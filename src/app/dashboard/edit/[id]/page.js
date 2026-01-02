/**
 * ============================================================================
 * EDIT POST PAGE - Clean & Focused
 * ============================================================================
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  FileEdit, 
  ArrowLeft, 
  Loader2,
  Image as ImageIcon,
  Check,
  X,
  Clock,
  Type,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  Trash2,
  Settings,
  Tag,
  Search,
  Star,
  AlertCircle,
  Folder
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { updatePost, deletePost, uploadCoverImage, getSeriesForSelect } from '@/modules/articles/services';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Editor } from '@/ui/Editor/Editor';
import { TOPIC_LIST } from '@/lib/constants';
import Link from 'next/link';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getWordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function getReadTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 200));
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TopBar({ 
  onBack, 
  onSave, 
  onPublish,
  onUnpublish,
  onSettings,
  onDelete,
  saving, 
  autoSaved, 
  wordCount, 
  readTime,
  isPublished
}) {
  return (
    <header className="sticky top-16 z-30 mb-6">
      {/* Glass-morphism container */}
      <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left - Navigation */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-hover hover:bg-surface-inset border border-border transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-primary" />
            </motion.button>
            
            {/* Status pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${isPublished ? 'bg-success/15' : 'bg-accent/15'}`}>
              <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-success' : 'bg-accent animate-pulse'}`} />
              <span className={`text-sm font-medium ${isPublished ? 'text-success' : 'text-accent'}`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Center - Status & Stats (hidden on small screens) */}
          <div className="hidden sm:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <AnimatePresence mode="wait">
                {autoSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 rounded-full"
                  >
                    <Check className="w-3 h-3 text-success" />
                    <span className="text-xs font-medium text-success">Saved</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Stats pill */}
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-background rounded-full border border-border/50">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Type className="w-3 h-3" />
                  <span className="font-medium text-text-secondary">{wordCount}</span>
                  <span className="text-text-muted/70">words</span>
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium text-text-secondary">{readTime}</span>
                  <span className="text-text-muted/70">min read</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="gap-2 text-text-secondary hover:text-text-primary"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="gap-2 text-error hover:text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSave} 
              disabled={saving} 
              className="gap-2 text-text-secondary hover:text-text-primary"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileEdit className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>

            {isPublished ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={onUnpublish} 
                  disabled={saving} 
                  className="gap-2"
                >
                  <FileEdit className="w-4 h-4" />
                  Unpublish
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  onClick={onPublish} 
                  disabled={saving} 
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Publish
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ErrorToast({ error, onDismiss }) {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (!error) return;
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => Math.max(0, prev - 2));
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [error, onDismiss]);
  
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed z-[100] right-4 bottom-4 md:right-6 md:bottom-auto md:top-24 w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="bg-error/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Error</p>
            <p className="text-sm text-white/90 mt-0.5">{error}</p>
          </div>
          <button 
            onClick={onDismiss} 
            className="text-white/80 hover:text-white flex-shrink-0 p-1 -mr-1 -mt-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <motion.div 
            className="h-full bg-white/50"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CoverImageUpload({ coverPreview, onUpload, onRemove, fileInputRef }) {
  return (
    <div className="relative">
      {coverPreview ? (
        <div className="relative group rounded-xl overflow-hidden">
          <img src={coverPreview} alt="Cover" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button size="sm" variant="outline" onClick={onUpload} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Replace
            </Button>
            <Button size="sm" variant="outline" onClick={onRemove} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={onUpload}
          className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-sm">Add cover image</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            e.target.form?.reset?.();
            onUpload(file);
          }
        }}
      />
    </div>
  );
}

// Tag Input Component
function TagInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex flex-wrap gap-2 p-2.5 min-h-[42px] rounded-lg border border-border bg-surface cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-md"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:bg-accent/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[80px] text-sm bg-transparent outline-none placeholder:text-text-muted"
        />
      </div>
      <p className="text-xs text-text-muted">
        Press Enter or comma to add. Max 10 tags.
      </p>
    </div>
  );
}

// Publish Panel - Desktop sidebar / Mobile modal
function PublishPanel({
  isOpen,
  onClose,
  onPublish,
  onSave,
  saving,
  title,
  excerpt,
  wordCount,
  readTime,
  seriesList,
  selectedSeries,
  setSelectedSeries,
  seriesOrder,
  setSeriesOrder,
  seriesDropdownOpen,
  setSeriesDropdownOpen,
  isPublished,
  tags,
  setTags,
  // Topic
  topic,
  setTopic,
  topicDropdownOpen,
  setTopicDropdownOpen,
  // SEO fields
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  featured,
  setFeatured,
  customReadTime,
  setCustomReadTime,
  // AI generation
  onAiGenerateTags,
  onAiGenerateTopic,
  aiGenerating
}) {
  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const panelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            {isPublished ? <Settings className="w-5 h-5 text-accent" /> : <Globe className="w-5 h-5 text-accent" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{isPublished ? 'Post Settings' : 'Publish'}</h2>
            <p className="text-sm text-text-secondary">Configure your post</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-hover flex items-center justify-center"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Post Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary">Post Details</h3>
          <div className="bg-surface-inset rounded-lg p-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Title</span>
              <span className="text-text-primary font-medium truncate max-w-[180px]">
                {title || 'Untitled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Words</span>
              <span className="text-text-primary">{wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Read time</span>
              <span className="text-text-primary">{readTime} min</span>
            </div>
          </div>
        </div>

        {/* Series Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            Series
          </h3>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setSeriesDropdownOpen(!seriesDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-hover transition-colors text-sm"
            >
              {selectedSeries ? (
                <span className="text-text-primary">{selectedSeries.title}</span>
              ) : (
                <span className="text-text-muted">Not part of a series</span>
              )}
              <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${seriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {seriesDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSeriesDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 z-20 bg-surface border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Create new series link */}
                    <Link
                      href="/dashboard/series/new"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-hover border-b border-border"
                    >
                      <Plus className="w-4 h-4" />
                      Create new series
                    </Link>

                    {/* Series list */}
                    <div className="max-h-40 overflow-y-auto">
                      {/* None option */}
                      <button
                        onClick={() => {
                          setSelectedSeries(null);
                          setSeriesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hover transition-colors ${!selectedSeries ? 'bg-hover' : ''}`}
                      >
                        <span className="text-text-secondary">No series</span>
                      </button>
                      {seriesList.map(series => (
                        <button
                          key={series.id}
                          onClick={() => {
                            setSelectedSeries(series);
                            setSeriesDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hover transition-colors flex items-center justify-between ${selectedSeries?.id === series.id ? 'bg-hover' : ''}`}
                        >
                          <span className="text-text-primary">{series.title}</span>
                          {selectedSeries?.id === series.id && <Check className="w-4 h-4 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Series order input */}
          {selectedSeries && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 px-1"
            >
              <span className="text-sm text-text-secondary">Part number:</span>
              <input
                type="number"
                min="1"
                value={seriesOrder}
                onChange={(e) => setSeriesOrder(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-surface text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </motion.div>
          )}
        </div>

        {/* Topic Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Folder className="w-4 h-4 text-accent" />
              Topic
            </h3>
            <motion.button
              onClick={onAiGenerateTopic}
              disabled={aiGenerating === 'topic'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all disabled:opacity-50 text-xs font-medium text-purple-600"
            >
              {aiGenerating === 'topic' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              AI Suggest
            </motion.button>
          </div>
          <p className="text-xs text-text-muted">
            Choose a topic to categorize your post.
          </p>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-hover transition-colors text-sm"
            >
              {topic ? (
                <span className="text-text-primary">{topic}</span>
              ) : (
                <span className="text-text-muted">Select a topic</span>
              )}
              <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${topicDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {topicDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTopicDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 z-20 bg-surface border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="max-h-48 overflow-y-auto">
                      {/* None option */}
                      <button
                        onClick={() => {
                          setTopic('');
                          setTopicDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hover transition-colors ${!topic ? 'bg-hover' : ''}`}
                      >
                        <span className="text-text-secondary">No topic</span>
                      </button>
                      {TOPIC_LIST.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setTopic(t);
                            setTopicDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hover transition-colors flex items-center justify-between ${topic === t ? 'bg-hover' : ''}`}
                        >
                          <span className="text-text-primary">{t}</span>
                          {topic === t && <Check className="w-4 h-4 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" />
              Tags
            </h3>
            <motion.button
              onClick={onAiGenerateTags}
              disabled={aiGenerating === 'tags'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all disabled:opacity-50 text-xs font-medium text-purple-600"
            >
              {aiGenerating === 'tags' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              AI Generate
            </motion.button>
          </div>
          <p className="text-xs text-text-muted">
            Tags help readers find your content.
          </p>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        {/* Featured & Read Time Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            Visibility
          </h3>
          
          {/* Featured Toggle */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:bg-hover transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Star className={`w-4 h-4 ${featured ? 'text-amber-500 fill-amber-500' : 'text-text-muted'}`} />
              <div>
                <span className="text-sm font-medium text-text-primary">Featured Post</span>
                <p className="text-xs text-text-muted">Show in featured section on homepage</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${featured ? 'bg-accent' : 'bg-hover'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${featured ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>

          {/* Custom Read Time */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-text-muted" />
              <div>
                <span className="text-sm font-medium text-text-primary">Read Time</span>
                <p className="text-xs text-text-muted">Auto: {readTime} min (override if needed)</p>
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="60"
              value={customReadTime || readTime}
              onChange={(e) => setCustomReadTime(Math.max(1, parseInt(e.target.value) || readTime))}
              className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-surface text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* SEO Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            SEO Settings
          </h3>
          <p className="text-xs text-text-muted">
            Customize how your post appears in search results and social shares.
          </p>
          
          {/* SEO Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Post title (used if empty)"}
              maxLength={70}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-text-muted"
            />
            <p className="text-xs text-text-muted">{(seoTitle || title || '').length}/70 characters</p>
          </div>

          {/* SEO Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={excerpt || "Excerpt will be used if empty"}
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-text-muted resize-none"
            />
            <p className="text-xs text-text-muted">{(seoDescription || excerpt || '').length}/160 characters</p>
          </div>
          
          {/* Preview */}
          <div className="p-3 rounded-lg border border-border bg-surface-inset">
            <p className="text-xs text-text-muted mb-2">Search Preview</p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-600 line-clamp-1">{seoTitle || title || 'Post Title'}</p>
              <p className="text-xs text-green-700">runtimemind.vercel.app/articles/post-slug</p>
              <p className="text-xs text-text-secondary line-clamp-2">{seoDescription || excerpt || 'Post description will appear here...'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-5 border-t border-border space-y-3">
        {isPublished ? (
          <Button onClick={onSave} disabled={saving} className="w-full gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onPublish} disabled={saving} className="w-full gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Now
              </>
            )}
          </Button>
        )}
        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Mobile: Bottom sheet */}
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="lg:hidden fixed inset-x-0 bottom-0 top-16 z-50 bg-surface rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {panelContent}
      </motion.div>

      {/* Desktop: Centered modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="hidden lg:flex lg:flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {panelContent}
      </motion.div>
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  
  // Series state
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesOrder, setSeriesOrder] = useState(1);
  const [seriesDropdownOpen, setSeriesDropdownOpen] = useState(false);

  // Tags state
  const [tags, setTags] = useState([]);

  // Topic state
  const [topic, setTopic] = useState('');
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);

  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [customReadTime, setCustomReadTime] = useState(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [error, setError] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(null); // 'title' | 'excerpt' | 'tags' | null
  const [aiSuggestions, setAiSuggestions] = useState(null); // For title suggestions modal

  // Computed values
  const plainText = getPlainText(content);
  const wordCount = getWordCount(plainText);
  const readTime = getReadTime(wordCount);

  // Load post and series on mount
  useEffect(() => {
    if (user) {
      loadPost();
      loadSeries();
    }
  }, [user, params.id]);

  async function loadPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, series:series_id(id, title)')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      setLoadError('Post not found');
      setLoading(false);
      return;
    }

    // Check ownership
    if (data.author_id !== user?.id) {
      setLoadError('You do not have permission to edit this post');
      setLoading(false);
      return;
    }

    setTitle(data.title);
    setExcerpt(data.excerpt || '');
    setContent(data.content);
    setIsPublished(data.published);
    setCoverPreview(data.cover_image_url);
    
    // Set series if exists
    if (data.series) {
      setSelectedSeries(data.series);
      setSeriesOrder(data.series_order || 1);
    }

    // Set tags if exists
    if (data.tags && Array.isArray(data.tags)) {
      setTags(data.tags);
    }

    // Set topic if exists
    if (data.topic) {
      setTopic(data.topic);
    }

    // Set SEO fields
    setSeoTitle(data.seo_title || '');
    setSeoDescription(data.seo_description || '');
    setFeatured(data.featured || false);
    setCustomReadTime(data.read_time_minutes || null);
    
    setLoading(false);
  }

  async function loadSeries() {
    const { data } = await getSeriesForSelect(user.id);
    if (data) {
      setSeriesList(data);
    }
  }

  // AI Generation function
  async function handleAiGenerate(type) {
    if (!plainText || plainText.length < 50) {
      setError('Write at least 50 characters of content to generate suggestions');
      return;
    }

    setAiGenerating(type);
    setError('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: plainText, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      if (type === 'title') {
        if (Array.isArray(data.result)) {
          setAiSuggestions({ type: 'title', options: data.result });
        } else {
          setTitle(data.result);
        }
      } else if (type === 'excerpt') {
        setExcerpt(data.result);
      } else if (type === 'tags') {
        if (Array.isArray(data.result)) {
          setTags(data.result.slice(0, 10));
        }
      } else if (type === 'topic') {
        if (data.result && TOPIC_LIST.includes(data.result)) {
          setTopic(data.result);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setAiGenerating(null);
    }
  }

  // Cleanup cover preview URL
  useEffect(() => {
    return () => {
      if (coverPreview && coverFile) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview, coverFile]);

  // Auto-save indicator
  useEffect(() => {
    if (!title && !content) return;
    
    const timer = setTimeout(() => {
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [title, content]);

  // Handlers
  const handleCoverUpload = (file) => {
    if (file instanceof File) {
      if (coverPreview && coverFile) URL.revokeObjectURL(coverPreview);
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleCoverRemove = () => {
    if (coverPreview && coverFile) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
  };

  // Validation function for publishing
  const validateForPublish = () => {
    if (!title.trim()) {
      setError('Please add a title for your post');
      return false;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return false;
    }
    if (title.trim().length > 200) {
      setError('Title must be less than 200 characters');
      return false;
    }
    if (!plainText || plainText.trim().length < 100) {
      setError('Content must be at least 100 characters to publish. Add more content or save as draft.');
      return false;
    }
    if (wordCount < 50) {
      setError('Post must have at least 50 words to publish. Add more content or save as draft.');
      return false;
    }
    return true;
  };

  // Handle publish/settings button click - validate first for unpublished posts
  const handlePublishClick = () => {
    // Only validate if not already published (publishing for first time)
    if (!isPublished && !validateForPublish()) {
      return;
    }
    setShowPublishModal(true);
  };

  const handleSave = async (publish = null) => {
    // Determine if we're publishing
    const isPublishing = publish === true || (publish === null && isPublished);
    
    // Validation for publishing (double-check)
    if (isPublishing && !validateForPublish()) {
      return;
    }
    
    // Basic validation for drafts
    if (!isPublishing) {
      if (!title.trim() && !plainText) {
        setError('Please add a title or some content before saving');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      // Auto-generate tags with AI when publishing without tags
      let finalTags = tags;
      if (isPublishing && tags.length === 0 && plainText && plainText.length >= 50) {
        try {
          const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: plainText, type: 'tags' }),
          });
          const data = await response.json();
          if (response.ok && Array.isArray(data.result)) {
            finalTags = data.result.slice(0, 10);
            setTags(finalTags); // Update UI
          }
        } catch (tagErr) {
          // Silently continue without tags if AI fails
          console.warn('Auto-tag generation failed:', tagErr);
        }
      }

      // Auto-generate topic with AI when publishing without topic
      let finalTopic = topic;
      if (isPublishing && !topic && plainText && plainText.length >= 50) {
        try {
          const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: plainText, type: 'topic' }),
          });
          const data = await response.json();
          if (response.ok && data.result) {
            finalTopic = data.result;
            setTopic(finalTopic); // Update UI
          }
        } catch (topicErr) {
          // Silently continue without topic if AI fails
          console.warn('Auto-topic generation failed:', topicErr);
        }
      }

      // Upload cover if new file
      let coverUrl = coverPreview;
      if (coverFile) {
        const { url, error: uploadError } = await uploadCoverImage(coverFile, user.id);
        if (uploadError) {
          setError('Failed to upload cover image');
          setSaving(false);
          return;
        }
        coverUrl = url;
      }

      // Build update object
      const updates = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content,
        cover_image_url: coverUrl || null,
        series_id: selectedSeries?.id || null,
        series_order: selectedSeries ? seriesOrder : null,
        tags: finalTags,
        topic: finalTopic || null,
        // SEO fields
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        featured: featured,
        read_time_minutes: customReadTime || readTime,
      };

      // Set publish state if specified
      if (publish !== null) {
        updates.published = publish;
        if (publish && !isPublished) {
          updates.published_at = new Date().toISOString();
        }
      }

      const { error: saveError } = await updatePost(params.id, updates);

      if (saveError) {
        setError(saveError.message);
        setSaving(false);
        return;
      }

      // Update local state
      if (publish !== null) {
        setIsPublished(publish);
      }
      setCoverFile(null); // Clear file after successful upload
      setShowPublishModal(false);
      
      // Show saved indicator
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
      
      setSaving(false);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    await deletePost(params.id);
    router.push('/dashboard/posts');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-error/10 border border-error/20 rounded-xl p-8">
          <X className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-primary mb-2">Error</h1>
          <p className="text-text-secondary mb-6">{loadError}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Bar */}
      <TopBar
        onBack={() => router.back()}
        onSave={() => handleSave()}
        onPublish={handlePublishClick}
        onUnpublish={() => handleSave(false)}
        onSettings={handlePublishClick}
        onDelete={handleDelete}
        saving={saving}
        autoSaved={autoSaved}
        wordCount={wordCount}
        readTime={readTime}
        isPublished={isPublished}
      />

      {/* Error Toast */}
      <AnimatePresence mode="wait">
        {error && <ErrorToast key="error-toast" error={error} onDismiss={() => setError('')} />}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Cover Image */}
          <CoverImageUpload
            coverPreview={coverPreview}
            onUpload={handleCoverUpload}
            onRemove={handleCoverRemove}
            fileInputRef={fileInputRef}
          />

          {/* Title with AI button */}
          <div className="flex items-start gap-2">
            <Input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-3xl md:text-4xl font-bold border-0 px-0 h-auto py-2 bg-transparent focus-visible:ring-0 placeholder:text-text-secondary"
            />
            <motion.button
              onClick={() => handleAiGenerate('title')}
              disabled={aiGenerating === 'title'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 mt-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all disabled:opacity-50"
              title="Generate title with AI"
            >
              {aiGenerating === 'title' ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              ) : (
                <Sparkles className="w-5 h-5 text-purple-500" />
              )}
            </motion.button>
          </div>

          {/* Excerpt with AI button */}
          <div className="flex items-start gap-2">
            <Input
              type="text"
              placeholder="Write a short excerpt... (optional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="flex-1 text-lg border-0 px-0 h-auto py-1 bg-transparent focus-visible:ring-0 placeholder:text-text-secondary text-text-primary"
            />
            <motion.button
              onClick={() => handleAiGenerate('excerpt')}
              disabled={aiGenerating === 'excerpt'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 mt-1 p-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all disabled:opacity-50"
              title="Generate excerpt with AI"
            >
              {aiGenerating === 'excerpt' ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-500" />
              )}
            </motion.button>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Editor */}
          <Editor data={content} onChange={setContent} />
        </div>
      </div>

      {/* Publish Panel - Desktop sidebar / Mobile modal */}
      <AnimatePresence>
        {showPublishModal && (
          <PublishPanel
            isOpen={showPublishModal}
            onClose={() => setShowPublishModal(false)}
            onPublish={() => handleSave(true)}
            onSave={() => handleSave()}
            saving={saving}
            title={title}
            excerpt={excerpt}
            wordCount={wordCount}
            readTime={readTime}
            seriesList={seriesList}
            selectedSeries={selectedSeries}
            setSelectedSeries={setSelectedSeries}
            seriesOrder={seriesOrder}
            setSeriesOrder={setSeriesOrder}
            seriesDropdownOpen={seriesDropdownOpen}
            setSeriesDropdownOpen={setSeriesDropdownOpen}
            isPublished={isPublished}
            tags={tags}
            setTags={setTags}
            topic={topic}
            setTopic={setTopic}
            topicDropdownOpen={topicDropdownOpen}
            setTopicDropdownOpen={setTopicDropdownOpen}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            seoDescription={seoDescription}
            setSeoDescription={setSeoDescription}
            featured={featured}
            setFeatured={setFeatured}
            customReadTime={customReadTime}
            setCustomReadTime={setCustomReadTime}
            onAiGenerateTags={() => handleAiGenerate('tags')}
            onAiGenerateTopic={() => handleAiGenerate('topic')}
            aiGenerating={aiGenerating}
          />
        )}
      </AnimatePresence>

      {/* AI Title Suggestions Modal */}
      <AnimatePresence>
        {aiSuggestions?.type === 'title' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setAiSuggestions(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">AI Title Suggestions</h3>
                  <p className="text-sm text-text-secondary">Choose one or edit manually</p>
                </div>
              </div>
              <div className="space-y-2">
                {aiSuggestions.options?.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTitle(suggestion);
                      setAiSuggestions(null);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-hover hover:border-accent/50 transition-all text-sm text-text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAiSuggestions(null)}
                className="mt-4 w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

/**
 * ============================================================================
 * COMMENTS SECTION COMPONENT
 * ============================================================================
 * 
 * Displays comments for a post and allows authenticated users to add comments.
 * Shows login prompt for unauthenticated users.
 * 
 * ============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, User, Trash2, Reply, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { 
  getCommentsByPostId, 
  createComment, 
  deleteComment 
} from '@/modules/articles/services';

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

/**
 * Single comment component
 */
function Comment({ comment, onDelete, onReply, currentUserId, isReply = false }) {
  const isOwner = currentUserId && currentUserId === comment.author_id;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setIsDeleting(true);
    await onDelete(comment.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author?.avatar_url ? (
          <img
            src={comment.author.avatar_url}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-4 h-4 text-accent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">
                {comment.author?.name || 'Anonymous'}
              </span>
              <span className="text-xs text-text-muted">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-text-muted hover:text-red-500 transition-colors p-1"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <p className="text-text-secondary text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Reply button */}
        {!isReply && currentUserId && (
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent mt-1 ml-1"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Comment form component
 */
function CommentForm({ postId, parentId = null, onSubmit, onCancel, placeholder = "Write a comment..." }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(content, parentId);
    setContent('');
    setIsSubmitting(false);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

/**
 * Login prompt for unauthenticated users
 */
function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 bg-surface border border-border rounded-xl">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <LogIn className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        Join the conversation
      </h3>
      <p className="text-text-secondary text-center mb-4 max-w-md">
        Sign in to leave a comment and engage with the community.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 border border-border text-text-primary rounded-lg font-medium hover:bg-surface-inset transition-colors"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

/**
 * Main comments section component
 */
export function CommentsSection({ postId, initialCount = 0 }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Organize comments into threads
  const { topLevel, replies } = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    return { topLevel, replies };
  }, [comments]);

  // Get replies for a comment
  const getReplies = (commentId) => replies.filter(r => r.parent_id === commentId);

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true);
      const { data, error } = await getCommentsByPostId(postId);
      if (!error) {
        setComments(data);
      }
      setIsLoading(false);
    }
    fetchComments();
  }, [postId]);

  // Handle new comment
  const handleSubmit = async (content, parentId) => {
    if (!user) return;

    const { data, error } = await createComment({
      postId,
      authorId: user.id,
      content,
      parentId,
    });

    if (!error && data) {
      // Add author info to the comment
      const newComment = {
        ...data,
        author: {
          id: user.id,
          name: user.user_metadata?.name || user.email,
          avatar_url: user.user_metadata?.avatar_url,
        },
      };
      setComments(prev => [...prev, newComment]);
    }
  };

  // Handle delete
  const handleDelete = async (commentId) => {
    const { success } = await deleteComment(commentId);
    if (success) {
      // Remove comment and its replies
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
    }
  };

  // Visible comments
  const visibleTopLevel = showAll ? topLevel : topLevel.slice(0, 5);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-text-primary">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-text-muted font-normal">({comments.length})</span>
          )}
        </h2>
      </div>

      {/* Comment form or login prompt */}
      {user ? (
        <div className="mb-6">
          <CommentForm postId={postId} onSubmit={handleSubmit} />
        </div>
      ) : (
        <div className="mb-6">
          <LoginPrompt />
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-inset" />
              <div className="flex-1">
                <div className="h-20 bg-surface-inset rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {visibleTopLevel.map(comment => (
              <div key={comment.id} className="space-y-3">
                <Comment
                  comment={comment}
                  onDelete={handleDelete}
                  onReply={setReplyingTo}
                  currentUserId={user?.id}
                />
                
                {/* Reply form */}
                {replyingTo === comment.id && user && (
                  <div className="ml-11">
                    <CommentForm
                      postId={postId}
                      parentId={comment.id}
                      onSubmit={handleSubmit}
                      onCancel={() => setReplyingTo(null)}
                      placeholder="Write a reply..."
                    />
                  </div>
                )}

                {/* Replies */}
                {getReplies(comment.id).map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    onDelete={handleDelete}
                    onReply={setReplyingTo}
                    currentUserId={user?.id}
                    isReply
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>

          {/* Show more/less */}
          {topLevel.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-sm text-accent hover:underline mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all {topLevel.length} comments
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default CommentsSection;

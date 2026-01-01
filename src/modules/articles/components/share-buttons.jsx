'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Linkedin, Link2, Check, Facebook } from 'lucide-react';
import { getAbsoluteUrl } from '@/lib/utils';

/**
 * Share Buttons Component
 * 
 * Provides share functionality for posts and series.
 * Supports Twitter/X, LinkedIn, Facebook, and copy link.
 */
export function ShareButtons({ 
  title, 
  url, 
  description,
  variant = 'default' // 'default' | 'compact' | 'vertical'
}) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Ensure we have an absolute URL for sharing
  const absoluteUrl = getAbsoluteUrl(url);

  // Encode for URLs
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedDescription = encodeURIComponent(description || title);

  // Share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}${description ? `%0A%0A${encodedDescription}` : ''}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}${description ? `%20-%20${encodedDescription}` : ''}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openShareWindow = (shareUrl) => {
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const buttonBase = "flex items-center justify-center transition-all duration-200";
  
  const variants = {
    default: {
      container: "flex items-center gap-2",
      button: `${buttonBase} w-9 h-9 rounded-lg border border-border bg-surface hover:bg-hover hover:border-accent/30`,
      icon: "w-4 h-4",
      label: "sr-only"
    },
    compact: {
      container: "flex items-center gap-1.5",
      button: `${buttonBase} w-8 h-8 rounded-md border border-border/50 bg-surface/50 hover:bg-hover hover:border-accent/30`,
      icon: "w-3.5 h-3.5",
      label: "sr-only"
    },
    vertical: {
      container: "flex flex-col gap-2",
      button: `${buttonBase} w-10 h-10 rounded-xl border border-border bg-surface hover:bg-hover hover:border-accent/30`,
      icon: "w-4 h-4",
      label: "sr-only"
    }
  };

  const styles = variants[variant] || variants.default;

  const buttons = [
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => openShareWindow(shareUrls.twitter),
      color: 'hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => openShareWindow(shareUrls.linkedin),
      color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/30'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => openShareWindow(shareUrls.facebook),
      color: 'hover:text-[#1877F2] hover:border-[#1877F2]/30'
    },
    {
      name: copied ? 'Copied!' : 'Copy link',
      icon: copied ? Check : Link2,
      action: copyToClipboard,
      color: copied ? 'text-success border-success/30' : 'hover:text-accent hover:border-accent/30'
    }
  ];

  return (
    <div className={styles.container}>
      {buttons.map((button) => (
        <motion.button
          key={button.name}
          onClick={button.action}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${styles.button} ${button.color} text-text-secondary`}
          title={button.name}
          aria-label={button.name}
        >
          <button.icon className={styles.icon} />
          <span className={styles.label}>{button.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

/**
 * Share Section Component
 * 
 * Full share section with label and buttons.
 */
export function ShareSection({ title, url, description }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        <Share2 className="w-4 h-4" />
        Share
      </span>
      <ShareButtons title={title} url={url} description={description} />
    </div>
  );
}

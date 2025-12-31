/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 * 
 * This file contains shared utility functions used across the application.
 * 
 * DESIGN PRINCIPLE: Single Responsibility
 * Each function does one thing well. Complex operations are composed from
 * these simple building blocks.
 * 
 * ============================================================================
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes intelligently.
 * 
 * WHY THIS EXISTS:
 * When composing components, we often need to merge class names from props
 * with default classes. Tailwind classes can conflict (e.g., 'p-4' and 'p-2').
 * This function:
 * 1. Uses clsx to handle conditional classes and arrays
 * 2. Uses tailwind-merge to resolve conflicts (later classes win)
 * 
 * EXAMPLE:
 * cn('p-4 text-red-500', isLarge && 'p-8', className)
 * If className='p-2 text-blue-500', result is 'p-2 text-blue-500'
 * 
 * @param {...(string|object|array)} inputs - Class names to merge
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date for display in the blog.
 * 
 * WHY CUSTOM FORMATTING:
 * - Consistent date display across the site
 * - Editorial style (e.g., "December 29, 2025" not "12/29/2025")
 * - Locale-aware but controlled
 * 
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
}

/**
 * Creates a URL-safe slug from a string.
 * 
 * WHY SLUGS MATTER FOR SEO:
 * - Clean URLs are more shareable
 * - Keywords in URL help search ranking
 * - Readable URLs build trust
 * 
 * EXAMPLE:
 * slugify("Hello World! How's It Going?") => "hello-world-hows-it-going"
 * 
 * @param {string} text - Text to slugify
 * @returns {string} - URL-safe slug
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars (except -)
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 * 
 * WHY:
 * - Consistent excerpt lengths in post cards
 * - Prevents layout breaking from long content
 * - Word-boundary aware (doesn't cut mid-word)
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '…';
}

/**
 * Calculates estimated reading time for content.
 * 
 * WHY SHOW READING TIME:
 * - Sets reader expectations
 * - Helps users decide what to read based on available time
 * - Common in editorial/blog design
 * 
 * @param {string} content - Article content (plain text or markdown)
 * @returns {number} - Estimated minutes to read
 */
export function calculateReadingTime(content) {
  if (!content) return 0;
  
  // Average reading speed: 200-250 words per minute
  // We use 200 for more comfortable reading estimate
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Checks if code is running on the server.
 * 
 * WHY:
 * Next.js components can run on both server and client.
 * Some operations (like accessing localStorage) only work client-side.
 * 
 * @returns {boolean}
 */
export function isServer() {
  return typeof window === 'undefined';
}

/**
 * Safely parses JSON with a fallback value.
 * 
 * WHY:
 * JSON.parse throws on invalid JSON. This provides safe fallback.
 * Useful for parsing localStorage values that might be corrupted.
 * 
 * @param {string} json - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed value or fallback
 */
export function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * ============================================================================
 * BLOG DATA CONTRACTS
 * ============================================================================
 * 
 * Type definitions and data contracts for the blog module.
 * 
 * WHY DATA CONTRACTS:
 * 
 * 1. EXPLICIT INTERFACES:
 *    Even without TypeScript, documenting shapes improves maintainability.
 *    Developers know what to expect from functions.
 * 
 * 2. DEPENDENCY INVERSION:
 *    Services return these shapes, components expect these shapes.
 *    The actual database can change without touching UI code.
 * 
 * 3. VALIDATION:
 *    Contracts can be used with runtime validation if needed.
 * 
 * ============================================================================
 */

/**
 * @typedef {Object} Author
 * @property {string} id - UUID
 * @property {string} name - Display name
 * @property {string|null} bio - Author biography
 * @property {string|null} avatar_url - Avatar image URL
 */

/**
 * @typedef {Object} Post
 * @property {string} id - UUID
 * @property {string} slug - URL-friendly identifier
 * @property {string} title - Post title
 * @property {string} content - Markdown content
 * @property {string|null} excerpt - Short description
 * @property {string|null} cover_image_url - Cover image URL
 * @property {string} author_id - Author UUID
 * @property {boolean} published - Publication status
 * @property {string|null} published_at - Publication timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} PostWithAuthor
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} content
 * @property {string|null} excerpt
 * @property {string|null} cover_image_url
 * @property {boolean} published
 * @property {string|null} published_at
 * @property {string} created_at
 * @property {Author} author - Joined author data
 */

/**
 * @typedef {Object} PostListItem
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string|null} excerpt
 * @property {string|null} cover_image_url
 * @property {string|null} published_at
 * @property {Author} author
 */

/**
 * @typedef {Object} CreatePostInput
 * @property {string} title
 * @property {string} content
 * @property {string} [excerpt]
 * @property {string} [cover_image_url]
 * @property {boolean} [published=false]
 */

/**
 * @typedef {Object} UpdatePostInput
 * @property {string} [title]
 * @property {string} [content]
 * @property {string} [excerpt]
 * @property {string} [cover_image_url]
 * @property {boolean} [published]
 */

/**
 * @typedef {Object} ServiceResult
 * @property {*} data - Result data (null on error)
 * @property {Object|null} error - Error object (null on success)
 * @property {string} error.message - Human-readable error message
 * @property {string} [error.code] - Error code for programmatic handling
 */

// Export empty object for ES module compatibility
// The actual types are JSDoc comments above
export {};

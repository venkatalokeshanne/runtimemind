/**
 * Blog services exports
 */
export {
  getPublishedPosts,
  getTrendingTags,
  getPostBySlug,
  getAllPostSlugs,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
  getPublishedPostCount,
  getPopularAuthors,
  uploadCoverImage,
  uploadImage,
  getRelatedPosts,
  getFollowingPosts,
  getTrendingPosts,
} from './posts';

export {
  getPublishedSeries,
  getSeriesBySlug,
  getSeriesById,
  getUserSeries,
  getSeriesForSelect,
  createSeries,
  updateSeries,
  deleteSeries,
  getPostsInSeries,
  getSeriesForPost,
  getSeriesPostsCount,
} from './series';

export {
  getUserBookmarks,
  isPostBookmarked,
  getBookmarkStatuses,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  // Series bookmarks
  getUserSeriesBookmarks,
  isSeriesBookmarked,
  getSeriesBookmarkStatuses,
  addSeriesBookmark,
  removeSeriesBookmark,
  toggleSeriesBookmark,
} from './bookmarks';

export {
  getFollowing,
  getFollowers,
  isFollowing,
  getFollowStatuses,
  followUser,
  unfollowUser,
  toggleFollow,
  getFollowerCount,
  getFollowingCount,
  getSuggestedUsers,
} from './follows';

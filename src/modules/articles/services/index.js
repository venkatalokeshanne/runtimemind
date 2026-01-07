/**
 * Blog services exports
 */
export {
  getPublishedPosts,
  getTrendingTags,
  getTopicsWithPosts,
  getPostsByTopic,
  getPostBySlug,
  getPostById,
  getAllPostSlugs,
  getPostsByAuthor,
  getAuthorById,
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
  incrementViewCount,
} from './posts';

export {
  getPublishedSeries,
  getAllPublishedSeries,
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

export {
  getCommentsByPostId,
  getCommentCount,
  createComment,
  updateComment,
  deleteComment,
} from './comments';

export {
  getLikeCount,
  hasUserLiked,
  getPostLikeInfo,
  likePost,
  unlikePost,
  toggleLike,
  getLikedPostIds,
} from './likes';

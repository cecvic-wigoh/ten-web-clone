/**
 * @ai-wp/deployer
 *
 * WordPress deployment system for AI-generated sites.
 *
 * Features:
 * - WordPress REST API client with authentication
 * - Media upload to WordPress library
 * - Page creation with Gutenberg block content
 * - Full site deployment orchestration
 * - Rollback support
 */

// Client
export {
  createWordPressClient,
  WordPressClientError,
  type WordPressClient,
  type WordPressClientConfig,
  type QueryParams,
} from './client';

// Media
export {
  createMediaUploader,
  type MediaUploader,
  type MediaItem,
  type ImageToUpload,
  type UploadOptions,
  type BatchUploadOptions,
} from './media';

// Pages
export {
  createPageManager,
  type PageManager,
  type Page,
  type PageInput,
  type PageQueryOptions,
  type DeleteOptions,
} from './pages';

// Deploy
export {
  createDeployer,
  createDeployerFromClient,
  type Deployer,
  type DeployerDependencies,
  type GeneratedSite,
  type SiteImage,
  type SitePage,
  type Navigation,
  type NavigationItem,
  type DeploymentResult,
  type DeploymentOptions,
  type DeploymentTiming,
  type MediaDeploymentResult,
  type PageDeploymentResult,
} from './deploy';

// Schemas
export {
  // Page schemas
  WPPageSchema,
  WPPostSchema,
  WPStatusSchema,
  parseWPPage,
  type WPPage,
  type WPPost,
  type WPStatus,

  // Media schemas
  WPMediaSchema,
  WPMediaDetailsSchema,
  WPMediaSizeSchema,
  parseWPMedia,
  type WPMedia,
  type WPMediaDetails,
  type WPMediaSize,

  // Menu schemas
  WPMenuSchema,
  WPMenuItemSchema,
  type WPMenu,
  type WPMenuItem,

  // User schemas
  WPUserSchema,
  type WPUser,

  // Error handling
  WPErrorSchema,
  WPRenderedSchema,
  parseWPError,
  isWPError,
  type WPError,
  type WPRendered,
  type PageResult,
  type MediaResult,
  type ErrorResult,
} from './schemas';

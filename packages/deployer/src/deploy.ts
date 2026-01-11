/**
 * WordPress Site Deployment Orchestrator
 *
 * Orchestrates full site deployment including media upload,
 * page creation, and navigation menu updates.
 */

import { type WordPressClient } from './client';
import { type MediaUploader, type MediaItem, createMediaUploader } from './media';
import { type PageManager, type Page, createPageManager } from './pages';

// ============================================================================
// Types
// ============================================================================

/**
 * Image definition for deployment
 */
export interface SiteImage {
  originalUrl: string;
  alt?: string;
  title?: string;
}

/**
 * Page definition for deployment
 */
export interface SitePage {
  title: string;
  slug: string;
  content: string;
  status: 'publish' | 'draft';
  meta?: Record<string, unknown>;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  title: string;
  url: string;
}

/**
 * Navigation configuration
 */
export interface Navigation {
  items: NavigationItem[];
}

/**
 * Generated site structure for deployment
 */
export interface GeneratedSite {
  pages: SitePage[];
  images: SiteImage[];
  navigation: Navigation;
}

/**
 * Deployment timing information
 */
export interface DeploymentTiming {
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

/**
 * Media deployment result
 */
export interface MediaDeploymentResult {
  originalUrl: string;
  wpUrl: string;
  id: number;
}

/**
 * Page deployment result
 */
export interface PageDeploymentResult {
  slug: string;
  url: string;
  id: number;
}

/**
 * Full deployment result
 */
export interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  pages: PageDeploymentResult[];
  media: MediaDeploymentResult[];
  errors?: string[];
  timing?: DeploymentTiming;
}

/**
 * Deployment options
 */
export interface DeploymentOptions {
  /** Deploy as draft (for preview) */
  dryRun?: boolean;
  /** Update navigation menu */
  updateNavigation?: boolean;
  /** Continue on page creation errors */
  continueOnError?: boolean;
}

/**
 * Deployer dependencies
 */
export interface DeployerDependencies {
  client: WordPressClient;
  mediaUploader: MediaUploader;
  pageManager: PageManager;
}

/**
 * Deployer interface
 */
export interface Deployer {
  /**
   * Deploy a full site to WordPress
   */
  deploy(site: GeneratedSite, options?: DeploymentOptions): Promise<DeploymentResult>;

  /**
   * Rollback a deployment
   */
  rollback(deploymentId: string): Promise<void>;

  /**
   * Get deployment status by ID
   */
  getDeploymentStatus(deploymentId: string): DeploymentResult | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique deployment ID
 */
function generateDeploymentId(): string {
  return `deploy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Replace image URLs in content
 */
function replaceImageUrls(
  content: string,
  urlMapping: Map<string, string>
): string {
  let result = content;
  for (const [originalUrl, wpUrl] of urlMapping.entries()) {
    // Replace all occurrences (in attributes, src, etc.)
    result = result.split(originalUrl).join(wpUrl);
  }
  return result;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a WordPress site deployer
 */
export function createDeployer(deps: DeployerDependencies): Deployer {
  const { client, mediaUploader, pageManager } = deps;

  // Store deployment results for rollback
  const deploymentHistory = new Map<string, DeploymentResult>();

  return {
    async deploy(
      site: GeneratedSite,
      options: DeploymentOptions = {}
    ): Promise<DeploymentResult> {
      const {
        dryRun = false,
        updateNavigation = false,
        continueOnError = false,
      } = options;

      const deploymentId = generateDeploymentId();
      const startedAt = new Date().toISOString();
      const errors: string[] = [];
      const mediaResults: MediaDeploymentResult[] = [];
      const pageResults: PageDeploymentResult[] = [];

      // URL mapping for image replacement
      const urlMapping = new Map<string, string>();

      try {
        // Step 1: Upload all images
        if (site.images.length > 0) {
          try {
            const imagesToUpload = site.images.map((img) => ({
              url: img.originalUrl,
              alt: img.alt,
              title: img.title,
            }));

            const uploadedMedia = await mediaUploader.uploadBatch(imagesToUpload, {
              continueOnError: true,
              concurrency: 3,
            });

            // Build URL mapping
            for (let i = 0; i < site.images.length; i++) {
              const original = site.images[i];
              const uploaded = uploadedMedia[i];
              if (uploaded) {
                urlMapping.set(original.originalUrl, uploaded.url);
                mediaResults.push({
                  originalUrl: original.originalUrl,
                  wpUrl: uploaded.url,
                  id: uploaded.id,
                });
              }
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Unknown upload error';
            errors.push(message);

            // If media upload fails entirely, we can't proceed
            const completedAt = new Date().toISOString();
            const result: DeploymentResult = {
              success: false,
              deploymentId,
              pages: [],
              media: [],
              errors,
              timing: {
                startedAt,
                completedAt,
                durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
              },
            };
            deploymentHistory.set(deploymentId, result);
            return result;
          }
        }

        // Step 2: Create/update pages with replaced image URLs
        for (const page of site.pages) {
          try {
            // Replace image URLs in content
            const updatedContent = replaceImageUrls(page.content, urlMapping);

            const createdPage = await pageManager.createOrUpdate({
              title: page.title,
              slug: page.slug,
              content: updatedContent,
              status: dryRun ? 'draft' : page.status,
              meta: page.meta,
            });

            pageResults.push({
              slug: createdPage.slug,
              url: createdPage.url,
              id: createdPage.id,
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : `Failed to create page: ${page.slug}`;
            errors.push(message);

            if (!continueOnError) {
              break;
            }
          }
        }

        // Step 3: Update navigation menu (if requested)
        if (updateNavigation && site.navigation.items.length > 0) {
          try {
            // WordPress menu API requires specific endpoints
            // This is a simplified implementation
            await client.post('/wp/v2/menus', {
              name: 'Main Navigation',
              items: site.navigation.items.map((item, index) => ({
                title: item.title,
                url: item.url,
                menu_order: index,
              })),
            });
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Failed to update navigation';
            errors.push(message);
            // Navigation failure is not critical
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown deployment error';
        errors.push(message);
      }

      const completedAt = new Date().toISOString();
      const success = errors.length === 0;

      const result: DeploymentResult = {
        success,
        deploymentId,
        pages: pageResults,
        media: mediaResults,
        errors: errors.length > 0 ? errors : undefined,
        timing: {
          startedAt,
          completedAt,
          durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
        },
      };

      // Store for potential rollback
      deploymentHistory.set(deploymentId, result);

      return result;
    },

    async rollback(deploymentId: string): Promise<void> {
      const deployment = deploymentHistory.get(deploymentId);

      if (!deployment) {
        throw new Error('Deployment not found');
      }

      const errors: string[] = [];

      // Delete pages
      for (const page of deployment.pages) {
        try {
          await pageManager.delete(page.id, { force: true });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : `Failed to delete page: ${page.slug}`;
          errors.push(message);
        }
      }

      // Delete media
      for (const media of deployment.media) {
        try {
          await mediaUploader.deleteById(media.id);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : `Failed to delete media: ${media.id}`;
          errors.push(message);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Rollback completed with errors: ${errors.join(', ')}`);
      }

      // Remove from history after successful rollback
      deploymentHistory.delete(deploymentId);
    },

    getDeploymentStatus(deploymentId: string): DeploymentResult | null {
      return deploymentHistory.get(deploymentId) || null;
    },
  };
}

/**
 * Create deployer with auto-created dependencies from client config
 */
export function createDeployerFromClient(client: WordPressClient): Deployer {
  return createDeployer({
    client,
    mediaUploader: createMediaUploader(client),
    pageManager: createPageManager(client),
  });
}

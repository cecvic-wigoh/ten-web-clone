/**
 * Tests for WordPress Site Deployment Orchestrator
 *
 * TDD: These tests define the expected behavior of the deployment system.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDeployer,
  type Deployer,
  type GeneratedSite,
  type DeploymentResult,
  type DeploymentOptions,
} from '../deploy';
import { type WordPressClient } from '../client';
import { type MediaUploader } from '../media';
import { type PageManager } from '../pages';

// Mock dependencies
vi.mock('../client', () => ({
  createWordPressClient: vi.fn(),
}));

vi.mock('../media', () => ({
  createMediaUploader: vi.fn(),
}));

vi.mock('../pages', () => ({
  createPageManager: vi.fn(),
}));

describe('Site Deployer', () => {
  let deployer: Deployer;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockMediaUploader: {
    upload: ReturnType<typeof vi.fn>;
    uploadBatch: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    deleteById: ReturnType<typeof vi.fn>;
  };
  let mockPageManager: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getBySlug: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    listAll: ReturnType<typeof vi.fn>;
    createOrUpdate: ReturnType<typeof vi.fn>;
  };

  const sampleSite: GeneratedSite = {
    pages: [
      {
        title: 'Home',
        slug: 'home',
        content: `<!-- wp:image {"url":"https://source.com/hero.jpg"} -->
<figure class="wp-block-image"><img src="https://source.com/hero.jpg" alt="Hero"/></figure>
<!-- /wp:image -->

<!-- wp:heading -->
<h2>Welcome</h2>
<!-- /wp:heading -->`,
        status: 'publish',
      },
      {
        title: 'About',
        slug: 'about',
        content: `<!-- wp:paragraph -->
<p>About us content.</p>
<!-- /wp:paragraph -->`,
        status: 'publish',
      },
    ],
    images: [
      {
        originalUrl: 'https://source.com/hero.jpg',
        alt: 'Hero image',
        title: 'Hero',
      },
    ],
    navigation: {
      items: [
        { title: 'Home', url: '/home/' },
        { title: 'About', url: '/about/' },
      ],
    },
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockMediaUploader = {
      upload: vi.fn(),
      uploadBatch: vi.fn(),
      getById: vi.fn(),
      deleteById: vi.fn(),
    };

    mockPageManager = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getBySlug: vi.fn(),
      getById: vi.fn(),
      listAll: vi.fn(),
      createOrUpdate: vi.fn(),
    };

    deployer = createDeployer({
      client: mockClient as unknown as WordPressClient,
      mediaUploader: mockMediaUploader as unknown as MediaUploader,
      pageManager: mockPageManager as unknown as PageManager,
    });
  });

  describe('createDeployer', () => {
    it('should create a deployer with required dependencies', () => {
      expect(deployer).toBeDefined();
      expect(deployer.deploy).toBeInstanceOf(Function);
      expect(deployer.rollback).toBeInstanceOf(Function);
      expect(deployer.getDeploymentStatus).toBeInstanceOf(Function);
    });
  });

  describe('deploy', () => {
    it('should upload images and create pages', async () => {
      // Mock image upload
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([
        {
          id: 100,
          url: 'https://example.com/wp-content/uploads/hero.jpg',
          alt: 'Hero image',
          title: 'Hero',
        },
      ]);

      // Mock page creation
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 2,
        slug: 'about',
        title: 'About',
        url: 'https://example.com/about/',
        status: 'publish',
      });

      const result = await deployer.deploy(sampleSite);

      expect(result.success).toBe(true);
      expect(result.pages).toHaveLength(2);
      expect(result.media).toHaveLength(1);
      expect(mockMediaUploader.uploadBatch).toHaveBeenCalled();
      expect(mockPageManager.createOrUpdate).toHaveBeenCalledTimes(2);
    });

    it('should replace image URLs in content', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([
        {
          id: 100,
          url: 'https://example.com/wp-content/uploads/hero.jpg',
          alt: 'Hero image',
          title: 'Hero',
        },
      ]);

      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockImplementation(async (page) => ({
        id: 1,
        slug: page.slug,
        title: page.title,
        content: page.content,
        url: `https://example.com/${page.slug}/`,
        status: page.status || 'publish',
      }));

      await deployer.deploy(sampleSite);

      // First call is home page - should have replaced image URL
      const homePageCall = (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      expect(homePageCall.content).toContain(
        'https://example.com/wp-content/uploads/hero.jpg'
      );
      expect(homePageCall.content).not.toContain('https://source.com/hero.jpg');
    });

    it('should generate deployment ID', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await deployer.deploy(sampleSite);

      expect(result.deploymentId).toBeDefined();
      expect(typeof result.deploymentId).toBe('string');
    });

    it('should handle deployment with no images', async () => {
      const siteWithoutImages: GeneratedSite = {
        pages: [
          {
            title: 'Simple Page',
            slug: 'simple',
            content: '<p>No images here</p>',
            status: 'publish',
          },
        ],
        images: [],
        navigation: { items: [] },
      };

      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 1,
        slug: 'simple',
        title: 'Simple Page',
        url: 'https://example.com/simple/',
        status: 'publish',
      });

      const result = await deployer.deploy(siteWithoutImages);

      expect(result.success).toBe(true);
      expect(result.media).toHaveLength(0);
    });

    it('should report partial failures', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);

      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockRejectedValueOnce(new Error('Failed to create About page'));

      const result = await deployer.deploy(sampleSite);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContain('Failed to create About page');
      expect(result.pages).toHaveLength(1); // Only successful page
    });

    it('should handle image upload failures gracefully', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockRejectedValueOnce(new Error('Upload failed'));

      const result = await deployer.deploy(sampleSite);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Upload failed');
    });

    it('should track deployment timing', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await deployer.deploy(sampleSite);

      expect(result.timing).toBeDefined();
      expect(result.timing?.startedAt).toBeDefined();
      expect(result.timing?.completedAt).toBeDefined();
      expect(result.timing?.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should deploy pages as draft when dryRun is true', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockImplementation(async (page) => ({
        id: 1,
        slug: page.slug,
        title: page.title,
        url: `https://example.com/${page.slug}/`,
        status: page.status,
      }));

      await deployer.deploy(sampleSite, { dryRun: true });

      const calls = (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mock.calls;
      expect(calls.every((call) => call[0].status === 'draft')).toBe(true);
    });
  });

  describe('rollback', () => {
    it('should delete pages from deployment', async () => {
      // First deploy
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([
        { id: 100, url: 'https://example.com/hero.jpg', alt: '', title: '' },
      ]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 2,
        slug: 'about',
        title: 'About',
        url: 'https://example.com/about/',
        status: 'publish',
      });

      const deployment = await deployer.deploy(sampleSite);

      // Now rollback
      (mockPageManager.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined
      );
      (mockMediaUploader.deleteById as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined
      );

      await deployer.rollback(deployment.deploymentId!);

      expect(mockPageManager.delete).toHaveBeenCalledWith(1, { force: true });
      expect(mockPageManager.delete).toHaveBeenCalledWith(2, { force: true });
      expect(mockMediaUploader.deleteById).toHaveBeenCalledWith(100);
    });

    it('should throw if deployment ID not found', async () => {
      await expect(deployer.rollback('nonexistent-id')).rejects.toThrow(
        'Deployment not found'
      );
    });

    it('should handle partial rollback failures', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });

      const site: GeneratedSite = {
        pages: [sampleSite.pages[0]],
        images: [],
        navigation: { items: [] },
      };

      const deployment = await deployer.deploy(site);

      (mockPageManager.delete as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      await expect(deployer.rollback(deployment.deploymentId!)).rejects.toThrow();
    });
  });

  describe('getDeploymentStatus', () => {
    it('should return deployment status', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await deployer.deploy(sampleSite);
      const status = deployer.getDeploymentStatus(result.deploymentId!);

      expect(status).toBeDefined();
      expect(status?.success).toBe(result.success);
      expect(status?.pages).toEqual(result.pages);
    });

    it('should return null for unknown deployment', () => {
      const status = deployer.getDeploymentStatus('unknown-id');
      expect(status).toBeNull();
    });
  });

  describe('URL replacement', () => {
    it('should replace multiple occurrences of the same URL', async () => {
      const siteWithDuplicateImages: GeneratedSite = {
        pages: [
          {
            title: 'Gallery',
            slug: 'gallery',
            content: `<img src="https://source.com/image.jpg"/><img src="https://source.com/image.jpg"/>`,
            status: 'publish',
          },
        ],
        images: [{ originalUrl: 'https://source.com/image.jpg', alt: 'Image' }],
        navigation: { items: [] },
      };

      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([
        { id: 1, url: 'https://example.com/uploads/image.jpg', alt: 'Image', title: '' },
      ]);

      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockImplementation(async (page) => ({
        id: 1,
        slug: page.slug,
        title: page.title,
        content: page.content,
        url: `https://example.com/${page.slug}/`,
        status: page.status || 'publish',
      }));

      await deployer.deploy(siteWithDuplicateImages);

      const pageCall = (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      const occurrences = (
        pageCall.content.match(/https:\/\/example\.com\/uploads\/image\.jpg/g) || []
      ).length;
      expect(occurrences).toBe(2);
    });

    it('should replace URLs in block attributes', async () => {
      const siteWithBlockAttr: GeneratedSite = {
        pages: [
          {
            title: 'Page',
            slug: 'page',
            content: `<!-- wp:image {"url":"https://source.com/bg.jpg"} -->
<figure><img src="https://source.com/bg.jpg"/></figure>
<!-- /wp:image -->`,
            status: 'publish',
          },
        ],
        images: [{ originalUrl: 'https://source.com/bg.jpg', alt: 'BG' }],
        navigation: { items: [] },
      };

      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([
        { id: 1, url: 'https://example.com/uploads/bg.jpg', alt: 'BG', title: '' },
      ]);

      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockImplementation(async (page) => ({
        id: 1,
        slug: page.slug,
        title: page.title,
        content: page.content,
        url: `https://example.com/${page.slug}/`,
        status: page.status || 'publish',
      }));

      await deployer.deploy(siteWithBlockAttr);

      const pageCall = (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      expect(pageCall.content).toContain('"url":"https://example.com/uploads/bg.jpg"');
    });
  });

  describe('navigation menu', () => {
    it('should update navigation menu after deployment', async () => {
      (
        mockMediaUploader.uploadBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce([]);
      (
        mockPageManager.createOrUpdate as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        slug: 'home',
        title: 'Home',
        url: 'https://example.com/home/',
        status: 'publish',
      });
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await deployer.deploy(sampleSite, { updateNavigation: true });

      // Should have called to update navigation menu
      // Implementation will call WordPress menu API
      expect(mockClient.post).toHaveBeenCalled();
    });
  });
});

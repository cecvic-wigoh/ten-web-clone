/**
 * Tests for WordPress Page Manager
 *
 * TDD: These tests define the expected behavior of the page manager.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPageManager, type PageManager, type Page } from '../pages';
import { type WordPressClient } from '../client';

describe('Page Manager', () => {
  let pageManager: PageManager;
  let mockClient: {
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    pageManager = createPageManager(mockClient as unknown as WordPressClient);
  });

  describe('createPageManager', () => {
    it('should create a page manager with valid client', () => {
      expect(pageManager).toBeDefined();
      expect(pageManager.create).toBeInstanceOf(Function);
      expect(pageManager.update).toBeInstanceOf(Function);
      expect(pageManager.delete).toBeInstanceOf(Function);
      expect(pageManager.getBySlug).toBeInstanceOf(Function);
      expect(pageManager.getById).toBeInstanceOf(Function);
    });
  });

  describe('create', () => {
    it('should create a page with block content', async () => {
      const blockContent = `<!-- wp:heading -->
<h2 class="wp-block-heading">Welcome</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Content here.</p>
<!-- /wp:paragraph -->`;

      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: { rendered: 'Home Page' },
        content: { rendered: blockContent },
        link: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await pageManager.create({
        title: 'Home Page',
        slug: 'home',
        content: blockContent,
        status: 'publish',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/wp/v2/pages', {
        title: 'Home Page',
        slug: 'home',
        content: blockContent,
        status: 'publish',
      });
      expect(result).toEqual({
        id: 1,
        slug: 'home',
        title: 'Home Page',
        content: blockContent,
        url: 'https://example.com/home/',
        status: 'publish',
      });
    });

    it('should create a draft page by default', async () => {
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 2,
        slug: 'draft-page',
        title: { rendered: 'Draft' },
        content: { rendered: '' },
        link: 'https://example.com/?p=2',
        status: 'draft',
      });

      await pageManager.create({
        title: 'Draft',
        slug: 'draft-page',
        content: '',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/wp/v2/pages', {
        title: 'Draft',
        slug: 'draft-page',
        content: '',
        status: 'draft',
      });
    });

    it('should handle page meta', async () => {
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 3,
        slug: 'about',
        title: { rendered: 'About' },
        content: { rendered: '' },
        link: 'https://example.com/about/',
        status: 'publish',
        meta: { _yoast_wpseo_metadesc: 'Description' },
      });

      await pageManager.create({
        title: 'About',
        slug: 'about',
        content: '',
        status: 'publish',
        meta: { _yoast_wpseo_metadesc: 'Description' },
      });

      expect(mockClient.post).toHaveBeenCalledWith('/wp/v2/pages', {
        title: 'About',
        slug: 'about',
        content: '',
        status: 'publish',
        meta: { _yoast_wpseo_metadesc: 'Description' },
      });
    });

    it('should set parent page', async () => {
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 4,
        slug: 'child-page',
        title: { rendered: 'Child' },
        content: { rendered: '' },
        link: 'https://example.com/parent/child-page/',
        status: 'publish',
        parent: 1,
      });

      await pageManager.create({
        title: 'Child',
        slug: 'child-page',
        content: '',
        status: 'publish',
        parent: 1,
      });

      expect(mockClient.post).toHaveBeenCalledWith('/wp/v2/pages', {
        title: 'Child',
        slug: 'child-page',
        content: '',
        status: 'publish',
        parent: 1,
      });
    });
  });

  describe('update', () => {
    it('should update an existing page', async () => {
      (mockClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: { rendered: 'Updated Title' },
        content: { rendered: 'New content' },
        link: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await pageManager.update(1, {
        title: 'Updated Title',
        content: 'New content',
      });

      expect(mockClient.put).toHaveBeenCalledWith('/wp/v2/pages/1', {
        title: 'Updated Title',
        content: 'New content',
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should allow partial updates', async () => {
      (mockClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: { rendered: 'Home' },
        content: { rendered: 'New content only' },
        link: 'https://example.com/home/',
        status: 'publish',
      });

      await pageManager.update(1, { content: 'New content only' });

      expect(mockClient.put).toHaveBeenCalledWith('/wp/v2/pages/1', {
        content: 'New content only',
      });
    });

    it('should update page status', async () => {
      (mockClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: { rendered: 'Home' },
        content: { rendered: '' },
        link: 'https://example.com/home/',
        status: 'draft',
      });

      const result = await pageManager.update(1, { status: 'draft' });

      expect(result.status).toBe('draft');
    });
  });

  describe('delete', () => {
    it('should delete a page', async () => {
      (mockClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined
      );

      await pageManager.delete(1);

      expect(mockClient.delete).toHaveBeenCalledWith('/wp/v2/pages/1', {
        force: true,
      });
    });

    it('should move to trash if not forced', async () => {
      (mockClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined
      );

      await pageManager.delete(1, { force: false });

      expect(mockClient.delete).toHaveBeenCalledWith('/wp/v2/pages/1', {
        force: false,
      });
    });
  });

  describe('getBySlug', () => {
    it('should find page by slug', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        {
          id: 1,
          slug: 'home',
          title: { rendered: 'Home Page' },
          content: { rendered: 'Content' },
          link: 'https://example.com/home/',
          status: 'publish',
        },
      ]);

      const result = await pageManager.getBySlug('home');

      expect(mockClient.get).toHaveBeenCalledWith('/wp/v2/pages', {
        slug: 'home',
      });
      expect(result).toEqual({
        id: 1,
        slug: 'home',
        title: 'Home Page',
        content: 'Content',
        url: 'https://example.com/home/',
        status: 'publish',
      });
    });

    it('should return null if page not found', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await pageManager.getBySlug('nonexistent');

      expect(result).toBeNull();
    });

    it('should search in any status', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        {
          id: 2,
          slug: 'draft-page',
          title: { rendered: 'Draft' },
          content: { rendered: '' },
          link: 'https://example.com/?p=2',
          status: 'draft',
        },
      ]);

      const result = await pageManager.getBySlug('draft-page', {
        status: 'draft',
      });

      expect(mockClient.get).toHaveBeenCalledWith('/wp/v2/pages', {
        slug: 'draft-page',
        status: 'draft',
      });
      expect(result?.status).toBe('draft');
    });
  });

  describe('getById', () => {
    it('should fetch page by ID', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'home',
        title: { rendered: 'Home Page' },
        content: { rendered: 'Content' },
        link: 'https://example.com/home/',
        status: 'publish',
      });

      const result = await pageManager.getById(1);

      expect(mockClient.get).toHaveBeenCalledWith('/wp/v2/pages/1');
      expect(result).toEqual({
        id: 1,
        slug: 'home',
        title: 'Home Page',
        content: 'Content',
        url: 'https://example.com/home/',
        status: 'publish',
      });
    });

    it('should return null for non-existent page', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Not found')
      );

      const result = await pageManager.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('listAll', () => {
    it('should list all pages', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        {
          id: 1,
          slug: 'home',
          title: { rendered: 'Home' },
          content: { rendered: '' },
          link: 'https://example.com/home/',
          status: 'publish',
        },
        {
          id: 2,
          slug: 'about',
          title: { rendered: 'About' },
          content: { rendered: '' },
          link: 'https://example.com/about/',
          status: 'publish',
        },
      ]);

      const result = await pageManager.listAll();

      expect(mockClient.get).toHaveBeenCalledWith('/wp/v2/pages', {
        per_page: 100,
        status: 'any',
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('createOrUpdate', () => {
    it('should create if page does not exist', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]); // No existing page
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 1,
        slug: 'new-page',
        title: { rendered: 'New Page' },
        content: { rendered: 'Content' },
        link: 'https://example.com/new-page/',
        status: 'publish',
      });

      const result = await pageManager.createOrUpdate({
        title: 'New Page',
        slug: 'new-page',
        content: 'Content',
        status: 'publish',
      });

      expect(mockClient.post).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should update if page exists', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        {
          id: 5,
          slug: 'existing',
          title: { rendered: 'Existing' },
          content: { rendered: 'Old content' },
          link: 'https://example.com/existing/',
          status: 'publish',
        },
      ]);
      (mockClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 5,
        slug: 'existing',
        title: { rendered: 'Updated' },
        content: { rendered: 'New content' },
        link: 'https://example.com/existing/',
        status: 'publish',
      });

      const result = await pageManager.createOrUpdate({
        title: 'Updated',
        slug: 'existing',
        content: 'New content',
        status: 'publish',
      });

      expect(mockClient.put).toHaveBeenCalledWith('/wp/v2/pages/5', {
        title: 'Updated',
        content: 'New content',
        status: 'publish',
      });
      expect(result.title).toBe('Updated');
    });
  });
});

/**
 * Tests for WordPress API Response Schemas
 *
 * TDD: These tests validate the Zod schemas for WordPress REST API responses.
 */

import { describe, it, expect } from 'vitest';
import {
  WPPageSchema,
  WPMediaSchema,
  WPErrorSchema,
  WPPostSchema,
  WPMenuSchema,
  WPMenuItemSchema,
  WPUserSchema,
  WPRenderedSchema,
  parseWPPage,
  parseWPMedia,
  parseWPError,
  isWPError,
} from '../schemas';

describe('WordPress API Schemas', () => {
  describe('WPRenderedSchema', () => {
    it('should parse rendered content object', () => {
      const data = { rendered: 'Hello World' };
      const result = WPRenderedSchema.parse(data);
      expect(result.rendered).toBe('Hello World');
    });

    it('should handle optional protected field', () => {
      const data = { rendered: 'Hello', protected: true };
      const result = WPRenderedSchema.parse(data);
      expect(result.protected).toBe(true);
    });
  });

  describe('WPPageSchema', () => {
    it('should parse a valid page response', () => {
      const pageData = {
        id: 123,
        date: '2024-01-15T10:00:00',
        date_gmt: '2024-01-15T15:00:00',
        guid: { rendered: 'https://example.com/?p=123' },
        modified: '2024-01-15T12:00:00',
        modified_gmt: '2024-01-15T17:00:00',
        slug: 'sample-page',
        status: 'publish',
        type: 'page',
        link: 'https://example.com/sample-page/',
        title: { rendered: 'Sample Page' },
        content: { rendered: '<p>Page content</p>' },
        excerpt: { rendered: '<p>Excerpt</p>' },
        author: 1,
        featured_media: 0,
        parent: 0,
        menu_order: 0,
        comment_status: 'closed',
        ping_status: 'closed',
        template: '',
        meta: {},
      };

      const result = WPPageSchema.parse(pageData);

      expect(result.id).toBe(123);
      expect(result.slug).toBe('sample-page');
      expect(result.status).toBe('publish');
      expect(result.title.rendered).toBe('Sample Page');
    });

    it('should parse page with minimal fields', () => {
      const minimalPage = {
        id: 1,
        slug: 'test',
        status: 'draft',
        link: 'https://example.com/?p=1',
        title: { rendered: 'Test' },
        content: { rendered: '' },
      };

      const result = WPPageSchema.parse(minimalPage);
      expect(result.id).toBe(1);
    });

    it('should reject invalid status', () => {
      const invalidPage = {
        id: 1,
        slug: 'test',
        status: 'invalid_status',
        link: 'https://example.com/',
        title: { rendered: 'Test' },
        content: { rendered: '' },
      };

      expect(() => WPPageSchema.parse(invalidPage)).toThrow();
    });
  });

  describe('WPMediaSchema', () => {
    it('should parse a valid media response', () => {
      const mediaData = {
        id: 456,
        date: '2024-01-15T10:00:00',
        date_gmt: '2024-01-15T15:00:00',
        guid: { rendered: 'https://example.com/uploads/image.jpg' },
        modified: '2024-01-15T12:00:00',
        modified_gmt: '2024-01-15T17:00:00',
        slug: 'image',
        status: 'inherit',
        type: 'attachment',
        link: 'https://example.com/image/',
        title: { rendered: 'My Image' },
        author: 1,
        caption: { rendered: 'Image caption' },
        alt_text: 'Alt text for image',
        media_type: 'image',
        mime_type: 'image/jpeg',
        source_url: 'https://example.com/wp-content/uploads/image.jpg',
        media_details: {
          width: 1920,
          height: 1080,
          file: '2024/01/image.jpg',
          sizes: {
            thumbnail: {
              file: 'image-150x150.jpg',
              width: 150,
              height: 150,
              source_url: 'https://example.com/uploads/image-150x150.jpg',
              mime_type: 'image/jpeg',
            },
          },
        },
      };

      const result = WPMediaSchema.parse(mediaData);

      expect(result.id).toBe(456);
      expect(result.source_url).toBe(
        'https://example.com/wp-content/uploads/image.jpg'
      );
      expect(result.alt_text).toBe('Alt text for image');
      expect(result.media_details?.width).toBe(1920);
    });

    it('should parse media without media_details', () => {
      const minimalMedia = {
        id: 1,
        slug: 'test',
        status: 'inherit',
        link: 'https://example.com/',
        title: { rendered: 'Test' },
        source_url: 'https://example.com/test.jpg',
        alt_text: '',
        media_type: 'image',
        mime_type: 'image/jpeg',
      };

      const result = WPMediaSchema.parse(minimalMedia);
      expect(result.id).toBe(1);
    });
  });

  describe('WPErrorSchema', () => {
    it('should parse WordPress error response', () => {
      const errorData = {
        code: 'rest_post_invalid_id',
        message: 'Invalid post ID.',
        data: { status: 404 },
      };

      const result = WPErrorSchema.parse(errorData);

      expect(result.code).toBe('rest_post_invalid_id');
      expect(result.message).toBe('Invalid post ID.');
      expect(result.data?.status).toBe(404);
    });

    it('should parse error without data', () => {
      const errorData = {
        code: 'rest_forbidden',
        message: 'Sorry, you are not allowed to do that.',
      };

      const result = WPErrorSchema.parse(errorData);
      expect(result.code).toBe('rest_forbidden');
    });
  });

  describe('WPMenuSchema', () => {
    it('should parse menu response', () => {
      const menuData = {
        id: 1,
        name: 'Main Menu',
        slug: 'main-menu',
        description: 'Primary navigation menu',
        locations: ['primary'],
        auto_add: false,
      };

      const result = WPMenuSchema.parse(menuData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Main Menu');
      expect(result.locations).toContain('primary');
    });
  });

  describe('WPMenuItemSchema', () => {
    it('should parse menu item response', () => {
      const menuItemData = {
        id: 10,
        title: { rendered: 'Home' },
        url: 'https://example.com/',
        menu_order: 1,
        parent: 0,
        object: 'page',
        object_id: 5,
        type: 'post_type',
        target: '',
        attr_title: '',
        classes: ['menu-item'],
        description: '',
        menus: 1,
      };

      const result = WPMenuItemSchema.parse(menuItemData);

      expect(result.id).toBe(10);
      expect(result.title.rendered).toBe('Home');
      expect(result.url).toBe('https://example.com/');
    });
  });

  describe('WPUserSchema', () => {
    it('should parse user response', () => {
      const userData = {
        id: 1,
        username: 'admin',
        name: 'Administrator',
        email: 'admin@example.com',
        url: '',
        description: '',
        link: 'https://example.com/author/admin/',
        slug: 'admin',
        roles: ['administrator'],
        capabilities: { edit_posts: true },
      };

      const result = WPUserSchema.parse(userData);

      expect(result.id).toBe(1);
      expect(result.username).toBe('admin');
      expect(result.roles).toContain('administrator');
    });
  });

  describe('Helper functions', () => {
    describe('parseWPPage', () => {
      it('should parse and transform page response', () => {
        const pageData = {
          id: 1,
          slug: 'test',
          status: 'publish',
          link: 'https://example.com/test/',
          title: { rendered: 'Test Page' },
          content: { rendered: '<p>Content</p>' },
        };

        const result = parseWPPage(pageData);

        expect(result).toEqual({
          id: 1,
          slug: 'test',
          title: 'Test Page',
          content: '<p>Content</p>',
          url: 'https://example.com/test/',
          status: 'publish',
        });
      });
    });

    describe('parseWPMedia', () => {
      it('should parse and transform media response', () => {
        const mediaData = {
          id: 1,
          slug: 'image',
          status: 'inherit',
          link: 'https://example.com/image/',
          title: { rendered: 'Image' },
          source_url: 'https://example.com/uploads/image.jpg',
          alt_text: 'Alt text',
          media_type: 'image',
          mime_type: 'image/jpeg',
        };

        const result = parseWPMedia(mediaData);

        expect(result).toEqual({
          id: 1,
          url: 'https://example.com/uploads/image.jpg',
          alt: 'Alt text',
          title: 'Image',
        });
      });
    });

    describe('parseWPError', () => {
      it('should parse error response', () => {
        const errorData = {
          code: 'rest_forbidden',
          message: 'Forbidden',
          data: { status: 403 },
        };

        const result = parseWPError(errorData);

        expect(result.code).toBe('rest_forbidden');
        expect(result.message).toBe('Forbidden');
        expect(result.status).toBe(403);
      });
    });

    describe('isWPError', () => {
      it('should return true for error response', () => {
        const errorData = {
          code: 'error',
          message: 'Something went wrong',
        };

        expect(isWPError(errorData)).toBe(true);
      });

      it('should return false for success response', () => {
        const successData = {
          id: 1,
          title: 'Success',
        };

        expect(isWPError(successData)).toBe(false);
      });
    });
  });
});

/**
 * Tests for WordPress Media Upload Handler
 *
 * TDD: These tests define the expected behavior of the media uploader.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMediaUploader,
  type MediaUploader,
  type MediaItem,
} from '../media';
import { type WordPressClient } from '../client';

// Helper to create a valid WP media response
function createWPMediaResponse(overrides: Partial<{
  id: number;
  source_url: string;
  alt_text: string;
  title: string;
}> = {}) {
  return {
    id: overrides.id ?? 123,
    slug: 'test-image',
    status: 'inherit',
    link: 'https://example.com/test-image/',
    title: { rendered: overrides.title ?? 'Test Image' },
    source_url: overrides.source_url ?? 'https://example.com/wp-content/uploads/test.jpg',
    alt_text: overrides.alt_text ?? '',
    media_type: 'image',
    mime_type: 'image/jpeg',
  };
}

// Mock fetch for image downloads
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Media Uploader', () => {
  let uploader: MediaUploader;
  let mockClient: {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    uploader = createMediaUploader(mockClient as unknown as WordPressClient);
    mockFetch.mockReset();
  });

  describe('createMediaUploader', () => {
    it('should create an uploader with valid client', () => {
      expect(uploader).toBeDefined();
      expect(uploader.upload).toBeInstanceOf(Function);
      expect(uploader.uploadBatch).toBeInstanceOf(Function);
      expect(uploader.getById).toBeInstanceOf(Function);
      expect(uploader.deleteById).toBeInstanceOf(Function);
    });
  });

  describe('upload', () => {
    it('should upload an image from URL', async () => {
      // Mock image download
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
        headers: new Headers({ 'content-type': 'image/jpeg' }),
      });

      // Mock WordPress upload response
      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createWPMediaResponse({
          id: 123,
          source_url: 'https://example.com/wp-content/uploads/2024/image.jpg',
          alt_text: 'Test image',
          title: 'Test Title',
        })
      );

      const result = await uploader.upload('https://source.com/image.jpg', {
        title: 'Test Title',
        alt: 'Test image',
      });

      expect(result).toEqual({
        id: 123,
        url: 'https://example.com/wp-content/uploads/2024/image.jpg',
        alt: 'Test image',
        title: 'Test Title',
      });
    });

    it('should detect content type from URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
        headers: new Headers({}), // No content-type header
      });

      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createWPMediaResponse({
          id: 124,
          source_url: 'https://example.com/uploads/image.png',
        })
      );

      await uploader.upload('https://source.com/photo.png');

      // Should have detected .png extension
      expect(mockClient.post).toHaveBeenCalled();
    });

    it('should throw on failed image download', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        uploader.upload('https://source.com/notfound.jpg')
      ).rejects.toThrow('Failed to download image');
    });

    it('should throw on failed WordPress upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
        headers: new Headers({ 'content-type': 'image/jpeg' }),
      });

      (mockClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Upload failed')
      );

      await expect(
        uploader.upload('https://source.com/image.jpg')
      ).rejects.toThrow();
    });

    it('should handle webp images', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
        headers: new Headers({ 'content-type': 'image/webp' }),
      });

      (mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createWPMediaResponse({
          id: 125,
          source_url: 'https://example.com/uploads/image.webp',
        })
      );

      const result = await uploader.upload('https://source.com/image.webp');

      expect(result.url).toContain('.webp');
    });
  });

  describe('uploadBatch', () => {
    it('should upload multiple images', async () => {
      const images = [
        { url: 'https://source.com/image1.jpg', title: 'Image 1' },
        { url: 'https://source.com/image2.jpg', title: 'Image 2' },
      ];

      // Mock downloads
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(100),
          headers: new Headers({ 'content-type': 'image/jpeg' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(100),
          headers: new Headers({ 'content-type': 'image/jpeg' }),
        });

      // Mock uploads
      (mockClient.post as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(
          createWPMediaResponse({
            id: 1,
            source_url: 'https://example.com/uploads/image1.jpg',
            title: 'Image 1',
          })
        )
        .mockResolvedValueOnce(
          createWPMediaResponse({
            id: 2,
            source_url: 'https://example.com/uploads/image2.jpg',
            title: 'Image 2',
          })
        );

      const results = await uploader.uploadBatch(images);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
    });

    it('should handle partial failures in batch', async () => {
      const images = [
        { url: 'https://source.com/image1.jpg' },
        { url: 'https://source.com/notfound.jpg' },
        { url: 'https://source.com/image3.jpg' },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(100),
          headers: new Headers({ 'content-type': 'image/jpeg' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(100),
          headers: new Headers({ 'content-type': 'image/jpeg' }),
        });

      (mockClient.post as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(
          createWPMediaResponse({
            id: 1,
            source_url: 'https://example.com/uploads/image1.jpg',
          })
        )
        .mockResolvedValueOnce(
          createWPMediaResponse({
            id: 3,
            source_url: 'https://example.com/uploads/image3.jpg',
          })
        );

      const results = await uploader.uploadBatch(images, {
        continueOnError: true,
      });

      expect(results).toHaveLength(2); // Only successful uploads
    });

    it('should respect concurrency limit', async () => {
      const images = Array.from({ length: 5 }, (_, i) => ({
        url: `https://source.com/image${i}.jpg`,
      }));

      let concurrent = 0;
      let maxConcurrent = 0;

      mockFetch.mockImplementation(async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 10));
        concurrent--;
        return {
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(100),
          headers: new Headers({ 'content-type': 'image/jpeg' }),
        };
      });

      (mockClient.post as ReturnType<typeof vi.fn>).mockImplementation(
        async () => createWPMediaResponse({
          id: Math.floor(Math.random() * 1000),
          source_url: 'https://example.com/uploads/image.jpg',
        })
      );

      await uploader.uploadBatch(images, { concurrency: 2 });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should fetch media by ID', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createWPMediaResponse({
          id: 123,
          source_url: 'https://example.com/uploads/image.jpg',
          alt_text: 'Alt text',
          title: 'Title',
        })
      );

      const result = await uploader.getById(123);

      expect(result).toEqual({
        id: 123,
        url: 'https://example.com/uploads/image.jpg',
        alt: 'Alt text',
        title: 'Title',
      });
    });

    it('should return null for non-existent media', async () => {
      (mockClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Not found')
      );

      const result = await uploader.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete media by ID', async () => {
      (mockClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined
      );

      await uploader.deleteById(123);

      expect(mockClient.delete).toHaveBeenCalledWith('/wp/v2/media/123', {
        force: true,
      });
    });
  });
});

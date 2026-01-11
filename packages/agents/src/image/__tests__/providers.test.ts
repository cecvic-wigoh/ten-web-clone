/**
 * Tests for Image Providers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createUnsplashProvider,
  createDalleProvider,
  UnsplashProvider,
  DalleProvider,
} from '../providers';

// Mock fetch for Unsplash API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('UnsplashProvider', () => {
  let provider: UnsplashProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = createUnsplashProvider({
      accessKey: 'test-unsplash-key',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('search', () => {
    it('should search for images with a query', async () => {
      const mockResponse = {
        results: [
          {
            id: 'abc123',
            urls: {
              raw: 'https://images.unsplash.com/photo-abc?raw',
              full: 'https://images.unsplash.com/photo-abc?full',
              regular: 'https://images.unsplash.com/photo-abc?regular',
              small: 'https://images.unsplash.com/photo-abc?small',
              thumb: 'https://images.unsplash.com/photo-abc?thumb',
            },
            alt_description: 'Modern office workspace',
            width: 4000,
            height: 3000,
            user: {
              name: 'Jane Photographer',
              links: {
                html: 'https://unsplash.com/@jane',
              },
            },
            blur_hash: 'L6PZfSi_.AyE',
          },
        ],
        total: 1000,
        total_pages: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.search('modern office');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.images.length).toBe(1);
        expect(result.images[0].url).toContain('unsplash.com');
        expect(result.images[0].alt).toBe('Modern office workspace');
        expect(result.images[0].source).toBe('unsplash');
      }
    });

    it('should handle search options', async () => {
      const mockResponse = {
        results: [],
        total: 0,
        total_pages: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await provider.search('office', {
        count: 5,
        orientation: 'landscape',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=5'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('orientation=landscape'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await provider.search('office');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unsplash API error');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await provider.search('office');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('error');
      }
    });
  });

  describe('getRandomImage', () => {
    it('should get a random image for a query', async () => {
      const mockResponse = {
        id: 'random123',
        urls: {
          raw: 'https://images.unsplash.com/photo-random?raw',
          full: 'https://images.unsplash.com/photo-random?full',
          regular: 'https://images.unsplash.com/photo-random?regular',
          small: 'https://images.unsplash.com/photo-random?small',
          thumb: 'https://images.unsplash.com/photo-random?thumb',
        },
        alt_description: 'Abstract background',
        width: 1920,
        height: 1080,
        user: {
          name: 'Random Artist',
          links: {
            html: 'https://unsplash.com/@artist',
          },
        },
        blur_hash: 'L9PZfSi_ABC',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.getRandomImage('abstract background');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.image.url).toContain('unsplash.com');
        expect(result.image.source).toBe('unsplash');
      }
    });
  });

  describe('triggerDownload', () => {
    it('should trigger download tracking for Unsplash attribution', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://example.com/download' }),
      });

      await provider.triggerDownload('https://api.unsplash.com/photos/abc/download');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('download'),
        expect.any(Object)
      );
    });
  });
});

describe('DalleProvider', () => {
  let provider: DalleProvider;
  let mockOpenAI: { images: { generate: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenAI = {
      images: {
        generate: vi.fn(),
      },
    };

    provider = createDalleProvider({
      client: mockOpenAI as unknown as Parameters<typeof createDalleProvider>[0]['client'],
    });
  });

  describe('generate', () => {
    it('should generate an image from a prompt', async () => {
      const mockResponse = {
        data: [
          {
            url: 'https://oaidalleapiprodscus.blob.core.windows.net/generated-image.png',
            revised_prompt: 'A modern office workspace with natural lighting and plants',
          },
        ],
      };

      mockOpenAI.images.generate.mockResolvedValueOnce(mockResponse);

      const result = await provider.generate('modern office workspace with plants');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.image.url).toContain('oaidalleapiprodscus');
        expect(result.image.source).toBe('dalle');
        expect(result.image.alt).toBeDefined();
      }
    });

    it('should support size options', async () => {
      const mockResponse = {
        data: [
          {
            url: 'https://oaidalleapiprodscus.blob.core.windows.net/generated-1024.png',
            revised_prompt: 'Test prompt',
          },
        ],
      };

      mockOpenAI.images.generate.mockResolvedValueOnce(mockResponse);

      await provider.generate('test prompt', { size: '1024x1024' });

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '1024x1024',
        })
      );
    });

    it('should support style options', async () => {
      const mockResponse = {
        data: [
          {
            url: 'https://oaidalleapiprodscus.blob.core.windows.net/vivid.png',
            revised_prompt: 'Vivid style image',
          },
        ],
      };

      mockOpenAI.images.generate.mockResolvedValueOnce(mockResponse);

      await provider.generate('colorful abstract', { style: 'vivid' });

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          style: 'vivid',
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.images.generate.mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      );

      const result = await provider.generate('test prompt');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('error');
      }
    });

    it('should use dall-e-3 model by default', async () => {
      const mockResponse = {
        data: [
          {
            url: 'https://example.com/image.png',
            revised_prompt: 'Test',
          },
        ],
      };

      mockOpenAI.images.generate.mockResolvedValueOnce(mockResponse);

      await provider.generate('test');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dall-e-3',
        })
      );
    });
  });
});

describe('Provider factory functions', () => {
  it('should throw error if Unsplash access key is missing', () => {
    expect(() =>
      createUnsplashProvider({
        accessKey: '',
      })
    ).toThrow('Unsplash access key is required');
  });

  it('should throw error if OpenAI client is missing for DALL-E', () => {
    expect(() =>
      createDalleProvider({
        client: null as unknown as Parameters<typeof createDalleProvider>[0]['client'],
      })
    ).toThrow('OpenAI client is required');
  });
});

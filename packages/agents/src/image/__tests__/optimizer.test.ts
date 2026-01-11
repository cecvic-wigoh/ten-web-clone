/**
 * Tests for Image Optimization Utilities
 */
import { describe, it, expect } from 'vitest';
import {
  generateSrcset,
  getRecommendedSizes,
  createPlaceholderDataUrl,
  getWebPUrl,
  getSizeRecommendation,
  ImageUsage,
} from '../optimizer';
import type { Image } from '../schemas';

describe('generateSrcset', () => {
  it('should generate srcset for common breakpoints', () => {
    const baseUrl = 'https://images.unsplash.com/photo-123';
    const srcset = generateSrcset(baseUrl);

    expect(srcset.length).toBeGreaterThan(0);
    expect(srcset).toContainEqual(
      expect.objectContaining({
        width: expect.any(Number),
        url: expect.stringContaining('unsplash.com'),
      })
    );
  });

  it('should handle Unsplash URL parameters', () => {
    const baseUrl = 'https://images.unsplash.com/photo-123?ixlib=rb-4.0.3';
    const srcset = generateSrcset(baseUrl) as { url: string; width: number }[];

    // Should add width parameter correctly
    for (const entry of srcset) {
      expect(entry.url).toContain('w=');
    }
  });

  it('should use custom widths if provided', () => {
    const baseUrl = 'https://images.unsplash.com/photo-123';
    const customWidths = [320, 640, 960];
    const srcset = generateSrcset(baseUrl, { widths: customWidths }) as { url: string; width: number }[];

    expect(srcset.length).toBe(3);
    expect(srcset.map((s) => s.width)).toEqual(customWidths);
  });

  it('should format srcset as HTML attribute', () => {
    const baseUrl = 'https://images.unsplash.com/photo-123';
    const srcset = generateSrcset(baseUrl, { format: 'string' });

    // When format is 'string', result should be a comma-separated string
    expect(typeof srcset).toBe('string');
    expect(srcset).toContain(' 480w');
  });
});

describe('getRecommendedSizes', () => {
  it('should return sizes attribute for full-width images', () => {
    const sizes = getRecommendedSizes('full-width');
    expect(sizes).toBe('100vw');
  });

  it('should return sizes attribute for hero background', () => {
    const sizes = getRecommendedSizes('hero-background');
    expect(sizes).toContain('100vw');
  });

  it('should return sizes attribute for feature cards', () => {
    const sizes = getRecommendedSizes('feature-card');
    expect(sizes).toContain('max-width');
  });

  it('should return sizes attribute for gallery grid', () => {
    const sizes = getRecommendedSizes('gallery-grid');
    expect(sizes).toContain('vw');
  });

  it('should return sizes attribute for avatar', () => {
    const sizes = getRecommendedSizes('avatar');
    // Avatars are typically fixed size
    expect(sizes).toContain('px');
  });
});

describe('createPlaceholderDataUrl', () => {
  it('should create a blur placeholder from blur hash', async () => {
    const blurHash = 'L6PZfSi_.AyE_3t7t7R*~qIUayof';
    const placeholder = await createPlaceholderDataUrl(blurHash);

    expect(placeholder).toMatch(/^data:image\/[a-z+]+;base64,/);
  });

  it('should handle missing blur hash gracefully', async () => {
    const placeholder = await createPlaceholderDataUrl(undefined);

    // Should return a default solid color placeholder
    expect(placeholder).toMatch(/^data:image\//);
  });

  it('should respect custom dimensions', async () => {
    const blurHash = 'L6PZfSi_.AyE_3t7t7R*~qIUayof';
    const placeholder = await createPlaceholderDataUrl(blurHash, {
      width: 4,
      height: 3,
    });

    expect(placeholder).toMatch(/^data:image\//);
  });
});

describe('getWebPUrl', () => {
  it('should convert Unsplash URL to WebP format', () => {
    const originalUrl = 'https://images.unsplash.com/photo-123?ixlib=rb-4.0.3';
    const webpUrl = getWebPUrl(originalUrl);

    expect(webpUrl).toContain('fm=webp');
  });

  it('should preserve existing query parameters', () => {
    const originalUrl = 'https://images.unsplash.com/photo-123?w=800&q=80';
    const webpUrl = getWebPUrl(originalUrl);

    expect(webpUrl).toContain('w=800');
    expect(webpUrl).toContain('q=80');
    expect(webpUrl).toContain('fm=webp');
  });

  it('should handle URLs without query parameters', () => {
    const originalUrl = 'https://images.unsplash.com/photo-123';
    const webpUrl = getWebPUrl(originalUrl);

    expect(webpUrl).toContain('fm=webp');
  });

  it('should return original URL for non-Unsplash images', () => {
    const externalUrl = 'https://example.com/image.jpg';
    const result = getWebPUrl(externalUrl);

    // For non-Unsplash URLs, just return original (can't auto-convert)
    expect(result).toBe(externalUrl);
  });
});

describe('getSizeRecommendation', () => {
  it('should return recommended size for hero background', () => {
    const recommendation = getSizeRecommendation('hero-background');

    expect(recommendation).toEqual({
      width: expect.any(Number),
      height: expect.any(Number),
      aspectRatio: expect.any(String),
    });
    expect(recommendation.width).toBeGreaterThanOrEqual(1920);
  });

  it('should return recommended size for feature icon', () => {
    const recommendation = getSizeRecommendation('feature-icon');

    expect(recommendation.width).toBeLessThanOrEqual(400);
  });

  it('should return recommended size for testimonial avatar', () => {
    const recommendation = getSizeRecommendation('testimonial-avatar');

    // Avatars are small
    expect(recommendation.width).toBeLessThanOrEqual(200);
    expect(recommendation.aspectRatio).toBe('1:1');
  });

  it('should return recommended size for gallery image', () => {
    const recommendation = getSizeRecommendation('gallery-image');

    expect(recommendation.width).toBeGreaterThanOrEqual(800);
  });

  it('should return recommended size for logo', () => {
    const recommendation = getSizeRecommendation('logo');

    expect(recommendation.width).toBeLessThanOrEqual(400);
  });
});

describe('ImageUsage enum', () => {
  it('should include all common usage types', () => {
    const usages: ImageUsage[] = [
      'hero-background',
      'feature-card',
      'feature-icon',
      'testimonial-avatar',
      'gallery-image',
      'gallery-grid',
      'logo',
      'full-width',
      'avatar',
    ];

    for (const usage of usages) {
      expect(getSizeRecommendation(usage)).toBeDefined();
    }
  });
});

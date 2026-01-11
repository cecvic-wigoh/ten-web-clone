/**
 * Tests for Image Agent Schemas
 */
import { describe, it, expect } from 'vitest';
import {
  ImageSchema,
  ImageRequestSchema,
  ImageResultSchema,
  ImageBatchResultSchema,
  UnsplashImageSchema,
  DalleImageSchema,
  ImageOptimizationSchema,
  ImageStylePreset,
  ImageType,
  ImageSource,
} from '../schemas';

describe('ImageSchema', () => {
  it('should validate a complete image object', () => {
    const image = {
      url: 'https://images.unsplash.com/photo-123',
      alt: 'Modern office workspace',
      width: 1920,
      height: 1080,
      source: 'unsplash',
    };

    const result = ImageSchema.safeParse(image);
    expect(result.success).toBe(true);
  });

  it('should require url and alt', () => {
    const incompleteImage = {
      url: 'https://example.com/image.jpg',
    };

    const result = ImageSchema.safeParse(incompleteImage);
    expect(result.success).toBe(false);
  });

  it('should allow optional metadata', () => {
    const imageWithMetadata = {
      url: 'https://example.com/image.jpg',
      alt: 'Test image',
      width: 800,
      height: 600,
      source: 'dalle',
      blurDataUrl: 'data:image/jpeg;base64,/9j/4AAQ...',
      photographer: 'John Doe',
      photographerUrl: 'https://unsplash.com/@johndoe',
    };

    const result = ImageSchema.safeParse(imageWithMetadata);
    expect(result.success).toBe(true);
  });
});

describe('ImageRequestSchema', () => {
  it('should validate a basic image request', () => {
    const request = {
      sectionType: 'hero',
      context: 'A modern tech startup offering AI solutions',
      imageType: 'background',
    };

    const result = ImageRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should accept all valid image types', () => {
    const types = ['background', 'feature', 'avatar', 'logo', 'gallery'] as const;

    for (const imageType of types) {
      const request = {
        sectionType: 'hero',
        context: 'Test context',
        imageType,
      };
      const result = ImageRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    }
  });

  it('should accept optional style preference', () => {
    const request = {
      sectionType: 'features',
      context: 'Business consulting services',
      imageType: 'feature',
      style: 'photo',
    };

    const result = ImageRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should accept optional preferred source', () => {
    const request = {
      sectionType: 'hero',
      context: 'Unique custom brand imagery needed',
      imageType: 'background',
      preferredSource: 'dalle',
    };

    const result = ImageRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should accept optional count for multiple images', () => {
    const request = {
      sectionType: 'gallery',
      context: 'Restaurant interior and dishes',
      imageType: 'gallery',
      count: 6,
    };

    const result = ImageRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });
});

describe('ImageResultSchema', () => {
  it('should validate a successful image result', () => {
    const result = {
      success: true,
      image: {
        url: 'https://images.unsplash.com/photo-abc',
        alt: 'Professional team meeting',
        width: 1920,
        height: 1080,
        source: 'unsplash',
      },
    };

    const validated = ImageResultSchema.safeParse(result);
    expect(validated.success).toBe(true);
  });

  it('should validate an error result', () => {
    const errorResult = {
      success: false,
      error: 'No suitable images found for the given query',
    };

    const validated = ImageResultSchema.safeParse(errorResult);
    expect(validated.success).toBe(true);
  });
});

describe('ImageBatchResultSchema', () => {
  it('should validate multiple images', () => {
    const batchResult = {
      success: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1',
          alt: 'Image 1',
          width: 800,
          height: 600,
          source: 'unsplash',
        },
        {
          url: 'https://images.unsplash.com/photo-2',
          alt: 'Image 2',
          width: 800,
          height: 600,
          source: 'unsplash',
        },
      ],
    };

    const validated = ImageBatchResultSchema.safeParse(batchResult);
    expect(validated.success).toBe(true);
  });
});

describe('UnsplashImageSchema', () => {
  it('should validate Unsplash API response format', () => {
    const unsplashImage = {
      id: 'abc123',
      urls: {
        raw: 'https://images.unsplash.com/photo-abc?raw',
        full: 'https://images.unsplash.com/photo-abc?full',
        regular: 'https://images.unsplash.com/photo-abc?regular',
        small: 'https://images.unsplash.com/photo-abc?small',
        thumb: 'https://images.unsplash.com/photo-abc?thumb',
      },
      alt_description: 'A scenic mountain view',
      width: 4000,
      height: 3000,
      user: {
        name: 'John Photographer',
        links: {
          html: 'https://unsplash.com/@johnphotographer',
        },
      },
      blur_hash: 'L6PZfSi_.AyE_3t7t7R*~qIUayof',
    };

    const result = UnsplashImageSchema.safeParse(unsplashImage);
    expect(result.success).toBe(true);
  });
});

describe('DalleImageSchema', () => {
  it('should validate DALL-E API response format', () => {
    const dalleImage = {
      url: 'https://oaidalleapiprodscus.blob.core.windows.net/...',
      revised_prompt: 'A modern minimalist office space with natural lighting',
    };

    const result = DalleImageSchema.safeParse(dalleImage);
    expect(result.success).toBe(true);
  });

  it('should allow b64_json format', () => {
    const dalleImageB64 = {
      b64_json: '/9j/4AAQSkZJRgABAQAAAQABAAD...',
      revised_prompt: 'Abstract geometric pattern',
    };

    const result = DalleImageSchema.safeParse(dalleImageB64);
    expect(result.success).toBe(true);
  });
});

describe('ImageOptimizationSchema', () => {
  it('should validate optimization options', () => {
    const optimization = {
      srcset: [
        { url: 'https://example.com/image-480.webp', width: 480 },
        { url: 'https://example.com/image-800.webp', width: 800 },
        { url: 'https://example.com/image-1200.webp', width: 1200 },
      ],
      sizes: '(max-width: 480px) 100vw, (max-width: 800px) 50vw, 33vw',
      placeholderUrl: 'data:image/jpeg;base64,/9j/...',
      webpUrl: 'https://example.com/image.webp',
    };

    const result = ImageOptimizationSchema.safeParse(optimization);
    expect(result.success).toBe(true);
  });
});

describe('ImageStylePreset enum', () => {
  it('should include all expected styles', () => {
    const styles = ImageStylePreset.options;
    expect(styles).toContain('photo');
    expect(styles).toContain('illustration');
    expect(styles).toContain('abstract');
    expect(styles).toContain('minimal');
  });
});

describe('ImageType enum', () => {
  it('should include all expected image types', () => {
    const types = ImageType.options;
    expect(types).toContain('background');
    expect(types).toContain('feature');
    expect(types).toContain('avatar');
    expect(types).toContain('logo');
    expect(types).toContain('gallery');
  });
});

describe('ImageSource enum', () => {
  it('should include unsplash and dalle', () => {
    const sources = ImageSource.options;
    expect(sources).toContain('unsplash');
    expect(sources).toContain('dalle');
  });
});

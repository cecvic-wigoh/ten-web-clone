/**
 * Zod schemas for Image Agent output validation
 *
 * These schemas define the structure of image-related data
 * including requests, results, and API response formats.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

/**
 * Image style presets
 */
export const ImageStylePreset = z.enum([
  'photo',
  'illustration',
  'abstract',
  'minimal',
]);

export type ImageStylePreset = z.infer<typeof ImageStylePreset>;

/**
 * Types of images used in website sections
 */
export const ImageType = z.enum([
  'background',
  'feature',
  'avatar',
  'logo',
  'gallery',
]);

export type ImageType = z.infer<typeof ImageType>;

/**
 * Image sources
 */
export const ImageSource = z.enum(['unsplash', 'dalle']);

export type ImageSource = z.infer<typeof ImageSource>;

// ============================================================================
// Core Image Schema
// ============================================================================

/**
 * Standard image object
 */
export const ImageSchema = z.object({
  /** Image URL */
  url: z.string().url(),
  /** Alt text for accessibility */
  alt: z.string(),
  /** Image width in pixels */
  width: z.number().optional(),
  /** Image height in pixels */
  height: z.number().optional(),
  /** Source provider */
  source: ImageSource,
  /** Blur data URL for placeholder */
  blurDataUrl: z.string().optional(),
  /** Photographer name (Unsplash attribution) */
  photographer: z.string().optional(),
  /** Photographer profile URL (Unsplash attribution) */
  photographerUrl: z.string().url().optional(),
});

export type Image = z.infer<typeof ImageSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Request for a single image
 */
export const ImageRequestSchema = z.object({
  /** Section type (hero, features, testimonials, etc.) */
  sectionType: z.string(),
  /** Business/content context for query generation */
  context: z.string(),
  /** Type of image needed */
  imageType: ImageType,
  /** Optional style preference */
  style: ImageStylePreset.optional(),
  /** Preferred source (defaults to AI-recommended) */
  preferredSource: ImageSource.optional(),
  /** Number of images to return (for batch requests) */
  count: z.number().min(1).max(20).optional(),
});

export type ImageRequest = z.infer<typeof ImageRequestSchema>;

// ============================================================================
// Result Schemas
// ============================================================================

/**
 * Result from single image generation
 */
export const ImageResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    image: ImageSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type ImageResult = z.infer<typeof ImageResultSchema>;

/**
 * Result from batch image generation
 */
export const ImageBatchResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    images: z.array(ImageSchema),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type ImageBatchResult = z.infer<typeof ImageBatchResultSchema>;

// ============================================================================
// Provider-Specific Schemas (API Response Formats)
// ============================================================================

/**
 * Unsplash API response format
 */
export const UnsplashImageSchema = z.object({
  id: z.string(),
  urls: z.object({
    raw: z.string().url(),
    full: z.string().url(),
    regular: z.string().url(),
    small: z.string().url(),
    thumb: z.string().url(),
  }),
  alt_description: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  user: z.object({
    name: z.string(),
    links: z.object({
      html: z.string().url(),
    }),
  }),
  blur_hash: z.string().nullable().optional(),
});

export type UnsplashImage = z.infer<typeof UnsplashImageSchema>;

/**
 * Unsplash search response
 */
export const UnsplashSearchResponseSchema = z.object({
  results: z.array(UnsplashImageSchema),
  total: z.number(),
  total_pages: z.number(),
});

export type UnsplashSearchResponse = z.infer<typeof UnsplashSearchResponseSchema>;

/**
 * DALL-E API response format
 */
export const DalleImageSchema = z.object({
  url: z.string().url().optional(),
  b64_json: z.string().optional(),
  revised_prompt: z.string().optional(),
});

export type DalleImage = z.infer<typeof DalleImageSchema>;

// ============================================================================
// Optimization Schemas
// ============================================================================

/**
 * Srcset entry
 */
export const SrcsetEntrySchema = z.object({
  url: z.string().url(),
  width: z.number(),
});

export type SrcsetEntry = z.infer<typeof SrcsetEntrySchema>;

/**
 * Image optimization options
 */
export const ImageOptimizationSchema = z.object({
  /** Responsive srcset entries */
  srcset: z.array(SrcsetEntrySchema).optional(),
  /** Sizes attribute for responsive images */
  sizes: z.string().optional(),
  /** Placeholder/blur data URL */
  placeholderUrl: z.string().optional(),
  /** WebP version URL */
  webpUrl: z.string().url().optional(),
});

export type ImageOptimization = z.infer<typeof ImageOptimizationSchema>;

// ============================================================================
// Query Generation Schema
// ============================================================================

/**
 * AI-generated query for image search
 */
export const ImageQuerySchema = z.object({
  /** Search query for Unsplash */
  searchQuery: z.string(),
  /** DALL-E prompt for custom generation */
  dallePrompt: z.string(),
  /** Recommended source based on context */
  recommendedSource: ImageSource,
  /** Reasoning for the recommendation */
  reasoning: z.string().optional(),
});

export type ImageQuery = z.infer<typeof ImageQuerySchema>;

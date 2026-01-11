/**
 * Image Optimization Utilities
 *
 * Provides utilities for generating responsive srcsets, placeholders,
 * and size recommendations for different image usage contexts.
 */

import type { SrcsetEntry } from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Image usage contexts
 */
export type ImageUsage =
  | 'hero-background'
  | 'feature-card'
  | 'feature-icon'
  | 'testimonial-avatar'
  | 'gallery-image'
  | 'gallery-grid'
  | 'logo'
  | 'full-width'
  | 'avatar';

/**
 * Size recommendation for an image usage
 */
export interface SizeRecommendation {
  width: number;
  height: number;
  aspectRatio: string;
}

/**
 * Srcset generation options
 */
export interface SrcsetOptions {
  /** Custom widths to generate */
  widths?: number[];
  /** Output format: array of objects or string for HTML attribute */
  format?: 'array' | 'string';
  /** Quality parameter (0-100) */
  quality?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default responsive widths for srcset
 */
const DEFAULT_WIDTHS = [480, 640, 768, 1024, 1280, 1536, 1920];

/**
 * Size recommendations by usage
 */
const SIZE_RECOMMENDATIONS: Record<ImageUsage, SizeRecommendation> = {
  'hero-background': { width: 1920, height: 1080, aspectRatio: '16:9' },
  'feature-card': { width: 400, height: 300, aspectRatio: '4:3' },
  'feature-icon': { width: 128, height: 128, aspectRatio: '1:1' },
  'testimonial-avatar': { width: 80, height: 80, aspectRatio: '1:1' },
  'gallery-image': { width: 800, height: 600, aspectRatio: '4:3' },
  'gallery-grid': { width: 400, height: 400, aspectRatio: '1:1' },
  logo: { width: 200, height: 60, aspectRatio: '10:3' },
  'full-width': { width: 1920, height: 800, aspectRatio: '12:5' },
  avatar: { width: 64, height: 64, aspectRatio: '1:1' },
};

/**
 * Sizes attribute recommendations by usage
 */
const SIZES_RECOMMENDATIONS: Record<ImageUsage, string> = {
  'hero-background': '100vw',
  'feature-card': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  'feature-icon': '128px',
  'testimonial-avatar': '80px',
  'gallery-image': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  'gallery-grid': '(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw',
  logo: '200px',
  'full-width': '100vw',
  avatar: '64px',
};

// ============================================================================
// Srcset Generation
// ============================================================================

/**
 * Check if URL is from Unsplash
 */
function isUnsplashUrl(url: string): boolean {
  return url.includes('unsplash.com');
}

/**
 * Generate srcset for responsive images
 *
 * @param baseUrl - Base image URL
 * @param options - Generation options
 * @returns Array of srcset entries or string for HTML attribute
 */
export function generateSrcset(
  baseUrl: string,
  options?: SrcsetOptions
): SrcsetEntry[] | string {
  const widths = options?.widths || DEFAULT_WIDTHS;
  const quality = options?.quality || 80;
  const format = options?.format || 'array';

  const entries: SrcsetEntry[] = widths.map((width) => {
    let url: string;

    if (isUnsplashUrl(baseUrl)) {
      // Unsplash supports dynamic resizing via URL parameters
      const separator = baseUrl.includes('?') ? '&' : '?';
      url = `${baseUrl}${separator}w=${width}&q=${quality}&auto=format`;
    } else {
      // For other URLs, just append width as query param
      const separator = baseUrl.includes('?') ? '&' : '?';
      url = `${baseUrl}${separator}w=${width}`;
    }

    return { url, width };
  });

  if (format === 'string') {
    return entries.map((e) => `${e.url} ${e.width}w`).join(', ');
  }

  return entries;
}

// ============================================================================
// Sizes Attribute
// ============================================================================

/**
 * Get recommended sizes attribute for an image usage
 *
 * @param usage - How the image will be used
 * @returns CSS sizes attribute value
 */
export function getRecommendedSizes(usage: ImageUsage): string {
  return SIZES_RECOMMENDATIONS[usage] || '100vw';
}

// ============================================================================
// Placeholder Generation
// ============================================================================

/**
 * Create a blur placeholder data URL from blur hash
 *
 * @param blurHash - Unsplash blur hash or undefined
 * @param options - Size options for the placeholder
 * @returns Base64 data URL for placeholder
 */
export async function createPlaceholderDataUrl(
  blurHash: string | undefined,
  options?: { width?: number; height?: number }
): Promise<string> {
  const width = options?.width || 4;
  const height = options?.height || 3;

  if (!blurHash) {
    // Return a simple gray placeholder
    return createSolidColorPlaceholder('#e5e7eb', width, height);
  }

  // For now, return a simple gradient placeholder
  // In production, you would use the blurhash library to decode
  // Example: import { decode } from 'blurhash';
  // const pixels = decode(blurHash, width, height);

  // Since we can't decode blurhash without the library, return a themed placeholder
  return createSolidColorPlaceholder('#f3f4f6', width, height);
}

/**
 * Create a solid color placeholder data URL
 */
function createSolidColorPlaceholder(
  color: string,
  width: number,
  height: number
): string {
  // Create a minimal SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect fill="${color}" width="${width}" height="${height}"/></svg>`;
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// ============================================================================
// WebP Conversion
// ============================================================================

/**
 * Get WebP URL for an image (if supported by source)
 *
 * @param originalUrl - Original image URL
 * @returns URL with WebP format or original URL
 */
export function getWebPUrl(originalUrl: string): string {
  if (!isUnsplashUrl(originalUrl)) {
    // Can't auto-convert non-Unsplash URLs
    return originalUrl;
  }

  // Unsplash supports format conversion via URL parameter
  const url = new URL(originalUrl);
  url.searchParams.set('fm', 'webp');
  return url.toString();
}

// ============================================================================
// Size Recommendations
// ============================================================================

/**
 * Get recommended size for an image usage
 *
 * @param usage - How the image will be used
 * @returns Size recommendation with width, height, and aspect ratio
 */
export function getSizeRecommendation(usage: ImageUsage): SizeRecommendation {
  return SIZE_RECOMMENDATIONS[usage];
}

// ============================================================================
// Optimization Bundle
// ============================================================================

/**
 * Generate complete optimization data for an image
 *
 * @param url - Image URL
 * @param usage - How the image will be used
 * @param blurHash - Optional blur hash for placeholder
 * @returns Complete optimization data
 */
export async function generateOptimization(
  url: string,
  usage: ImageUsage,
  blurHash?: string
): Promise<{
  srcset: SrcsetEntry[];
  sizes: string;
  placeholderUrl: string;
  webpUrl: string;
  sizeRecommendation: SizeRecommendation;
}> {
  const srcset = generateSrcset(url) as SrcsetEntry[];
  const sizes = getRecommendedSizes(usage);
  const placeholderUrl = await createPlaceholderDataUrl(blurHash);
  const webpUrl = getWebPUrl(url);
  const sizeRecommendation = getSizeRecommendation(usage);

  return {
    srcset,
    sizes,
    placeholderUrl,
    webpUrl,
    sizeRecommendation,
  };
}

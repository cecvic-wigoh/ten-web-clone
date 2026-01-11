/**
 * Image Provider Implementations
 *
 * Provides interfaces to Unsplash and DALL-E APIs for fetching
 * and generating images.
 */

import type OpenAI from 'openai';
import {
  type Image,
  type UnsplashImage,
  UnsplashSearchResponseSchema,
} from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Unsplash search options
 */
export interface UnsplashSearchOptions {
  /** Number of results to return (default: 10) */
  count?: number;
  /** Image orientation filter */
  orientation?: 'landscape' | 'portrait' | 'squarish';
  /** Color filter */
  color?: string;
}

/**
 * Result from Unsplash search
 */
export type UnsplashSearchResult =
  | { success: true; images: Image[] }
  | { success: false; error: string };

/**
 * Result from Unsplash random image
 */
export type UnsplashRandomResult =
  | { success: true; image: Image }
  | { success: false; error: string };

/**
 * Unsplash provider interface
 */
export interface UnsplashProvider {
  /** Search for images */
  search(query: string, options?: UnsplashSearchOptions): Promise<UnsplashSearchResult>;
  /** Get a random image matching query */
  getRandomImage(query: string): Promise<UnsplashRandomResult>;
  /** Trigger download tracking for attribution */
  triggerDownload(downloadUrl: string): Promise<void>;
}

/**
 * DALL-E generation options
 */
export interface DalleGenerateOptions {
  /** Image size */
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  /** Generation style */
  style?: 'vivid' | 'natural';
  /** Quality setting */
  quality?: 'standard' | 'hd';
}

/**
 * Result from DALL-E generation
 */
export type DalleGenerateResult =
  | { success: true; image: Image }
  | { success: false; error: string };

/**
 * DALL-E provider interface
 */
export interface DalleProvider {
  /** Generate an image from a prompt */
  generate(prompt: string, options?: DalleGenerateOptions): Promise<DalleGenerateResult>;
}

// ============================================================================
// Unsplash Provider Configuration
// ============================================================================

/**
 * Configuration for Unsplash provider
 */
export interface UnsplashProviderConfig {
  /** Unsplash API access key */
  accessKey: string;
  /** Base URL for API (optional, for testing) */
  baseUrl?: string;
}

// ============================================================================
// Unsplash Provider Implementation
// ============================================================================

/**
 * Convert Unsplash API response to internal Image format
 */
function unsplashToImage(unsplash: UnsplashImage): Image {
  return {
    url: unsplash.urls.regular,
    alt: unsplash.alt_description || 'Image from Unsplash',
    width: unsplash.width,
    height: unsplash.height,
    source: 'unsplash',
    blurDataUrl: unsplash.blur_hash || undefined,
    photographer: unsplash.user.name,
    photographerUrl: unsplash.user.links.html,
  };
}

/**
 * Create an Unsplash provider instance
 */
export function createUnsplashProvider(config: UnsplashProviderConfig): UnsplashProvider {
  if (!config.accessKey) {
    throw new Error('Unsplash access key is required');
  }

  const baseUrl = config.baseUrl || 'https://api.unsplash.com';
  const headers = {
    Authorization: `Client-ID ${config.accessKey}`,
    'Accept-Version': 'v1',
  };

  return {
    async search(query: string, options?: UnsplashSearchOptions): Promise<UnsplashSearchResult> {
      try {
        const params = new URLSearchParams({
          query,
          per_page: String(options?.count || 10),
        });

        if (options?.orientation) {
          params.append('orientation', options.orientation);
        }

        if (options?.color) {
          params.append('color', options.color);
        }

        const response = await fetch(`${baseUrl}/search/photos?${params}`, {
          headers,
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Unsplash API error: ${response.status} ${response.statusText}`,
          };
        }

        const data = await response.json();
        const parsed = UnsplashSearchResponseSchema.safeParse(data);

        if (!parsed.success) {
          return {
            success: false,
            error: `Invalid Unsplash response: ${parsed.error.message}`,
          };
        }

        const images = parsed.data.results.map(unsplashToImage);

        return {
          success: true,
          images,
        };
      } catch (error) {
        return {
          success: false,
          error: `Unsplash search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },

    async getRandomImage(query: string): Promise<UnsplashRandomResult> {
      try {
        const params = new URLSearchParams({ query });

        const response = await fetch(`${baseUrl}/photos/random?${params}`, {
          headers,
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Unsplash API error: ${response.status} ${response.statusText}`,
          };
        }

        const data = await response.json() as UnsplashImage;
        const image = unsplashToImage(data);

        return {
          success: true,
          image,
        };
      } catch (error) {
        return {
          success: false,
          error: `Unsplash random error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },

    async triggerDownload(downloadUrl: string): Promise<void> {
      try {
        await fetch(downloadUrl, { headers });
      } catch {
        // Silently fail - this is just for attribution tracking
      }
    },
  };
}

// ============================================================================
// DALL-E Provider Configuration
// ============================================================================

/**
 * Configuration for DALL-E provider
 */
export interface DalleProviderConfig {
  /** OpenAI client instance */
  client: OpenAI;
  /** Default model (optional, defaults to dall-e-3) */
  model?: 'dall-e-2' | 'dall-e-3';
}

// ============================================================================
// DALL-E Provider Implementation
// ============================================================================

/**
 * Parse DALL-E image size to width/height
 */
function parseDalleSize(size: string): { width: number; height: number } {
  const [w, h] = size.split('x').map(Number);
  return { width: w, height: h };
}

/**
 * Create a DALL-E provider instance
 */
export function createDalleProvider(config: DalleProviderConfig): DalleProvider {
  if (!config.client) {
    throw new Error('OpenAI client is required');
  }

  const model = config.model || 'dall-e-3';

  return {
    async generate(
      prompt: string,
      options?: DalleGenerateOptions
    ): Promise<DalleGenerateResult> {
      try {
        const size = options?.size || '1024x1024';
        const { width, height } = parseDalleSize(size);

        const response = await config.client.images.generate({
          model,
          prompt,
          n: 1,
          size,
          style: options?.style || 'natural',
          quality: options?.quality || 'standard',
        });

        const imageData = response.data?.[0];

        if (!imageData || !imageData.url) {
          return {
            success: false,
            error: 'No image URL in DALL-E response',
          };
        }

        return {
          success: true,
          image: {
            url: imageData.url,
            alt: imageData.revised_prompt || prompt,
            width,
            height,
            source: 'dalle',
          },
        };
      } catch (error) {
        return {
          success: false,
          error: `DALL-E generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  };
}

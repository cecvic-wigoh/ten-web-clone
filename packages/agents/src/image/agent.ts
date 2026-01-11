/**
 * Image Agent
 *
 * AI agent that generates or selects images for website sections
 * using Unsplash and DALL-E with intelligent query generation.
 */

import { z } from 'zod';
import type { ClaudeClient } from '../client';
import type { TokenUsage } from '../types';
import type { UnsplashProvider, DalleProvider } from './providers';
import {
  type Image,
  type ImageRequest,
  ImageQuerySchema,
  type ImageQuery,
  type ImageSource,
  type ImageStylePreset,
} from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Successful image generation result
 */
export interface ImageGenerationSuccess {
  success: true;
  image: Image;
  usage?: TokenUsage;
}

/**
 * Failed image generation result
 */
export interface ImageGenerationError {
  success: false;
  error: string;
}

/**
 * Result from single image generation
 */
export type ImageGenerationResult = ImageGenerationSuccess | ImageGenerationError;

/**
 * Successful batch image generation result
 */
export interface ImageBatchGenerationSuccess {
  success: true;
  images: Image[];
  usage?: TokenUsage;
}

/**
 * Failed batch image generation result
 */
export interface ImageBatchGenerationError {
  success: false;
  error: string;
}

/**
 * Result from batch image generation
 */
export type ImageBatchGenerationResult =
  | ImageBatchGenerationSuccess
  | ImageBatchGenerationError;

/**
 * Query generation result
 */
export type QueryGenerationResult =
  | { success: true; searchQuery: string; dallePrompt: string; recommendedSource: ImageSource }
  | { success: false; error: string };

/**
 * Image agent interface
 */
export interface ImageAgent {
  /** Get a single image based on request */
  getImage(request: ImageRequest): Promise<ImageGenerationResult>;
  /** Get multiple images based on request */
  getImages(request: ImageRequest): Promise<ImageBatchGenerationResult>;
  /** Generate search query from context */
  generateQueryFromContext(request: ImageRequest): Promise<QueryGenerationResult>;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Image agent configuration
 */
export interface ImageAgentConfig {
  /** Claude client for query generation */
  claudeClient: ClaudeClient;
  /** Unsplash provider (required) */
  unsplashProvider: UnsplashProvider;
  /** DALL-E provider (optional) */
  dalleProvider?: DalleProvider;
}

// ============================================================================
// Prompts
// ============================================================================

/**
 * Build system prompt for image query generation
 */
function buildImageQuerySystemPrompt(): string {
  return `You are an expert at finding and describing images for websites. Your task is to generate optimal search queries for stock photos and prompts for AI-generated images.

## Output Format

Respond with valid JSON matching this exact schema:

{
  "searchQuery": "string (Unsplash search query, 2-5 keywords, specific and descriptive)",
  "dallePrompt": "string (DALL-E prompt, detailed and artistic, 20-50 words)",
  "recommendedSource": "unsplash" | "dalle",
  "reasoning": "string (brief explanation of your choice)"
}

## Guidelines

### For Search Queries (Unsplash):
- Use specific, descriptive keywords
- Include style modifiers like "minimal", "professional", "bright"
- Consider orientation (landscape for backgrounds, portrait for features)
- Avoid overly generic terms

### For DALL-E Prompts:
- Be detailed and descriptive
- Specify style, lighting, mood, and composition
- Use artistic terms when appropriate
- Avoid brand names or specific people

### Source Recommendations:
- Use **Unsplash** for:
  - Real photographs (people, places, products)
  - Professional business imagery
  - Nature and landscapes
  - Office and workspace scenes

- Use **DALL-E** for:
  - Abstract or artistic backgrounds
  - Custom illustrations
  - Unique brand-specific imagery
  - Conceptual or metaphorical visuals

Respond with valid JSON only.`;
}

/**
 * Build user prompt for image query generation
 */
function buildImageQueryUserPrompt(request: ImageRequest): string {
  let prompt = `Generate an image search query and DALL-E prompt for the following context:

**Section Type:** ${request.sectionType}
**Image Type:** ${request.imageType}
**Context:** ${request.context}`;

  if (request.style) {
    prompt += `\n**Style Preference:** ${request.style}`;
  }

  if (request.preferredSource) {
    prompt += `\n**Preferred Source:** ${request.preferredSource} (if suitable)`;
  }

  prompt += '\n\nRespond with valid JSON only.';

  return prompt;
}

// ============================================================================
// Agent Implementation
// ============================================================================

/**
 * Create an image agent
 */
export function createImageAgent(config: ImageAgentConfig): ImageAgent {
  const { claudeClient, unsplashProvider, dalleProvider } = config;

  /**
   * Generate search query from context using Claude
   */
  async function generateQuery(request: ImageRequest): Promise<{
    success: true;
    query: ImageQuery;
    usage?: TokenUsage;
  } | {
    success: false;
    error: string;
  }> {
    const result = await claudeClient.generateStructuredOutput({
      systemPrompt: buildImageQuerySystemPrompt(),
      userPrompt: buildImageQueryUserPrompt(request),
      schema: ImageQuerySchema,
      temperature: 0.7,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      query: result.data,
      usage: result.usage,
    };
  }

  /**
   * Try to get image from DALL-E
   */
  async function tryDalle(prompt: string): Promise<Image | null> {
    if (!dalleProvider) {
      return null;
    }

    const result = await dalleProvider.generate(prompt);
    if (result.success) {
      return result.image;
    }

    return null;
  }

  /**
   * Try to get image from Unsplash
   */
  async function tryUnsplash(query: string, count: number = 1): Promise<Image[] | null> {
    const result = await unsplashProvider.search(query, { count });
    if (result.success && result.images.length > 0) {
      return result.images;
    }

    return null;
  }

  return {
    async getImage(request: ImageRequest): Promise<ImageGenerationResult> {
      // Generate optimized search query
      const queryResult = await generateQuery(request);
      if (!queryResult.success) {
        return {
          success: false,
          error: queryResult.error,
        };
      }

      const { query, usage } = queryResult;
      const preferredSource = request.preferredSource || query.recommendedSource;

      // Try preferred source first
      if (preferredSource === 'dalle' && dalleProvider) {
        const image = await tryDalle(query.dallePrompt);
        if (image) {
          return { success: true, image, usage };
        }
      }

      // Try Unsplash
      const unsplashImages = await tryUnsplash(query.searchQuery);
      if (unsplashImages && unsplashImages.length > 0) {
        return { success: true, image: unsplashImages[0], usage };
      }

      // Fall back to DALL-E if Unsplash failed
      if (dalleProvider && preferredSource !== 'dalle') {
        const image = await tryDalle(query.dallePrompt);
        if (image) {
          return { success: true, image, usage };
        }
      }

      return {
        success: false,
        error: 'Failed to fetch image from all available sources',
      };
    },

    async getImages(request: ImageRequest): Promise<ImageBatchGenerationResult> {
      const count = request.count || 3;

      // Generate optimized search query
      const queryResult = await generateQuery(request);
      if (!queryResult.success) {
        return {
          success: false,
          error: queryResult.error,
        };
      }

      const { query, usage } = queryResult;

      // For batch requests, always use Unsplash (DALL-E is too slow/expensive)
      const images = await tryUnsplash(query.searchQuery, count);
      if (images && images.length > 0) {
        return { success: true, images, usage };
      }

      return {
        success: false,
        error: 'Failed to fetch images from Unsplash',
      };
    },

    async generateQueryFromContext(request: ImageRequest): Promise<QueryGenerationResult> {
      const result = await generateQuery(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        searchQuery: result.query.searchQuery,
        dallePrompt: result.query.dallePrompt,
        recommendedSource: result.query.recommendedSource,
      };
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get recommended image type for a section
 */
export function getImageTypeForSection(
  sectionType: string
): 'background' | 'feature' | 'avatar' | 'logo' | 'gallery' {
  switch (sectionType.toLowerCase()) {
    case 'hero':
      return 'background';
    case 'features':
      return 'feature';
    case 'testimonials':
      return 'avatar';
    case 'gallery':
      return 'gallery';
    case 'header':
    case 'footer':
      return 'logo';
    default:
      return 'feature';
  }
}

/**
 * Get recommended style for a section
 */
export function getStyleForSection(sectionType: string): ImageStylePreset {
  switch (sectionType.toLowerCase()) {
    case 'hero':
      return 'photo';
    case 'features':
      return 'minimal';
    case 'testimonials':
      return 'photo';
    case 'gallery':
      return 'photo';
    default:
      return 'photo';
  }
}

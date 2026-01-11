# Task 04: Image Agent

## Status: COMPLETE

## Summary

Built an Image Agent that generates or selects images for website sections using Unsplash and DALL-E APIs with intelligent query generation.

## Deliverables

### Files Created

| File | Description |
|------|-------------|
| `packages/agents/src/image/schemas.ts` | Zod schemas for images, requests, results, API responses |
| `packages/agents/src/image/providers.ts` | Unsplash and DALL-E API provider implementations |
| `packages/agents/src/image/optimizer.ts` | Image optimization utilities (srcset, sizes, placeholders) |
| `packages/agents/src/image/agent.ts` | Main image agent with AI-powered query generation |

### Files Modified

| File | Changes |
|------|---------|
| `packages/agents/package.json` | Added `openai` dependency |
| `packages/agents/src/index.ts` | Exported all image agent types and functions |

## Test Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| `src/image/__tests__/schemas.test.ts` | 18 | PASS |
| `src/image/__tests__/providers.test.ts` | 13 | PASS |
| `src/image/__tests__/optimizer.test.ts` | 22 | PASS |
| `src/image/__tests__/agent.test.ts` | 19 | PASS |
| **Total** | **72** | **ALL PASS** |

## Key Features

### 1. Image Providers

**Unsplash Provider:**
- `search(query, options)` - Search photos with count, orientation filters
- `getRandomImage(query)` - Get random matching image
- `triggerDownload(url)` - Attribution tracking for Unsplash TOS compliance

**DALL-E Provider:**
- `generate(prompt, options)` - Generate images with size/style/quality options
- Supports dall-e-2 and dall-e-3 models
- Size options: 1024x1024, 1792x1024, 1024x1792

### 2. Image Agent

- `getImage(request)` - Get single image with AI-generated query
- `getImages(request)` - Get multiple images for galleries
- `generateQueryFromContext(request)` - Generate search queries from context
- Intelligent source selection (Unsplash vs DALL-E) based on context
- Fallback behavior when preferred source fails

### 3. Image Optimizer

- `generateSrcset(url, options)` - Generate responsive srcset
- `getRecommendedSizes(usage)` - Get CSS sizes attribute by usage type
- `createPlaceholderDataUrl(blurHash)` - Create blur placeholder
- `getWebPUrl(url)` - Convert to WebP format for Unsplash
- `getSizeRecommendation(usage)` - Get dimensions by usage

## API

### ImageRequest Interface

```typescript
interface ImageRequest {
  sectionType: string;        // 'hero', 'features', 'testimonials', etc.
  context: string;            // Business description for query generation
  imageType: ImageType;       // 'background' | 'feature' | 'avatar' | 'logo' | 'gallery'
  style?: ImageStylePreset;   // 'photo' | 'illustration' | 'abstract' | 'minimal'
  preferredSource?: ImageSource; // 'unsplash' | 'dalle'
  count?: number;             // Number of images (for batch requests)
}
```

### Image Interface

```typescript
interface Image {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  source: 'unsplash' | 'dalle';
  blurDataUrl?: string;
  photographer?: string;       // Unsplash attribution
  photographerUrl?: string;    // Unsplash attribution
}
```

## Usage Example

```typescript
import {
  createClaudeClient,
  createImageAgent,
  createUnsplashProvider,
  createDalleProvider,
} from '@ai-wp/agents';
import OpenAI from 'openai';

// Create providers
const unsplash = createUnsplashProvider({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

const openai = new OpenAI();
const dalle = createDalleProvider({ client: openai });

// Create agent
const imageAgent = createImageAgent({
  claudeClient: createClaudeClient(),
  unsplashProvider: unsplash,
  dalleProvider: dalle,
});

// Get image for a hero section
const result = await imageAgent.getImage({
  sectionType: 'hero',
  context: 'A modern tech startup offering AI solutions',
  imageType: 'background',
  style: 'photo',
});

if (result.success) {
  console.log(result.image.url);
  console.log(result.image.alt);
}
```

## Integration Points

- **Claude Client**: Used for intelligent query generation from context
- **Content Agent**: Provides context about what images are needed
- **Block Engine**: Image URLs used for hero backgrounds, feature icons, testimonial avatars

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UNSPLASH_ACCESS_KEY` | Yes | Unsplash API access key |
| `OPENAI_API_KEY` | Optional | OpenAI API key for DALL-E (if using) |

## Checkpoints

- Phase 1 (Tests Written): VALIDATED (72 tests failing as expected)
- Phase 2 (Implementation): VALIDATED (all 72 tests passing)
- Phase 3 (Refactoring): VALIDATED (type-safe, clean code)
- Phase 4 (Documentation): VALIDATED (handoff complete)

## Notes

- Unsplash is preferred for real photography (people, places, products)
- DALL-E is recommended for abstract, custom, or conceptual imagery
- Agent intelligently selects source based on context analysis
- Optimization utilities work best with Unsplash URLs (dynamic resizing)
- Unsplash attribution must be displayed when using their images

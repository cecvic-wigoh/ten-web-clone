/**
 * Tests for the Image Agent
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createImageAgent,
  ImageAgent,
  ImageGenerationResult,
  ImageBatchGenerationResult,
} from '../agent';
import type { ClaudeClient } from '../../client';
import type { UnsplashProvider, DalleProvider } from '../providers';
import type { Image } from '../schemas';

// Mock image responses
const mockUnsplashImage: Image = {
  url: 'https://images.unsplash.com/photo-office',
  alt: 'Modern office workspace',
  width: 1920,
  height: 1080,
  source: 'unsplash',
  photographer: 'Jane Smith',
  photographerUrl: 'https://unsplash.com/@janesmith',
};

const mockDalleImage: Image = {
  url: 'https://oaidalleapiprodscus.blob.core.windows.net/image.png',
  alt: 'Custom generated abstract pattern',
  width: 1024,
  height: 1024,
  source: 'dalle',
};

// Create mock providers
function createMockUnsplashProvider(): UnsplashProvider {
  return {
    search: vi.fn().mockResolvedValue({
      success: true,
      images: [mockUnsplashImage],
    }),
    getRandomImage: vi.fn().mockResolvedValue({
      success: true,
      image: mockUnsplashImage,
    }),
    triggerDownload: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockDalleProvider(): DalleProvider {
  return {
    generate: vi.fn().mockResolvedValue({
      success: true,
      image: mockDalleImage,
    }),
  };
}

// Create mock Claude client for query generation
function createMockClaudeClient(searchQuery: string = 'modern office workspace'): ClaudeClient {
  return {
    generateStructuredOutput: vi.fn().mockResolvedValue({
      success: true,
      data: {
        searchQuery,
        dallePrompt: 'A professional modern office workspace with natural lighting',
        recommendedSource: 'unsplash',
        reasoning: 'Stock photography works well for office imagery',
      },
      usage: { inputTokens: 100, outputTokens: 50 },
    }),
    generateText: vi.fn().mockResolvedValue({
      success: true,
      text: searchQuery,
    }),
  } as unknown as ClaudeClient;
}

describe('createImageAgent', () => {
  it('should create an agent with required dependencies', () => {
    const agent = createImageAgent({
      claudeClient: createMockClaudeClient(),
      unsplashProvider: createMockUnsplashProvider(),
      dalleProvider: createMockDalleProvider(),
    });

    expect(agent).toBeDefined();
    expect(agent).toHaveProperty('getImage');
    expect(agent).toHaveProperty('getImages');
    expect(agent).toHaveProperty('generateQueryFromContext');
  });

  it('should work with only Unsplash provider', () => {
    const agent = createImageAgent({
      claudeClient: createMockClaudeClient(),
      unsplashProvider: createMockUnsplashProvider(),
    });

    expect(agent).toBeDefined();
  });
});

describe('ImageAgent.getImage', () => {
  let agent: ImageAgent;
  let mockUnsplash: ReturnType<typeof createMockUnsplashProvider>;
  let mockDalle: ReturnType<typeof createMockDalleProvider>;
  let mockClaude: ClaudeClient;

  beforeEach(() => {
    mockUnsplash = createMockUnsplashProvider();
    mockDalle = createMockDalleProvider();
    mockClaude = createMockClaudeClient();

    agent = createImageAgent({
      claudeClient: mockClaude,
      unsplashProvider: mockUnsplash,
      dalleProvider: mockDalle,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get an image based on section context', async () => {
    const result = await agent.getImage({
      sectionType: 'hero',
      context: 'A tech startup providing AI solutions for businesses',
      imageType: 'background',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.image).toBeDefined();
      expect(result.image.url).toBeDefined();
      expect(result.image.alt).toBeDefined();
    }
  });

  it('should use Claude to generate search queries', async () => {
    await agent.getImage({
      sectionType: 'hero',
      context: 'Organic coffee roasting company',
      imageType: 'background',
    });

    expect(mockClaude.generateStructuredOutput).toHaveBeenCalled();
  });

  it('should prefer specified source when provided', async () => {
    await agent.getImage({
      sectionType: 'hero',
      context: 'Test context',
      imageType: 'background',
      preferredSource: 'dalle',
    });

    expect(mockDalle.generate).toHaveBeenCalled();
  });

  it('should fall back to Unsplash if DALL-E fails', async () => {
    mockDalle.generate = vi.fn().mockResolvedValue({
      success: false,
      error: 'Rate limit exceeded',
    });

    const result = await agent.getImage({
      sectionType: 'hero',
      context: 'Test context',
      imageType: 'background',
      preferredSource: 'dalle',
    });

    expect(result.success).toBe(true);
    expect(mockUnsplash.search).toHaveBeenCalled();
  });

  it('should apply style preferences to search', async () => {
    await agent.getImage({
      sectionType: 'features',
      context: 'Modern design agency',
      imageType: 'feature',
      style: 'minimal',
    });

    // Claude should receive style context
    expect(mockClaude.generateStructuredOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: expect.stringContaining('minimal'),
      })
    );
  });

  it('should handle complete failure gracefully', async () => {
    mockUnsplash.search = vi.fn().mockResolvedValue({
      success: false,
      error: 'API unavailable',
    });
    mockDalle.generate = vi.fn().mockResolvedValue({
      success: false,
      error: 'API unavailable',
    });

    const result = await agent.getImage({
      sectionType: 'hero',
      context: 'Test context',
      imageType: 'background',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('ImageAgent.getImages', () => {
  let agent: ImageAgent;
  let mockUnsplash: ReturnType<typeof createMockUnsplashProvider>;

  beforeEach(() => {
    mockUnsplash = createMockUnsplashProvider();
    mockUnsplash.search = vi.fn().mockResolvedValue({
      success: true,
      images: [
        { ...mockUnsplashImage, url: 'https://unsplash.com/1' },
        { ...mockUnsplashImage, url: 'https://unsplash.com/2' },
        { ...mockUnsplashImage, url: 'https://unsplash.com/3' },
      ],
    });

    agent = createImageAgent({
      claudeClient: createMockClaudeClient(),
      unsplashProvider: mockUnsplash,
      dalleProvider: createMockDalleProvider(),
    });
  });

  it('should get multiple images for gallery sections', async () => {
    const result = await agent.getImages({
      sectionType: 'gallery',
      context: 'Restaurant interior and food photography',
      imageType: 'gallery',
      count: 3,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.images.length).toBe(3);
    }
  });

  it('should default to 3 images if count not specified', async () => {
    const result = await agent.getImages({
      sectionType: 'testimonials',
      context: 'Customer testimonials',
      imageType: 'avatar',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.images.length).toBeGreaterThan(0);
    }
  });
});

describe('ImageAgent.generateQueryFromContext', () => {
  let agent: ImageAgent;

  beforeEach(() => {
    agent = createImageAgent({
      claudeClient: createMockClaudeClient('artisan coffee beans'),
      unsplashProvider: createMockUnsplashProvider(),
      dalleProvider: createMockDalleProvider(),
    });
  });

  it('should generate search query from business context', async () => {
    const result = await agent.generateQueryFromContext({
      sectionType: 'hero',
      context: 'Artisan coffee roasting company',
      imageType: 'background',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.searchQuery).toBeDefined();
      expect(typeof result.searchQuery).toBe('string');
    }
  });

  it('should provide DALL-E prompt when appropriate', async () => {
    const result = await agent.generateQueryFromContext({
      sectionType: 'hero',
      context: 'Abstract tech company',
      imageType: 'background',
      style: 'abstract',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.dallePrompt).toBeDefined();
    }
  });

  it('should recommend source based on context', async () => {
    const result = await agent.generateQueryFromContext({
      sectionType: 'hero',
      context: 'Standard business website',
      imageType: 'background',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(['unsplash', 'dalle']).toContain(result.recommendedSource);
    }
  });
});

describe('ImageAgent with image type variations', () => {
  let agent: ImageAgent;

  beforeEach(() => {
    agent = createImageAgent({
      claudeClient: createMockClaudeClient(),
      unsplashProvider: createMockUnsplashProvider(),
      dalleProvider: createMockDalleProvider(),
    });
  });

  it('should handle hero background images', async () => {
    const result = await agent.getImage({
      sectionType: 'hero',
      context: 'Marketing agency',
      imageType: 'background',
    });

    expect(result.success).toBe(true);
  });

  it('should handle feature icons', async () => {
    const result = await agent.getImage({
      sectionType: 'features',
      context: 'Feature about security',
      imageType: 'feature',
    });

    expect(result.success).toBe(true);
  });

  it('should handle testimonial avatars', async () => {
    const result = await agent.getImage({
      sectionType: 'testimonials',
      context: 'Customer profile photo',
      imageType: 'avatar',
    });

    expect(result.success).toBe(true);
  });

  it('should handle logo images', async () => {
    const result = await agent.getImage({
      sectionType: 'header',
      context: 'Company logo placeholder',
      imageType: 'logo',
    });

    expect(result.success).toBe(true);
  });
});

describe('ImageGenerationResult type', () => {
  it('should discriminate success and error cases', () => {
    const successResult: ImageGenerationResult = {
      success: true,
      image: mockUnsplashImage,
      usage: { inputTokens: 100, outputTokens: 50 },
    };

    const errorResult: ImageGenerationResult = {
      success: false,
      error: 'Failed to fetch image',
    };

    if (successResult.success) {
      expect(successResult.image).toBeDefined();
    }

    if (!errorResult.success) {
      expect(errorResult.error).toBeDefined();
    }
  });
});

describe('ImageBatchGenerationResult type', () => {
  it('should handle multiple images', () => {
    const batchResult: ImageBatchGenerationResult = {
      success: true,
      images: [mockUnsplashImage, mockDalleImage],
      usage: { inputTokens: 100, outputTokens: 50 },
    };

    expect(batchResult.images.length).toBe(2);
  });
});

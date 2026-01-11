/**
 * Tests for the Structure Agent
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StructureAgent,
  createStructureAgent,
  GenerationResult,
} from '../structure/agent';
import { SiteStructureSchema } from '../structure/schemas';
import type { ClaudeClient } from '../client';

import type { SiteStructure } from '../structure/schemas';

// Mock response matching SiteStructure schema
const mockSiteStructure: SiteStructure = {
  pages: [
    {
      slug: 'home',
      title: 'Home',
      sections: [
        {
          type: 'hero',
          config: {
            heading: 'Welcome to Our Bakery',
            subheading: 'Fresh bread baked daily',
            buttonText: 'View Menu',
            buttonUrl: '/menu',
          },
        },
        {
          type: 'features',
          config: {
            title: 'Why Choose Us',
            features: [
              {
                title: 'Fresh Daily',
                description: 'All bread baked fresh every morning',
              },
              {
                title: 'Organic Ingredients',
                description: 'We use only the finest organic flour',
              },
              {
                title: 'Family Recipes',
                description: 'Recipes passed down through generations',
              },
            ],
          },
        },
        {
          type: 'testimonials',
          config: {
            title: 'What Our Customers Say',
            testimonials: [
              {
                quote: 'Best bread in town!',
                author: 'Jane Smith',
                role: 'Local Foodie',
              },
            ],
          },
        },
        {
          type: 'cta',
          config: {
            heading: 'Visit Us Today',
            description: 'Located in downtown. Open 7am-6pm daily.',
            buttonText: 'Get Directions',
            buttonUrl: '/contact',
          },
        },
        {
          type: 'footer',
          config: {
            columns: [
              {
                title: 'Quick Links',
                links: [
                  { text: 'Menu', url: '/menu' },
                  { text: 'About', url: '/about' },
                ],
              },
            ],
            copyright: '2024 Artisan Bakery',
          },
        },
      ],
    },
  ],
  theme: {
    colors: {
      primary: '#8B4513',
      secondary: '#DEB887',
      background: '#FFF8DC',
      foreground: '#2F1810',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
    },
  },
  navigation: {
    items: [
      { label: 'Home', url: '/', order: 1 },
      { label: 'Menu', url: '/menu', order: 2 },
      { label: 'About', url: '/about', order: 3 },
      { label: 'Contact', url: '/contact', order: 4 },
    ],
  },
};

// Create mock client
function createMockClient(
  response: unknown = mockSiteStructure
): ClaudeClient {
  return {
    generateStructuredOutput: vi.fn().mockResolvedValue({
      success: true,
      data: response,
      usage: { inputTokens: 500, outputTokens: 800 },
    }),
    generateText: vi.fn().mockResolvedValue({
      success: true,
      text: 'mock text',
    }),
  } as unknown as ClaudeClient;
}

describe('createStructureAgent', () => {
  it('should create an agent with a client', () => {
    const mockClient = createMockClient();
    const agent = createStructureAgent(mockClient);
    expect(agent).toBeDefined();
    expect(agent).toHaveProperty('generate');
  });
});

describe('StructureAgent.generate', () => {
  let mockClient: ClaudeClient;
  let agent: StructureAgent;

  beforeEach(() => {
    mockClient = createMockClient();
    agent = createStructureAgent(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a site structure from business description', async () => {
    const result = await agent.generate({
      businessDescription: 'A local bakery specializing in artisan bread',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.structure).toBeDefined();
      expect(result.structure.pages).toHaveLength(1);
      expect(result.structure.pages[0].slug).toBe('home');
    }
  });

  it('should validate output against schema', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const validation = SiteStructureSchema.safeParse(result.structure);
      expect(validation.success).toBe(true);
    }
  });

  it('should include sections that map to block patterns', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const sections = result.structure.pages[0].sections;
      const types = sections.map((s) => s.type);

      // Should have common sections
      expect(types).toContain('hero');
      expect(types).toContain('footer');
    }
  });

  it('should include theme configuration', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.structure.theme).toBeDefined();
      expect(result.structure.theme.colors).toBeDefined();
    }
  });

  it('should include navigation items', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.structure.navigation).toBeDefined();
      expect(result.structure.navigation.items.length).toBeGreaterThan(0);
    }
  });

  it('should return usage stats', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.usage).toBeDefined();
      expect(result.usage?.inputTokens).toBe(500);
      expect(result.usage?.outputTokens).toBe(800);
    }
  });

  it('should handle client errors gracefully', async () => {
    const errorClient = {
      generateStructuredOutput: vi.fn().mockResolvedValue({
        success: false,
        error: 'API rate limit exceeded',
      }),
      generateText: vi.fn(),
    } as unknown as ClaudeClient;

    const errorAgent = createStructureAgent(errorClient);
    const result = await errorAgent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should handle network errors', async () => {
    const networkErrorClient = {
      generateStructuredOutput: vi
        .fn()
        .mockRejectedValue(new Error('Network error')),
      generateText: vi.fn(),
    } as unknown as ClaudeClient;

    const errorAgent = createStructureAgent(networkErrorClient);
    const result = await errorAgent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('error');
    }
  });
});

describe('StructureAgent output mapping', () => {
  it('should generate hero config compatible with createHeroPattern', async () => {
    const mockClient = createMockClient();
    const agent = createStructureAgent(mockClient);

    const result = await agent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const heroSection = result.structure.pages[0].sections.find(
        (s) => s.type === 'hero'
      );
      expect(heroSection).toBeDefined();

      // Config should have fields for createHeroPattern
      const config = heroSection!.config;
      expect(config).toHaveProperty('heading');
      expect(config).toHaveProperty('subheading');
    }
  });

  it('should generate features config compatible with createFeaturesPattern', async () => {
    const mockClient = createMockClient();
    const agent = createStructureAgent(mockClient);

    const result = await agent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const featuresSection = result.structure.pages[0].sections.find(
        (s) => s.type === 'features'
      );
      expect(featuresSection).toBeDefined();

      // Config should have fields for createFeaturesPattern
      const config = featuresSection!.config;
      expect(config).toHaveProperty('title');
      expect(config).toHaveProperty('features');
      expect(Array.isArray(config.features)).toBe(true);
    }
  });

  it('should generate CTA config compatible with createCtaPattern', async () => {
    const mockClient = createMockClient();
    const agent = createStructureAgent(mockClient);

    const result = await agent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const ctaSection = result.structure.pages[0].sections.find(
        (s) => s.type === 'cta'
      );
      expect(ctaSection).toBeDefined();

      const config = ctaSection!.config;
      expect(config).toHaveProperty('heading');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('buttonText');
      expect(config).toHaveProperty('buttonUrl');
    }
  });

  it('should generate footer config compatible with createFooterPattern', async () => {
    const mockClient = createMockClient();
    const agent = createStructureAgent(mockClient);

    const result = await agent.generate({
      businessDescription: 'Test',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const footerSection = result.structure.pages[0].sections.find(
        (s) => s.type === 'footer'
      );
      expect(footerSection).toBeDefined();

      const config = footerSection!.config;
      expect(config).toHaveProperty('columns');
      expect(config).toHaveProperty('copyright');
    }
  });
});

describe('GenerationResult type', () => {
  it('should discriminate success and error cases', () => {
    const successResult: GenerationResult = {
      success: true,
      structure: mockSiteStructure,
      usage: { inputTokens: 100, outputTokens: 200 },
    };

    const errorResult: GenerationResult = {
      success: false,
      error: 'Something went wrong',
    };

    // Type narrowing should work
    if (successResult.success) {
      expect(successResult.structure).toBeDefined();
    }

    if (!errorResult.success) {
      expect(errorResult.error).toBeDefined();
    }
  });
});

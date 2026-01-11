/**
 * Tests for the Content Agent
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createContentAgent,
  ContentAgent,
  ContentGenerationResult,
} from '../agent';
import { PageContentSchema } from '../schemas';
import type { ClaudeClient } from '../../client';
import type { PageContent } from '../schemas';

// Mock response matching PageContent schema
const mockPageContent: PageContent = {
  pageSlug: 'home',
  sections: [
    {
      sectionId: 'hero-1',
      sectionType: 'hero',
      content: {
        heading: 'Transform Your Business Today',
        subheading: 'AI-powered solutions that drive real results',
        buttonText: 'Get Started',
      },
    },
    {
      sectionId: 'features-1',
      sectionType: 'features',
      content: {
        title: 'Why Choose Us',
        features: [
          {
            title: 'Fast Performance',
            description: 'Lightning quick load times',
            icon: 'bolt',
          },
          {
            title: 'Secure',
            description: 'Bank-level security for your data',
            icon: 'shield',
          },
          {
            title: 'Scalable',
            description: 'Grows with your business',
            icon: 'chart',
          },
        ],
      },
    },
    {
      sectionId: 'cta-1',
      sectionType: 'cta',
      content: {
        heading: 'Ready to Get Started?',
        body: 'Join thousands of satisfied customers today.',
        buttonText: 'Sign Up Now',
      },
    },
    {
      sectionId: 'testimonials-1',
      sectionType: 'testimonials',
      content: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            quote: 'This product transformed our workflow completely!',
            author: 'Jane Smith',
            role: 'CEO, TechCorp',
          },
          {
            quote: 'Best investment we ever made for our business.',
            author: 'John Doe',
            role: 'Founder, StartupXYZ',
          },
        ],
      },
    },
    {
      sectionId: 'footer-1',
      sectionType: 'footer',
      content: {
        columns: [
          { title: 'Company', links: ['About', 'Careers', 'Contact'] },
          { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
        ],
        copyright: '2024 Acme Inc. All rights reserved.',
      },
    },
  ],
  seo: {
    metaTitle: 'Acme Inc - Transform Your Business with AI Solutions',
    metaDescription:
      'Discover how Acme Inc can help transform your business with our AI-powered solutions. Fast, secure, and scalable for businesses of all sizes.',
    ogTitle: 'Acme Inc - AI-Powered Business Solutions',
    ogDescription:
      'Transform your business with our cutting-edge AI solutions.',
    keywords: ['AI solutions', 'business transformation', 'technology', 'SaaS'],
  },
};

// Create mock client
function createMockClient(response: unknown = mockPageContent): ClaudeClient {
  return {
    generateStructuredOutput: vi.fn().mockResolvedValue({
      success: true,
      data: response,
      usage: { inputTokens: 800, outputTokens: 1200 },
    }),
    generateText: vi.fn().mockResolvedValue({
      success: true,
      text: 'mock text',
    }),
  } as unknown as ClaudeClient;
}

describe('createContentAgent', () => {
  it('should create an agent with a client', () => {
    const mockClient = createMockClient();
    const agent = createContentAgent(mockClient);
    expect(agent).toBeDefined();
    expect(agent).toHaveProperty('generate');
  });
});

describe('ContentAgent.generate', () => {
  let mockClient: ClaudeClient;
  let agent: ContentAgent;

  beforeEach(() => {
    mockClient = createMockClient();
    agent = createContentAgent(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should generate page content from business description', async () => {
    const result = await agent.generate({
      businessDescription: 'A SaaS company providing AI-powered business tools',
      pageSlug: 'home',
      sectionTypes: ['hero', 'features', 'cta', 'testimonials', 'footer'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBeDefined();
      expect(result.content.pageSlug).toBe('home');
      expect(result.content.sections.length).toBeGreaterThan(0);
    }
  });

  it('should validate output against schema', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const validation = PageContentSchema.safeParse(result.content);
      expect(validation.success).toBe(true);
    }
  });

  it('should generate content for all requested section types', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero', 'features', 'footer'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const sectionTypes = result.content.sections.map((s) => s.sectionType);
      expect(sectionTypes).toContain('hero');
      expect(sectionTypes).toContain('features');
      expect(sectionTypes).toContain('footer');
    }
  });

  it('should include SEO metadata', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content.seo).toBeDefined();
      expect(result.content.seo.metaTitle).toBeDefined();
      expect(result.content.seo.metaDescription).toBeDefined();
      expect(result.content.seo.keywords).toBeDefined();
      expect(result.content.seo.keywords.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should return usage stats', async () => {
    const result = await agent.generate({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.usage).toBeDefined();
      expect(result.usage?.inputTokens).toBe(800);
      expect(result.usage?.outputTokens).toBe(1200);
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

    const errorAgent = createContentAgent(errorClient);
    const result = await errorAgent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
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

    const errorAgent = createContentAgent(networkErrorClient);
    const result = await errorAgent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('error');
    }
  });
});

describe('ContentAgent with different tones', () => {
  let agent: ContentAgent;

  beforeEach(() => {
    const mockClient = createMockClient();
    agent = createContentAgent(mockClient);
  });

  const tones = [
    'professional',
    'friendly',
    'bold',
    'minimal',
    'playful',
  ] as const;

  for (const tone of tones) {
    it(`should accept ${tone} tone preset`, async () => {
      const result = await agent.generate({
        businessDescription: 'Test business',
        pageSlug: 'home',
        sectionTypes: ['hero'],
        tone,
      });

      expect(result.success).toBe(true);
    });
  }
});

describe('ContentAgent section content generation', () => {
  let mockClient: ClaudeClient;
  let agent: ContentAgent;

  beforeEach(() => {
    mockClient = createMockClient();
    agent = createContentAgent(mockClient);
  });

  it('should generate hero content with headline and subheadline', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const heroSection = result.content.sections.find(
        (s) => s.sectionType === 'hero'
      );
      expect(heroSection).toBeDefined();
      expect(heroSection?.content).toHaveProperty('heading');
      expect(heroSection?.content).toHaveProperty('subheading');
    }
  });

  it('should generate features with title, description, and icon suggestions', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['features'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const featuresSection = result.content.sections.find(
        (s) => s.sectionType === 'features'
      );
      expect(featuresSection).toBeDefined();
      expect(featuresSection?.content).toHaveProperty('features');
      const features = featuresSection?.content.features;
      expect(Array.isArray(features)).toBe(true);
      if (features && features.length > 0) {
        expect(features[0]).toHaveProperty('title');
        expect(features[0]).toHaveProperty('description');
      }
    }
  });

  it('should generate CTA content with heading, body, and button', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['cta'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const ctaSection = result.content.sections.find(
        (s) => s.sectionType === 'cta'
      );
      expect(ctaSection).toBeDefined();
      expect(ctaSection?.content).toHaveProperty('heading');
      expect(ctaSection?.content).toHaveProperty('buttonText');
    }
  });

  it('should generate testimonials with quotes, authors, and roles', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['testimonials'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const testimonialsSection = result.content.sections.find(
        (s) => s.sectionType === 'testimonials'
      );
      expect(testimonialsSection).toBeDefined();
      const testimonials = testimonialsSection?.content.testimonials;
      expect(Array.isArray(testimonials)).toBe(true);
      if (testimonials && testimonials.length > 0) {
        expect(testimonials[0]).toHaveProperty('quote');
        expect(testimonials[0]).toHaveProperty('author');
      }
    }
  });

  it('should generate footer content with navigation and copyright', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['footer'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const footerSection = result.content.sections.find(
        (s) => s.sectionType === 'footer'
      );
      expect(footerSection).toBeDefined();
      expect(footerSection?.content).toHaveProperty('copyright');
    }
  });
});

describe('ContentGenerationResult type', () => {
  it('should discriminate success and error cases', () => {
    const successResult: ContentGenerationResult = {
      success: true,
      content: mockPageContent,
      usage: { inputTokens: 100, outputTokens: 200 },
    };

    const errorResult: ContentGenerationResult = {
      success: false,
      error: 'Something went wrong',
    };

    // Type narrowing should work
    if (successResult.success) {
      expect(successResult.content).toBeDefined();
    }

    if (!errorResult.success) {
      expect(errorResult.error).toBeDefined();
    }
  });
});

describe('Content length constraints', () => {
  let agent: ContentAgent;

  beforeEach(() => {
    const mockClient = createMockClient();
    agent = createContentAgent(mockClient);
  });

  it('should generate meta title within recommended length', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const { metaTitle } = result.content.seo;
      // Meta title should be 50-60 chars ideally, max 70
      expect(metaTitle.length).toBeLessThanOrEqual(70);
      expect(metaTitle.length).toBeGreaterThan(0);
    }
  });

  it('should generate meta description within recommended length', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const { metaDescription } = result.content.seo;
      // Meta description should be 150-160 chars ideally, max 170
      expect(metaDescription.length).toBeLessThanOrEqual(170);
      expect(metaDescription.length).toBeGreaterThan(50);
    }
  });

  it('should generate 3-5 keywords', async () => {
    const result = await agent.generate({
      businessDescription: 'Test',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const { keywords } = result.content.seo;
      expect(keywords.length).toBeGreaterThanOrEqual(3);
      expect(keywords.length).toBeLessThanOrEqual(5);
    }
  });
});

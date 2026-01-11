/**
 * Tests for Generator module
 *
 * Tests the orchestration of structure, content, image, and deployment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createGenerator,
  type GenerationInput,
  type GenerationEvent,
  type GeneratorDependencies,
} from '@/lib/generator';

// Mock agents and deployer
const mockStructureAgent = {
  generate: vi.fn(),
};

const mockContentAgent = {
  generate: vi.fn(),
};

const mockImageAgent = {
  getImage: vi.fn(),
  getImages: vi.fn(),
  generateQueryFromContext: vi.fn(),
};

const mockDeployer = {
  deploy: vi.fn(),
  rollback: vi.fn(),
  getDeploymentStatus: vi.fn(),
};

const mockDeps: GeneratorDependencies = {
  structureAgent: mockStructureAgent as any,
  contentAgent: mockContentAgent as any,
  imageAgent: mockImageAgent as any,
  deployer: mockDeployer as any,
};

describe('createGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a generator with generate method', () => {
    const generator = createGenerator(mockDeps);
    expect(generator).toBeDefined();
    expect(typeof generator.generate).toBe('function');
  });
});

describe('generator.generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should yield start event immediately', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business for testing',
      industry: 'technology',
      tone: 'professional',
    };

    // Mock successful responses
    mockStructureAgent.generate.mockResolvedValue({
      success: true,
      structure: {
        siteName: 'Test Business',
        pages: [{ slug: 'home', sections: [] }],
        navigation: { items: [] },
      },
    });

    mockContentAgent.generate.mockResolvedValue({
      success: true,
      content: { pageSlug: 'home', sections: [], seo: {} },
    });

    mockImageAgent.getImage.mockResolvedValue({
      success: true,
      image: { url: 'https://example.com/image.jpg', alt: 'Test image' },
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    expect(events[0]).toEqual({
      type: 'start',
      message: expect.any(String),
    });
  });

  it('should yield progress events for each step', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business',
      industry: 'technology',
      tone: 'professional',
    };

    // Mock successful responses
    mockStructureAgent.generate.mockResolvedValue({
      success: true,
      structure: {
        siteName: 'Test Business',
        pages: [{ slug: 'home', sections: [{ type: 'hero' }] }],
        navigation: { items: [] },
      },
    });

    mockContentAgent.generate.mockResolvedValue({
      success: true,
      content: { pageSlug: 'home', sections: [{ sectionType: 'hero', content: {} }], seo: {} },
    });

    mockImageAgent.getImage.mockResolvedValue({
      success: true,
      image: { url: 'https://example.com/image.jpg', alt: 'Test' },
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    const progressEvents = events.filter((e) => e.type === 'progress');
    const steps = progressEvents.map((e) => (e as any).step);

    expect(steps).toContain('structure');
    expect(steps).toContain('content');
    expect(steps).toContain('images');
    expect(steps).toContain('blocks');
  });

  it('should yield preview event with blocks when deploy is false', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business',
      industry: 'technology',
      tone: 'professional',
      deploy: false,
    };

    mockStructureAgent.generate.mockResolvedValue({
      success: true,
      structure: {
        siteName: 'Test Business',
        pages: [{ slug: 'home', sections: [{ type: 'hero', config: {} }] }],
        navigation: { items: [] },
      },
    });

    mockContentAgent.generate.mockResolvedValue({
      success: true,
      content: { pageSlug: 'home', sections: [{ sectionType: 'hero', content: {} }], seo: {} },
    });

    mockImageAgent.getImage.mockResolvedValue({
      success: true,
      image: { url: 'https://example.com/image.jpg', alt: 'Test' },
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('preview');
    expect((lastEvent as any).blocks).toBeDefined();
  });

  it('should yield complete event with deploy result when deploy is true', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business',
      industry: 'technology',
      tone: 'professional',
      deploy: true,
    };

    mockStructureAgent.generate.mockResolvedValue({
      success: true,
      structure: {
        siteName: 'Test Business',
        pages: [{ slug: 'home', sections: [{ type: 'hero', config: {} }] }],
        navigation: { items: [] },
      },
    });

    mockContentAgent.generate.mockResolvedValue({
      success: true,
      content: { pageSlug: 'home', sections: [{ sectionType: 'hero', content: {} }], seo: {} },
    });

    mockImageAgent.getImage.mockResolvedValue({
      success: true,
      image: { url: 'https://example.com/image.jpg', alt: 'Test' },
    });

    mockDeployer.deploy.mockResolvedValue({
      success: true,
      deploymentId: 'test-deployment-123',
      pages: [{ slug: 'home', url: 'https://site.com/', id: 1 }],
      media: [],
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect((lastEvent as any).result).toBeDefined();
    expect((lastEvent as any).result.deploymentId).toBe('test-deployment-123');
  });

  it('should yield error event when structure generation fails', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business',
      industry: 'technology',
      tone: 'professional',
    };

    mockStructureAgent.generate.mockResolvedValue({
      success: false,
      error: 'Failed to generate structure',
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    const errorEvent = events.find((e) => e.type === 'error');
    expect(errorEvent).toBeDefined();
    expect((errorEvent as any).message).toContain('structure');
  });

  it('should yield error event when content generation fails', async () => {
    const generator = createGenerator(mockDeps);
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A test business',
      industry: 'technology',
      tone: 'professional',
    };

    mockStructureAgent.generate.mockResolvedValue({
      success: true,
      structure: {
        siteName: 'Test Business',
        pages: [{ slug: 'home', sections: [{ type: 'hero' }] }],
        navigation: { items: [] },
      },
    });

    mockContentAgent.generate.mockResolvedValue({
      success: false,
      error: 'Failed to generate content',
    });

    const events: GenerationEvent[] = [];
    for await (const event of generator.generate(input)) {
      events.push(event);
    }

    const errorEvent = events.find((e) => e.type === 'error');
    expect(errorEvent).toBeDefined();
    expect((errorEvent as any).message).toContain('content');
  });
});

describe('GenerationInput validation', () => {
  it('should accept valid input with required fields', () => {
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A description',
      industry: 'technology',
      tone: 'professional',
    };

    expect(input.businessName).toBe('Test Business');
    expect(input.businessDescription).toBe('A description');
  });

  it('should accept optional color preferences', () => {
    const input: GenerationInput = {
      businessName: 'Test Business',
      businessDescription: 'A description',
      industry: 'technology',
      tone: 'professional',
      colorPreferences: {
        primary: '#007bff',
        secondary: '#6c757d',
      },
    };

    expect(input.colorPreferences?.primary).toBe('#007bff');
  });
});

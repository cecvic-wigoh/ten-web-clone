/**
 * Tests for content agent Zod schemas
 */
import { describe, it, expect } from 'vitest';
import {
  SectionContentSchema,
  PageContentSchema,
  SeoMetadataSchema,
  TonePreset,
  ContentRequestSchema,
} from '../schemas';

describe('SeoMetadataSchema', () => {
  it('should validate complete SEO metadata', () => {
    const seoMeta = {
      metaTitle: 'Best Local Bakery - Fresh Artisan Bread Daily',
      metaDescription:
        'Discover our handcrafted artisan breads baked fresh every morning. Family recipes, organic ingredients, and unmatched quality since 1985.',
      ogTitle: 'Best Local Bakery',
      ogDescription: 'Discover our handcrafted artisan breads baked fresh every morning.',
      keywords: ['bakery', 'artisan bread', 'organic', 'fresh baked', 'local'],
    };

    const result = SeoMetadataSchema.safeParse(seoMeta);
    expect(result.success).toBe(true);
  });

  it('should validate SEO metadata with minimum required fields', () => {
    const seoMeta = {
      metaTitle: 'Page Title',
      metaDescription: 'Page description here',
      ogTitle: 'OG Title',
      ogDescription: 'OG description',
      keywords: ['keyword1', 'keyword2'],
    };

    const result = SeoMetadataSchema.safeParse(seoMeta);
    expect(result.success).toBe(true);
  });

  it('should require metaTitle', () => {
    const noTitle = {
      metaDescription: 'Description',
      ogTitle: 'OG Title',
      ogDescription: 'OG desc',
      keywords: ['test'],
    };

    const result = SeoMetadataSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('should require keywords array', () => {
    const noKeywords = {
      metaTitle: 'Title',
      metaDescription: 'Description',
      ogTitle: 'OG Title',
      ogDescription: 'OG desc',
    };

    const result = SeoMetadataSchema.safeParse(noKeywords);
    expect(result.success).toBe(false);
  });

  it('should require at least 1 keyword', () => {
    const emptyKeywords = {
      metaTitle: 'Title',
      metaDescription: 'Description',
      ogTitle: 'OG Title',
      ogDescription: 'OG desc',
      keywords: [],
    };

    const result = SeoMetadataSchema.safeParse(emptyKeywords);
    expect(result.success).toBe(false);
  });
});

describe('SectionContentSchema', () => {
  it('should validate hero section content', () => {
    const heroContent = {
      sectionId: 'hero-1',
      sectionType: 'hero',
      content: {
        heading: 'Transform Your Business Today',
        subheading: 'AI-powered solutions that drive real results',
        buttonText: 'Get Started',
      },
    };

    const result = SectionContentSchema.safeParse(heroContent);
    expect(result.success).toBe(true);
  });

  it('should validate features section content', () => {
    const featuresContent = {
      sectionId: 'features-1',
      sectionType: 'features',
      content: {
        title: 'Why Choose Us',
        features: [
          { title: 'Fast', description: 'Lightning quick performance', icon: 'bolt' },
          { title: 'Secure', description: 'Bank-level security', icon: 'shield' },
        ],
      },
    };

    const result = SectionContentSchema.safeParse(featuresContent);
    expect(result.success).toBe(true);
  });

  it('should validate CTA section content', () => {
    const ctaContent = {
      sectionId: 'cta-1',
      sectionType: 'cta',
      content: {
        heading: 'Ready to Get Started?',
        body: 'Join thousands of satisfied customers today.',
        buttonText: 'Sign Up Now',
      },
    };

    const result = SectionContentSchema.safeParse(ctaContent);
    expect(result.success).toBe(true);
  });

  it('should validate testimonials section content', () => {
    const testimonialsContent = {
      sectionId: 'testimonials-1',
      sectionType: 'testimonials',
      content: {
        title: 'What Our Customers Say',
        testimonials: [
          { quote: 'Amazing service!', author: 'John Doe', role: 'CEO, Tech Corp' },
        ],
      },
    };

    const result = SectionContentSchema.safeParse(testimonialsContent);
    expect(result.success).toBe(true);
  });

  it('should validate footer section content', () => {
    const footerContent = {
      sectionId: 'footer-1',
      sectionType: 'footer',
      content: {
        columns: [
          { title: 'Company', links: ['About', 'Careers', 'Contact'] },
          { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
        ],
        copyright: '2024 Acme Inc. All rights reserved.',
      },
    };

    const result = SectionContentSchema.safeParse(footerContent);
    expect(result.success).toBe(true);
  });

  it('should require sectionId', () => {
    const noId = {
      sectionType: 'hero',
      content: { heading: 'Test' },
    };

    const result = SectionContentSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('should require sectionType', () => {
    const noType = {
      sectionId: 'hero-1',
      content: { heading: 'Test' },
    };

    const result = SectionContentSchema.safeParse(noType);
    expect(result.success).toBe(false);
  });
});

describe('PageContentSchema', () => {
  it('should validate complete page content', () => {
    const pageContent = {
      pageSlug: 'home',
      sections: [
        {
          sectionId: 'hero-1',
          sectionType: 'hero',
          content: { heading: 'Welcome', subheading: 'Hello' },
        },
        {
          sectionId: 'footer-1',
          sectionType: 'footer',
          content: { copyright: '2024' },
        },
      ],
      seo: {
        metaTitle: 'Home - My Site',
        metaDescription: 'Welcome to our homepage',
        ogTitle: 'Home',
        ogDescription: 'Welcome',
        keywords: ['home', 'main'],
      },
    };

    const result = PageContentSchema.safeParse(pageContent);
    expect(result.success).toBe(true);
  });

  it('should require pageSlug', () => {
    const noSlug = {
      sections: [],
      seo: {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG',
        ogDescription: 'OG Desc',
        keywords: ['test'],
      },
    };

    const result = PageContentSchema.safeParse(noSlug);
    expect(result.success).toBe(false);
  });

  it('should require sections array', () => {
    const noSections = {
      pageSlug: 'home',
      seo: {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG',
        ogDescription: 'OG Desc',
        keywords: ['test'],
      },
    };

    const result = PageContentSchema.safeParse(noSections);
    expect(result.success).toBe(false);
  });

  it('should require seo metadata', () => {
    const noSeo = {
      pageSlug: 'home',
      sections: [],
    };

    const result = PageContentSchema.safeParse(noSeo);
    expect(result.success).toBe(false);
  });
});

describe('TonePreset enum', () => {
  it('should have all expected tone presets', () => {
    expect(TonePreset.options).toContain('professional');
    expect(TonePreset.options).toContain('friendly');
    expect(TonePreset.options).toContain('bold');
    expect(TonePreset.options).toContain('minimal');
    expect(TonePreset.options).toContain('playful');
  });

  it('should have at least 5 tone presets', () => {
    expect(TonePreset.options.length).toBeGreaterThanOrEqual(5);
  });
});

describe('ContentRequestSchema', () => {
  it('should validate a content generation request', () => {
    const request = {
      businessDescription: 'A local bakery specializing in artisan bread',
      pageSlug: 'home',
      sectionTypes: ['hero', 'features', 'footer'],
      tone: 'friendly',
    };

    const result = ContentRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should require businessDescription', () => {
    const noDesc = {
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
    };

    const result = ContentRequestSchema.safeParse(noDesc);
    expect(result.success).toBe(false);
  });

  it('should require pageSlug', () => {
    const noSlug = {
      businessDescription: 'Test business',
      sectionTypes: ['hero'],
      tone: 'professional',
    };

    const result = ContentRequestSchema.safeParse(noSlug);
    expect(result.success).toBe(false);
  });

  it('should require valid tone preset', () => {
    const invalidTone = {
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'invalid-tone',
    };

    const result = ContentRequestSchema.safeParse(invalidTone);
    expect(result.success).toBe(false);
  });

  it('should allow optional existing content for context', () => {
    const withContext = {
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      tone: 'professional',
      existingContent: {
        businessName: 'Acme Corp',
        tagline: 'Innovation First',
      },
    };

    const result = ContentRequestSchema.safeParse(withContext);
    expect(result.success).toBe(true);
  });
});

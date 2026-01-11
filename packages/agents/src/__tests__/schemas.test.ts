/**
 * Tests for structure agent Zod schemas
 */
import { describe, it, expect } from 'vitest';
import {
  SectionSchema,
  PageSchema,
  SiteStructureSchema,
  ThemeConfigSchema,
  NavigationSchema,
  SectionType,
} from '../structure/schemas';

describe('SectionSchema', () => {
  it('should validate a valid hero section', () => {
    const heroSection = {
      type: 'hero',
      config: {
        heading: 'Welcome to Our Site',
        subheading: 'We help businesses grow',
        buttonText: 'Get Started',
        buttonUrl: '/contact',
      },
    };

    const result = SectionSchema.safeParse(heroSection);
    expect(result.success).toBe(true);
  });

  it('should validate a valid features section', () => {
    const featuresSection = {
      type: 'features',
      config: {
        title: 'Our Features',
        features: [
          { title: 'Fast', description: 'Lightning quick' },
          { title: 'Secure', description: 'Bank-level security' },
        ],
      },
    };

    const result = SectionSchema.safeParse(featuresSection);
    expect(result.success).toBe(true);
  });

  it('should validate a valid CTA section', () => {
    const ctaSection = {
      type: 'cta',
      config: {
        heading: 'Ready to Start?',
        description: 'Join thousands of happy customers',
        buttonText: 'Sign Up Now',
        buttonUrl: '/signup',
      },
    };

    const result = SectionSchema.safeParse(ctaSection);
    expect(result.success).toBe(true);
  });

  it('should validate a valid testimonials section', () => {
    const testimonialSection = {
      type: 'testimonials',
      config: {
        title: 'What Our Clients Say',
        testimonials: [
          { quote: 'Amazing service!', author: 'John Doe', role: 'CEO' },
        ],
      },
    };

    const result = SectionSchema.safeParse(testimonialSection);
    expect(result.success).toBe(true);
  });

  it('should validate a valid footer section', () => {
    const footerSection = {
      type: 'footer',
      config: {
        columns: [
          {
            title: 'Company',
            links: [{ text: 'About', url: '/about' }],
          },
        ],
        copyright: '2024 Company Inc.',
      },
    };

    const result = SectionSchema.safeParse(footerSection);
    expect(result.success).toBe(true);
  });

  it('should reject invalid section type', () => {
    const invalidSection = {
      type: 'invalid-type',
      config: {},
    };

    const result = SectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('should require config object', () => {
    const noConfig = {
      type: 'hero',
    };

    const result = SectionSchema.safeParse(noConfig);
    expect(result.success).toBe(false);
  });
});

describe('PageSchema', () => {
  it('should validate a valid page', () => {
    const page = {
      slug: 'home',
      title: 'Home',
      sections: [
        {
          type: 'hero',
          config: {
            heading: 'Welcome',
            subheading: 'Hello world',
          },
        },
      ],
    };

    const result = PageSchema.safeParse(page);
    expect(result.success).toBe(true);
  });

  it('should require slug', () => {
    const noSlug = {
      title: 'Home',
      sections: [],
    };

    const result = PageSchema.safeParse(noSlug);
    expect(result.success).toBe(false);
  });

  it('should require title', () => {
    const noTitle = {
      slug: 'home',
      sections: [],
    };

    const result = PageSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('should allow empty sections array', () => {
    const emptySections = {
      slug: 'home',
      title: 'Home',
      sections: [],
    };

    const result = PageSchema.safeParse(emptySections);
    expect(result.success).toBe(true);
  });
});

describe('NavigationSchema', () => {
  it('should validate navigation items', () => {
    const nav = {
      items: [
        { label: 'Home', url: '/', order: 1 },
        { label: 'About', url: '/about', order: 2 },
      ],
    };

    const result = NavigationSchema.safeParse(nav);
    expect(result.success).toBe(true);
  });

  it('should allow optional order', () => {
    const navNoOrder = {
      items: [{ label: 'Home', url: '/' }],
    };

    const result = NavigationSchema.safeParse(navNoOrder);
    expect(result.success).toBe(true);
  });
});

describe('ThemeConfigSchema', () => {
  it('should validate theme config with colors', () => {
    const theme = {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#212529',
      },
    };

    const result = ThemeConfigSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });

  it('should allow empty theme config', () => {
    const emptyTheme = {};

    const result = ThemeConfigSchema.safeParse(emptyTheme);
    expect(result.success).toBe(true);
  });

  it('should validate theme with typography', () => {
    const theme = {
      colors: { primary: '#000' },
      typography: {
        headingFont: 'Roboto',
        bodyFont: 'Open Sans',
      },
    };

    const result = ThemeConfigSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });
});

describe('SiteStructureSchema', () => {
  it('should validate a complete site structure', () => {
    const siteStructure = {
      pages: [
        {
          slug: 'home',
          title: 'Home',
          sections: [
            {
              type: 'hero',
              config: {
                heading: 'Welcome',
                subheading: 'Hello',
              },
            },
            {
              type: 'features',
              config: {
                title: 'Features',
                features: [
                  { title: 'Fast', description: 'Quick' },
                ],
              },
            },
            {
              type: 'footer',
              config: {
                columns: [],
                copyright: '2024',
              },
            },
          ],
        },
      ],
      theme: {
        colors: {
          primary: '#007bff',
          background: '#ffffff',
        },
      },
      navigation: {
        items: [{ label: 'Home', url: '/' }],
      },
    };

    const result = SiteStructureSchema.safeParse(siteStructure);
    expect(result.success).toBe(true);
  });

  it('should require pages array', () => {
    const noPages = {
      theme: {},
      navigation: { items: [] },
    };

    const result = SiteStructureSchema.safeParse(noPages);
    expect(result.success).toBe(false);
  });

  it('should require navigation', () => {
    const noNav = {
      pages: [],
      theme: {},
    };

    const result = SiteStructureSchema.safeParse(noNav);
    expect(result.success).toBe(false);
  });
});

describe('SectionType enum', () => {
  it('should have all expected section types', () => {
    expect(SectionType.options).toContain('hero');
    expect(SectionType.options).toContain('features');
    expect(SectionType.options).toContain('cta');
    expect(SectionType.options).toContain('testimonials');
    expect(SectionType.options).toContain('gallery');
    expect(SectionType.options).toContain('contact');
    expect(SectionType.options).toContain('footer');
  });
});

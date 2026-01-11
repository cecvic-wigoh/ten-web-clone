/**
 * Tests for Block Pattern Library
 *
 * TDD: These tests define the expected behavior of the pattern library.
 */

import { describe, it, expect } from 'vitest';
import {
  createHeroPattern,
  createFeaturesPattern,
  createCtaPattern,
  createTestimonialsPattern,
  createFooterPattern,
  PatternConfig,
} from '../patterns';
import { serializeBlock } from '../serializer';

describe('Block Patterns', () => {
  describe('Hero Pattern', () => {
    it('should create a hero section with heading, paragraph, and button', () => {
      const config: PatternConfig = {
        hero: {
          heading: 'Welcome to Our Site',
          subheading: 'We provide excellent services.',
          buttonText: 'Get Started',
          buttonUrl: '/contact',
        },
      };

      const pattern = createHeroPattern(config.hero!);

      expect(pattern.name).toBe('core/group');
      expect(pattern.innerBlocks).toBeDefined();
      expect(pattern.innerBlocks!.length).toBeGreaterThanOrEqual(2);

      // Serialize and check output
      const serialized = serializeBlock(pattern);
      expect(serialized).toContain('Welcome to Our Site');
      expect(serialized).toContain('We provide excellent services.');
      expect(serialized).toContain('Get Started');
    });

    it('should apply full-width layout to hero', () => {
      const config = {
        heading: 'Hero Title',
        subheading: 'Hero description',
      };

      const pattern = createHeroPattern(config);

      expect(pattern.attributes?.layout).toBeDefined();
    });

    it('should support background image', () => {
      const config = {
        heading: 'Hero with Background',
        subheading: 'Description',
        backgroundImage: 'https://example.com/bg.jpg',
      };

      const pattern = createHeroPattern(config);

      // Should use cover block for background image
      const serialized = serializeBlock(pattern);
      expect(serialized).toContain('wp:cover');
      expect(serialized).toContain('bg.jpg');
    });

    it('should handle hero without button', () => {
      const config = {
        heading: 'Simple Hero',
        subheading: 'Just text, no button',
      };

      const pattern = createHeroPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).not.toContain('wp:button');
    });
  });

  describe('Features Pattern', () => {
    it('should create a features grid with columns', () => {
      const config = {
        title: 'Our Features',
        features: [
          { title: 'Feature 1', description: 'Description 1', icon: '🚀' },
          { title: 'Feature 2', description: 'Description 2', icon: '💡' },
          { title: 'Feature 3', description: 'Description 3', icon: '🔒' },
        ],
      };

      const pattern = createFeaturesPattern(config);

      expect(pattern.name).toBe('core/group');

      const serialized = serializeBlock(pattern);
      expect(serialized).toContain('Our Features');
      expect(serialized).toContain('Feature 1');
      expect(serialized).toContain('Feature 2');
      expect(serialized).toContain('Feature 3');
      expect(serialized).toContain('wp:columns');
    });

    it('should create equal width columns for features', () => {
      const config = {
        title: 'Features',
        features: [
          { title: 'A', description: 'Desc A' },
          { title: 'B', description: 'Desc B' },
        ],
      };

      const pattern = createFeaturesPattern(config);
      const serialized = serializeBlock(pattern);

      // Should have columns block
      expect(serialized).toContain('wp:column');
    });

    it('should handle features without icons', () => {
      const config = {
        title: 'Plain Features',
        features: [
          { title: 'Feature', description: 'Description' },
        ],
      };

      const pattern = createFeaturesPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('Feature');
      expect(serialized).toContain('Description');
    });
  });

  describe('CTA Pattern', () => {
    it('should create a centered CTA section', () => {
      const config = {
        heading: 'Ready to Start?',
        description: 'Join thousands of happy customers.',
        buttonText: 'Sign Up Now',
        buttonUrl: '/signup',
      };

      const pattern = createCtaPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('Ready to Start?');
      expect(serialized).toContain('Join thousands');
      expect(serialized).toContain('Sign Up Now');
    });

    it('should apply centered text alignment', () => {
      const config = {
        heading: 'CTA Title',
        description: 'CTA description',
        buttonText: 'Action',
        buttonUrl: '#',
      };

      const pattern = createCtaPattern(config);
      const serialized = serializeBlock(pattern);

      // Check for center alignment
      expect(serialized).toContain('center');
    });

    it('should support background color', () => {
      const config = {
        heading: 'Colored CTA',
        description: 'With background',
        buttonText: 'Click',
        buttonUrl: '#',
        backgroundColor: 'primary',
      };

      const pattern = createCtaPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('has-primary-background-color');
    });
  });

  describe('Testimonials Pattern', () => {
    it('should create a testimonials section', () => {
      const config = {
        title: 'What Our Clients Say',
        testimonials: [
          {
            quote: 'Amazing service!',
            author: 'John Doe',
            role: 'CEO, Company',
          },
          {
            quote: 'Highly recommended.',
            author: 'Jane Smith',
            role: 'Designer',
          },
        ],
      };

      const pattern = createTestimonialsPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('What Our Clients Say');
      expect(serialized).toContain('Amazing service!');
      expect(serialized).toContain('John Doe');
      expect(serialized).toContain('Highly recommended.');
    });

    it('should style quotes appropriately', () => {
      const config = {
        title: 'Reviews',
        testimonials: [
          { quote: 'Great!', author: 'Test' },
        ],
      };

      const pattern = createTestimonialsPattern(config);
      const serialized = serializeBlock(pattern);

      // Should contain quote styling
      expect(serialized).toBeDefined();
    });

    it('should handle testimonials with images', () => {
      const config = {
        title: 'Testimonials',
        testimonials: [
          {
            quote: 'Love it!',
            author: 'User',
            image: 'https://example.com/avatar.jpg',
          },
        ],
      };

      const pattern = createTestimonialsPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('avatar.jpg');
    });
  });

  describe('Footer Pattern', () => {
    it('should create a footer with columns', () => {
      const config = {
        columns: [
          {
            title: 'Company',
            links: [
              { text: 'About', url: '/about' },
              { text: 'Careers', url: '/careers' },
            ],
          },
          {
            title: 'Support',
            links: [
              { text: 'Help', url: '/help' },
              { text: 'Contact', url: '/contact' },
            ],
          },
        ],
        copyright: '2026 Company Inc. All rights reserved.',
      };

      const pattern = createFooterPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('Company');
      expect(serialized).toContain('About');
      expect(serialized).toContain('Support');
      expect(serialized).toContain('2026');
    });

    it('should handle footer with social links', () => {
      const config = {
        columns: [],
        copyright: '2026 Test',
        socialLinks: [
          { platform: 'twitter', url: 'https://twitter.com/test' },
          { platform: 'facebook', url: 'https://facebook.com/test' },
        ],
      };

      const pattern = createFooterPattern(config);
      const serialized = serializeBlock(pattern);

      expect(serialized).toContain('twitter.com');
    });
  });

  describe('Pattern Integration', () => {
    it('should produce valid block grammar for all patterns', () => {
      const patterns = [
        createHeroPattern({ heading: 'Test', subheading: 'Test' }),
        createFeaturesPattern({ title: 'Test', features: [{ title: 'F', description: 'D' }] }),
        createCtaPattern({ heading: 'Test', description: 'Test', buttonText: 'Test', buttonUrl: '#' }),
        createTestimonialsPattern({ title: 'Test', testimonials: [{ quote: 'Q', author: 'A' }] }),
        createFooterPattern({ columns: [], copyright: 'Test' }),
      ];

      for (const pattern of patterns) {
        const serialized = serializeBlock(pattern);

        // Should have opening and closing comments
        expect(serialized).toMatch(/<!-- wp:\w+/);
        expect(serialized).toMatch(/<!-- \/wp:\w+ -->/);

        // Should not contain undefined or null strings
        expect(serialized).not.toContain('undefined');
        expect(serialized).not.toContain('null');
      }
    });
  });
});

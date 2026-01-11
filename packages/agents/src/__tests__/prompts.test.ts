/**
 * Tests for structure agent prompts
 */
import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildUserPrompt,
  SECTION_RECOMMENDATIONS,
} from '../structure/prompts';

describe('buildSystemPrompt', () => {
  it('should return a non-empty string', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('should include JSON output instructions', () => {
    const prompt = buildSystemPrompt();
    expect(prompt.toLowerCase()).toContain('json');
  });

  it('should include section types', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('hero');
    expect(prompt).toContain('features');
    expect(prompt).toContain('cta');
    expect(prompt).toContain('testimonials');
    expect(prompt).toContain('footer');
  });

  it('should include schema description', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('pages');
    expect(prompt).toContain('sections');
    expect(prompt).toContain('theme');
    expect(prompt).toContain('navigation');
  });
});

describe('buildUserPrompt', () => {
  it('should include the business description', () => {
    const description = 'A local bakery specializing in artisan bread';
    const prompt = buildUserPrompt(description);
    expect(prompt).toContain(description);
  });

  it('should work with short descriptions', () => {
    const description = 'Online store';
    const prompt = buildUserPrompt(description);
    expect(prompt).toContain(description);
    expect(prompt.length).toBeGreaterThan(description.length);
  });

  it('should work with long descriptions', () => {
    const description =
      'A full-service digital marketing agency specializing in ' +
      'SEO, content marketing, social media management, and paid advertising ' +
      'for small to medium businesses. We have over 10 years of experience ' +
      'and have helped hundreds of companies grow their online presence.';
    const prompt = buildUserPrompt(description);
    expect(prompt).toContain(description);
  });

  it('should handle special characters', () => {
    const description = "Bob's Coffee & Tea Shop - 100% Organic!";
    const prompt = buildUserPrompt(description);
    expect(prompt).toContain(description);
  });
});

describe('SECTION_RECOMMENDATIONS', () => {
  it('should have recommendations for common business types', () => {
    expect(SECTION_RECOMMENDATIONS).toHaveProperty('restaurant');
    expect(SECTION_RECOMMENDATIONS).toHaveProperty('ecommerce');
    expect(SECTION_RECOMMENDATIONS).toHaveProperty('portfolio');
    expect(SECTION_RECOMMENDATIONS).toHaveProperty('saas');
    expect(SECTION_RECOMMENDATIONS).toHaveProperty('agency');
  });

  it('should have arrays of recommended sections', () => {
    for (const [, sections] of Object.entries(SECTION_RECOMMENDATIONS)) {
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
    }
  });

  it('should only recommend valid section types', () => {
    const validTypes = ['hero', 'features', 'cta', 'testimonials', 'gallery', 'contact', 'footer'];
    for (const [, sections] of Object.entries(SECTION_RECOMMENDATIONS)) {
      for (const section of sections) {
        expect(validTypes).toContain(section);
      }
    }
  });
});

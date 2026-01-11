/**
 * Tests for SEO metadata generation
 */
import { describe, it, expect } from 'vitest';
import {
  buildSeoSystemPrompt,
  buildSeoUserPrompt,
  validateMetaTitle,
  validateMetaDescription,
  SEO_CONSTRAINTS,
} from '../seo';

describe('SEO_CONSTRAINTS', () => {
  it('should define meta title constraints', () => {
    expect(SEO_CONSTRAINTS).toHaveProperty('metaTitle');
    expect(SEO_CONSTRAINTS.metaTitle).toHaveProperty('minLength');
    expect(SEO_CONSTRAINTS.metaTitle).toHaveProperty('maxLength');
    expect(SEO_CONSTRAINTS.metaTitle.minLength).toBeGreaterThan(0);
    expect(SEO_CONSTRAINTS.metaTitle.maxLength).toBeLessThanOrEqual(70);
  });

  it('should define meta description constraints', () => {
    expect(SEO_CONSTRAINTS).toHaveProperty('metaDescription');
    expect(SEO_CONSTRAINTS.metaDescription).toHaveProperty('minLength');
    expect(SEO_CONSTRAINTS.metaDescription).toHaveProperty('maxLength');
    expect(SEO_CONSTRAINTS.metaDescription.minLength).toBeGreaterThan(0);
    expect(SEO_CONSTRAINTS.metaDescription.maxLength).toBeLessThanOrEqual(170);
  });

  it('should define keyword constraints', () => {
    expect(SEO_CONSTRAINTS).toHaveProperty('keywords');
    expect(SEO_CONSTRAINTS.keywords).toHaveProperty('min');
    expect(SEO_CONSTRAINTS.keywords).toHaveProperty('max');
    expect(SEO_CONSTRAINTS.keywords.min).toBeGreaterThanOrEqual(3);
    expect(SEO_CONSTRAINTS.keywords.max).toBeLessThanOrEqual(7);
  });

  it('should have reasonable meta title length (50-60 recommended, 70 max)', () => {
    // Google typically displays 50-60 chars
    expect(SEO_CONSTRAINTS.metaTitle.maxLength).toBeGreaterThanOrEqual(50);
    expect(SEO_CONSTRAINTS.metaTitle.maxLength).toBeLessThanOrEqual(70);
  });

  it('should have reasonable meta description length (150-160 recommended)', () => {
    // Google typically displays 150-160 chars
    expect(SEO_CONSTRAINTS.metaDescription.maxLength).toBeGreaterThanOrEqual(150);
    expect(SEO_CONSTRAINTS.metaDescription.maxLength).toBeLessThanOrEqual(170);
  });
});

describe('validateMetaTitle', () => {
  it('should return valid for title within length constraints', () => {
    const title = 'Best Local Bakery - Fresh Artisan Bread Daily';
    const result = validateMetaTitle(title);
    expect(result.valid).toBe(true);
    expect(result.length).toBe(title.length);
  });

  it('should return invalid for empty title', () => {
    const result = validateMetaTitle('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return invalid for too long title', () => {
    const longTitle = 'A'.repeat(80);
    const result = validateMetaTitle(longTitle);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('should return warning for title approaching max length', () => {
    // Title at 55 chars (approaching but not over)
    const nearMaxTitle = 'A'.repeat(55);
    const result = validateMetaTitle(nearMaxTitle);
    expect(result.valid).toBe(true);
    // May have a warning about length
  });

  it('should trim whitespace before validation', () => {
    const paddedTitle = '  Valid Title  ';
    const result = validateMetaTitle(paddedTitle);
    expect(result.length).toBe(paddedTitle.trim().length);
  });
});

describe('validateMetaDescription', () => {
  it('should return valid for description within length constraints', () => {
    const description =
      'Discover our handcrafted artisan breads baked fresh every morning. Family recipes, organic ingredients.';
    const result = validateMetaDescription(description);
    expect(result.valid).toBe(true);
    expect(result.length).toBe(description.length);
  });

  it('should return invalid for empty description', () => {
    const result = validateMetaDescription('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return invalid for too long description', () => {
    const longDesc = 'A'.repeat(180);
    const result = validateMetaDescription(longDesc);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('should return invalid for too short description', () => {
    const shortDesc = 'Hi';
    const result = validateMetaDescription(shortDesc);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too short');
  });

  it('should trim whitespace before validation', () => {
    const paddedDesc = '  Valid description text here  ';
    const result = validateMetaDescription(paddedDesc);
    expect(result.length).toBe(paddedDesc.trim().length);
  });
});

describe('buildSeoSystemPrompt', () => {
  it('should return a non-empty string', () => {
    const prompt = buildSeoSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('should include JSON output instructions', () => {
    const prompt = buildSeoSystemPrompt();
    expect(prompt.toLowerCase()).toContain('json');
  });

  it('should include character limit guidance', () => {
    const prompt = buildSeoSystemPrompt();
    expect(prompt).toContain('50');
    expect(prompt).toContain('60');
    expect(prompt).toContain('150');
    expect(prompt).toContain('160');
  });

  it('should include schema fields', () => {
    const prompt = buildSeoSystemPrompt();
    expect(prompt).toContain('metaTitle');
    expect(prompt).toContain('metaDescription');
    expect(prompt).toContain('ogTitle');
    expect(prompt).toContain('ogDescription');
    expect(prompt).toContain('keywords');
  });

  it('should include SEO best practices', () => {
    const prompt = buildSeoSystemPrompt();
    const lowerPrompt = prompt.toLowerCase();
    // Should mention keywords, relevance, or search
    expect(
      lowerPrompt.includes('keyword') ||
        lowerPrompt.includes('search') ||
        lowerPrompt.includes('seo')
    ).toBe(true);
  });
});

describe('buildSeoUserPrompt', () => {
  it('should include business description', () => {
    const description = 'A local bakery specializing in artisan bread';
    const prompt = buildSeoUserPrompt({
      businessDescription: description,
      pageSlug: 'home',
      pageTitle: 'Home',
    });

    expect(prompt).toContain(description);
  });

  it('should include page slug', () => {
    const prompt = buildSeoUserPrompt({
      businessDescription: 'Test',
      pageSlug: 'about',
      pageTitle: 'About Us',
    });

    expect(prompt).toContain('about');
  });

  it('should include page title', () => {
    const prompt = buildSeoUserPrompt({
      businessDescription: 'Test',
      pageSlug: 'about',
      pageTitle: 'About Us',
    });

    expect(prompt).toContain('About Us');
  });

  it('should include page content summary when provided', () => {
    const prompt = buildSeoUserPrompt({
      businessDescription: 'Test',
      pageSlug: 'home',
      pageTitle: 'Home',
      contentSummary: 'Main landing page with hero and features sections',
    });

    expect(prompt).toContain('landing page');
  });

  it('should request keyword count within constraints', () => {
    const prompt = buildSeoUserPrompt({
      businessDescription: 'Test',
      pageSlug: 'home',
      pageTitle: 'Home',
    });

    // Should mention 3-5 keywords
    expect(prompt).toContain('3');
    expect(prompt).toContain('5');
  });
});

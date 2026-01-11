/**
 * Tests for content agent prompts
 */
import { describe, it, expect } from 'vitest';
import {
  buildContentSystemPrompt,
  buildContentUserPrompt,
  TONE_PRESETS,
  getToneInstructions,
  SECTION_CONTENT_TEMPLATES,
} from '../prompts';

describe('TONE_PRESETS', () => {
  it('should have professional tone preset', () => {
    expect(TONE_PRESETS).toHaveProperty('professional');
    expect(TONE_PRESETS.professional).toHaveProperty('name');
    expect(TONE_PRESETS.professional).toHaveProperty('description');
    expect(TONE_PRESETS.professional).toHaveProperty('characteristics');
    expect(Array.isArray(TONE_PRESETS.professional.characteristics)).toBe(true);
  });

  it('should have friendly tone preset', () => {
    expect(TONE_PRESETS).toHaveProperty('friendly');
    expect(TONE_PRESETS.friendly.name).toBe('Friendly');
  });

  it('should have bold tone preset', () => {
    expect(TONE_PRESETS).toHaveProperty('bold');
    expect(TONE_PRESETS.bold.name).toBe('Bold');
  });

  it('should have minimal tone preset', () => {
    expect(TONE_PRESETS).toHaveProperty('minimal');
    expect(TONE_PRESETS.minimal.name).toBe('Minimal');
  });

  it('should have playful tone preset', () => {
    expect(TONE_PRESETS).toHaveProperty('playful');
    expect(TONE_PRESETS.playful.name).toBe('Playful');
  });

  it('should have at least 5 tone presets', () => {
    expect(Object.keys(TONE_PRESETS).length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique descriptions for each preset', () => {
    const descriptions = Object.values(TONE_PRESETS).map((t) => t.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });
});

describe('getToneInstructions', () => {
  it('should return tone instructions for professional', () => {
    const instructions = getToneInstructions('professional');
    expect(typeof instructions).toBe('string');
    expect(instructions.length).toBeGreaterThan(50);
    expect(instructions.toLowerCase()).toContain('professional');
  });

  it('should return tone instructions for friendly', () => {
    const instructions = getToneInstructions('friendly');
    expect(instructions.toLowerCase()).toContain('friendly');
  });

  it('should return tone instructions for bold', () => {
    const instructions = getToneInstructions('bold');
    expect(instructions.toLowerCase()).toContain('bold');
  });

  it('should return tone instructions for minimal', () => {
    const instructions = getToneInstructions('minimal');
    expect(instructions.toLowerCase()).toContain('minimal');
  });

  it('should return tone instructions for playful', () => {
    const instructions = getToneInstructions('playful');
    expect(instructions.toLowerCase()).toContain('playful');
  });

  it('should include characteristics in instructions', () => {
    const instructions = getToneInstructions('professional');
    // Should include some characteristics from the preset
    expect(instructions.length).toBeGreaterThan(100);
  });
});

describe('SECTION_CONTENT_TEMPLATES', () => {
  it('should have template for hero section', () => {
    expect(SECTION_CONTENT_TEMPLATES).toHaveProperty('hero');
    expect(SECTION_CONTENT_TEMPLATES.hero).toContain('heading');
    expect(SECTION_CONTENT_TEMPLATES.hero).toContain('subheading');
    expect(SECTION_CONTENT_TEMPLATES.hero).toContain('buttonText');
  });

  it('should have template for features section', () => {
    expect(SECTION_CONTENT_TEMPLATES).toHaveProperty('features');
    expect(SECTION_CONTENT_TEMPLATES.features).toContain('title');
    expect(SECTION_CONTENT_TEMPLATES.features).toContain('description');
  });

  it('should have template for cta section', () => {
    expect(SECTION_CONTENT_TEMPLATES).toHaveProperty('cta');
    expect(SECTION_CONTENT_TEMPLATES.cta).toContain('heading');
    expect(SECTION_CONTENT_TEMPLATES.cta).toContain('buttonText');
  });

  it('should have template for testimonials section', () => {
    expect(SECTION_CONTENT_TEMPLATES).toHaveProperty('testimonials');
    expect(SECTION_CONTENT_TEMPLATES.testimonials).toContain('quote');
    expect(SECTION_CONTENT_TEMPLATES.testimonials).toContain('author');
  });

  it('should have template for footer section', () => {
    expect(SECTION_CONTENT_TEMPLATES).toHaveProperty('footer');
    expect(SECTION_CONTENT_TEMPLATES.footer).toContain('copyright');
  });
});

describe('buildContentSystemPrompt', () => {
  it('should return a non-empty string', () => {
    const prompt = buildContentSystemPrompt('professional');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(200);
  });

  it('should include JSON output instructions', () => {
    const prompt = buildContentSystemPrompt('professional');
    expect(prompt.toLowerCase()).toContain('json');
  });

  it('should include tone-specific instructions', () => {
    const professionalPrompt = buildContentSystemPrompt('professional');
    const friendlyPrompt = buildContentSystemPrompt('friendly');

    // Prompts should be different based on tone
    expect(professionalPrompt).not.toBe(friendlyPrompt);
  });

  it('should include section content guidance', () => {
    const prompt = buildContentSystemPrompt('professional');
    expect(prompt).toContain('hero');
    expect(prompt).toContain('features');
    expect(prompt).toContain('cta');
    expect(prompt).toContain('testimonials');
    expect(prompt).toContain('footer');
  });

  it('should include character limit guidelines', () => {
    const prompt = buildContentSystemPrompt('professional');
    // Should mention character limits for headlines, etc.
    expect(prompt.toLowerCase()).toContain('character');
  });

  it('should include SEO guidance', () => {
    const prompt = buildContentSystemPrompt('professional');
    expect(prompt.toLowerCase()).toContain('seo');
    expect(prompt).toContain('metaTitle');
    expect(prompt).toContain('metaDescription');
  });
});

describe('buildContentUserPrompt', () => {
  it('should include business description', () => {
    const description = 'A local bakery specializing in artisan bread';
    const prompt = buildContentUserPrompt({
      businessDescription: description,
      pageSlug: 'home',
      sectionTypes: ['hero', 'features'],
    });

    expect(prompt).toContain(description);
  });

  it('should include page slug', () => {
    const prompt = buildContentUserPrompt({
      businessDescription: 'Test business',
      pageSlug: 'about',
      sectionTypes: ['hero'],
    });

    expect(prompt).toContain('about');
  });

  it('should include section types to generate', () => {
    const prompt = buildContentUserPrompt({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero', 'features', 'cta'],
    });

    expect(prompt).toContain('hero');
    expect(prompt).toContain('features');
    expect(prompt).toContain('cta');
  });

  it('should include existing content when provided', () => {
    const prompt = buildContentUserPrompt({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
      existingContent: {
        businessName: 'Acme Corp',
        tagline: 'Innovation First',
      },
    });

    expect(prompt).toContain('Acme Corp');
    expect(prompt).toContain('Innovation First');
  });

  it('should work without existing content', () => {
    const prompt = buildContentUserPrompt({
      businessDescription: 'Test business',
      pageSlug: 'home',
      sectionTypes: ['hero'],
    });

    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe('Tone-specific prompt variations', () => {
  const testCases = [
    { tone: 'professional', keywords: ['formal', 'corporate', 'expertise'] },
    { tone: 'friendly', keywords: ['warm', 'approachable', 'welcoming'] },
    { tone: 'bold', keywords: ['confident', 'assertive', 'strong'] },
    { tone: 'minimal', keywords: ['clean', 'concise', 'simple'] },
    { tone: 'playful', keywords: ['fun', 'energetic', 'creative'] },
  ] as const;

  for (const { tone, keywords } of testCases) {
    it(`should generate ${tone} tone instructions with appropriate keywords`, () => {
      const instructions = getToneInstructions(tone);
      const lowerInstructions = instructions.toLowerCase();

      // At least one of the keywords should appear
      const hasKeyword = keywords.some((keyword) =>
        lowerInstructions.includes(keyword)
      );
      expect(hasKeyword).toBe(true);
    });
  }
});

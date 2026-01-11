/**
 * Variety Engine Tests
 *
 * Tests for the theme generation engine that creates industry-specific
 * color schemes, typography, and styling configurations.
 */

import { describe, it, expect } from 'vitest';
import {
  generateTheme,
  detectIndustry,
  getIndustryPreset,
  type ThemeConfig,
  type IndustryType,
} from '../engine';

describe('Variety Engine', () => {
  describe('detectIndustry', () => {
    it('should detect restaurant/coffee shop industry from description', () => {
      const descriptions = [
        'A cozy coffee shop serving artisan espresso',
        'Italian restaurant with authentic cuisine',
        'Local bakery and cafe',
        'Farm-to-table dining experience',
      ];

      for (const desc of descriptions) {
        const industry = detectIndustry(desc);
        expect(['restaurant', 'cafe', 'food']).toContain(industry);
      }
    });

    it('should detect SaaS/tech industry from description', () => {
      const descriptions = [
        'Cloud-based project management software',
        'AI-powered analytics platform',
        'Enterprise SaaS solution for HR',
        'Startup building developer tools',
      ];

      for (const desc of descriptions) {
        const industry = detectIndustry(desc);
        expect(['saas', 'tech', 'software']).toContain(industry);
      }
    });

    it('should detect creative/portfolio industry from description', () => {
      const descriptions = [
        'Freelance graphic designer portfolio',
        'Photography studio and gallery',
        'Creative agency for brand design',
        'Artist showcasing digital artwork',
      ];

      for (const desc of descriptions) {
        const industry = detectIndustry(desc);
        expect(['creative', 'portfolio', 'design']).toContain(industry);
      }
    });

    it('should detect professional services industry from description', () => {
      const descriptions = [
        'Law firm specializing in corporate law',
        'Financial advisory services',
        'Accounting firm for small businesses',
        'Management consulting services',
      ];

      for (const desc of descriptions) {
        const industry = detectIndustry(desc);
        expect(['professional', 'legal', 'finance', 'consulting']).toContain(industry);
      }
    });

    it('should detect health/wellness industry from description', () => {
      const descriptions = [
        'Yoga studio and wellness center',
        'Medical clinic for family health',
        'Spa and massage therapy',
        'Mental health counseling services',
      ];

      for (const desc of descriptions) {
        const industry = detectIndustry(desc);
        expect(['health', 'wellness', 'medical', 'spa']).toContain(industry);
      }
    });

    it('should return "general" for unrecognized industries', () => {
      const industry = detectIndustry('Something completely random and unrelated');
      expect(industry).toBe('general');
    });
  });

  describe('getIndustryPreset', () => {
    it('should return warm colors for restaurant industry', () => {
      const preset = getIndustryPreset('restaurant');

      expect(preset.colors).toBeDefined();
      expect(preset.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      // Restaurant colors should be warm (browns, oranges, earthy)
      expect(preset.style.warmth).toBe('warm');
    });

    it('should return modern colors for SaaS industry', () => {
      const preset = getIndustryPreset('saas');

      expect(preset.colors).toBeDefined();
      expect(preset.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      // SaaS colors should be modern (blues, purples)
      expect(preset.style.warmth).toBe('cool');
    });

    it('should return bold colors for creative industry', () => {
      const preset = getIndustryPreset('creative');

      expect(preset.colors).toBeDefined();
      expect(preset.typography.headingFont).toBeDefined();
      // Creative should have display-style fonts
      expect(preset.style.contrast).toBe('high');
    });

    it('should return conservative colors for professional industry', () => {
      const preset = getIndustryPreset('professional');

      expect(preset.colors).toBeDefined();
      // Professional colors should be conservative (navy, gold)
      expect(preset.style.formality).toBe('formal');
    });

    it('should return calming colors for health/wellness industry', () => {
      const preset = getIndustryPreset('health');

      expect(preset.colors).toBeDefined();
      // Health colors should be calming (greens, soft blues)
      expect(preset.style.warmth).toBe('neutral');
      expect(preset.style.mood).toBe('calming');
    });
  });

  describe('generateTheme', () => {
    it('should generate a complete theme config from business description', () => {
      const theme = generateTheme({
        businessDescription: 'A cozy coffee shop serving artisan espresso and pastries',
        businessName: 'Brew & Bean',
      });

      expect(theme.colors).toBeDefined();
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.secondary).toBeDefined();
      expect(theme.colors.accent).toBeDefined();
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.textMuted).toBeDefined();
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.surface).toBeDefined();
    });

    it('should generate typography config', () => {
      const theme = generateTheme({
        businessDescription: 'Tech startup building AI tools',
        businessName: 'AI Labs',
      });

      expect(theme.typography).toBeDefined();
      expect(theme.typography.headingFont).toBeDefined();
      expect(theme.typography.bodyFont).toBeDefined();
      expect(theme.typography.headingWeight).toBeDefined();
      expect(theme.typography.bodyWeight).toBeDefined();
    });

    it('should generate style config', () => {
      const theme = generateTheme({
        businessDescription: 'Law firm',
        businessName: 'Smith & Associates',
      });

      expect(theme.style).toBeDefined();
      expect(['none', 'sm', 'md', 'lg', 'full']).toContain(theme.style.borderRadius);
      expect(['none', 'subtle', 'medium', 'dramatic']).toContain(theme.style.shadowStyle);
      expect(['solid', 'outline', 'gradient']).toContain(theme.style.buttonStyle);
    });

    it('should generate different themes for different industries', () => {
      const coffeeTheme = generateTheme({
        businessDescription: 'Coffee shop and bakery',
        businessName: 'Bean Counter',
      });

      const saasTheme = generateTheme({
        businessDescription: 'Cloud software platform',
        businessName: 'CloudOps',
      });

      // Themes should be different
      expect(coffeeTheme.colors.primary).not.toBe(saasTheme.colors.primary);
      expect(coffeeTheme.typography.headingFont).not.toBe(saasTheme.typography.headingFont);
    });

    it('should add variety within same industry', () => {
      // Generate multiple themes for the same industry type
      const theme1 = generateTheme({
        businessDescription: 'Coffee shop downtown',
        businessName: 'Morning Brew',
        seed: 1,
      });

      const theme2 = generateTheme({
        businessDescription: 'Coffee shop in suburbs',
        businessName: 'Bean Dreams',
        seed: 2,
      });

      // Same industry but should have some variation
      // Either different colors OR different typography OR different style
      const hasDifference =
        theme1.colors.primary !== theme2.colors.primary ||
        theme1.typography.headingFont !== theme2.typography.headingFont ||
        theme1.style.borderRadius !== theme2.style.borderRadius;

      expect(hasDifference).toBe(true);
    });

    it('should respect user color preferences when provided', () => {
      const theme = generateTheme({
        businessDescription: 'Coffee shop',
        businessName: 'Custom Cafe',
        colorPreferences: {
          primary: '#FF5733',
          secondary: '#33FF57',
        },
      });

      expect(theme.colors.primary).toBe('#FF5733');
      expect(theme.colors.secondary).toBe('#33FF57');
    });
  });

  describe('ThemeConfig CSS generation', () => {
    it('should generate valid CSS custom properties', () => {
      const theme = generateTheme({
        businessDescription: 'Test business',
        businessName: 'Test',
      });

      // Validate hex colors
      expect(theme.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should generate Google Font-compatible font names', () => {
      const theme = generateTheme({
        businessDescription: 'Test business',
        businessName: 'Test',
      });

      // Font names should be valid (no special characters that would break imports)
      expect(theme.typography.headingFont).toMatch(/^[a-zA-Z\s]+$/);
      expect(theme.typography.bodyFont).toMatch(/^[a-zA-Z\s]+$/);
    });
  });
});

/**
 * Template Library Tests
 *
 * Tests for the layout template system that provides weighted
 * layout selection based on industry type.
 */

import { describe, it, expect } from 'vitest';
import {
  getLayoutWeights,
  selectLayout,
  INDUSTRY_PRESETS,
  type LayoutSection,
  type IndustryType,
} from '../templates';

describe('Template Library', () => {
  describe('getLayoutWeights', () => {
    it('should return layout weights for restaurant industry', () => {
      const weights = getLayoutWeights('restaurant');

      expect(weights.hero).toBeDefined();
      expect(weights.features).toBeDefined();
      expect(weights.testimonials).toBeDefined();
      expect(weights.cta).toBeDefined();
      expect(weights.footer).toBeDefined();
    });

    it('should return layout weights for saas industry', () => {
      const weights = getLayoutWeights('saas');

      expect(weights.hero).toBeDefined();
      // SaaS should favor split layouts for hero
      expect(weights.hero['split-right']).toBeGreaterThan(0);
    });

    it('should return layout weights for creative industry', () => {
      const weights = getLayoutWeights('creative');

      expect(weights.hero).toBeDefined();
      // Creative should favor fullscreen or minimal layouts
      expect(weights.hero['fullscreen'] || weights.hero['minimal']).toBeGreaterThan(0);
    });

    it('should return default weights for unknown industry', () => {
      const weights = getLayoutWeights('unknown' as IndustryType);

      expect(weights.hero).toBeDefined();
      expect(weights.features).toBeDefined();
    });

    it('should have weights that sum to 1.0 for each section', () => {
      const industries: IndustryType[] = ['restaurant', 'saas', 'creative', 'professional', 'health'];

      for (const industry of industries) {
        const weights = getLayoutWeights(industry);

        for (const section of Object.keys(weights) as LayoutSection[]) {
          const sectionWeights = weights[section];
          const sum = Object.values(sectionWeights).reduce((a, b) => a + b, 0);
          expect(sum).toBeCloseTo(1.0, 2);
        }
      }
    });
  });

  describe('selectLayout', () => {
    it('should select a valid layout for hero section', () => {
      const validLayouts = ['centered', 'split-left', 'split-right', 'minimal', 'fullscreen'];

      for (let i = 0; i < 10; i++) {
        const layout = selectLayout('restaurant', 'hero', i);
        expect(validLayouts).toContain(layout);
      }
    });

    it('should select a valid layout for features section', () => {
      const validLayouts = ['grid-3', 'grid-4', 'grid-2', 'cards', 'alternating', 'icon-left'];

      for (let i = 0; i < 10; i++) {
        const layout = selectLayout('saas', 'features', i);
        expect(validLayouts).toContain(layout);
      }
    });

    it('should produce variation with different seeds', () => {
      const layouts = new Set<string>();

      // Run with different seeds to check for variation
      for (let seed = 0; seed < 100; seed++) {
        layouts.add(selectLayout('restaurant', 'hero', seed));
      }

      // Should produce at least 2 different layouts
      expect(layouts.size).toBeGreaterThanOrEqual(2);
    });

    it('should be deterministic with same seed', () => {
      const layout1 = selectLayout('restaurant', 'hero', 42);
      const layout2 = selectLayout('restaurant', 'hero', 42);

      expect(layout1).toBe(layout2);
    });

    it('should respect industry-specific preferences', () => {
      // Run many iterations to check distribution
      const restaurantLayouts: Record<string, number> = {};
      const saasLayouts: Record<string, number> = {};

      for (let seed = 0; seed < 1000; seed++) {
        const rLayout = selectLayout('restaurant', 'hero', seed);
        restaurantLayouts[rLayout] = (restaurantLayouts[rLayout] || 0) + 1;

        const sLayout = selectLayout('saas', 'hero', seed);
        saasLayouts[sLayout] = (saasLayouts[sLayout] || 0) + 1;
      }

      // Restaurant should favor fullscreen/centered
      // SaaS should favor split layouts
      // These are probabilistic but should be statistically different
      expect(restaurantLayouts).not.toEqual(saasLayouts);
    });
  });

  describe('INDUSTRY_PRESETS', () => {
    it('should have presets for all major industries', () => {
      const requiredIndustries = ['restaurant', 'saas', 'creative', 'professional', 'health', 'general'];

      for (const industry of requiredIndustries) {
        expect(INDUSTRY_PRESETS[industry as IndustryType]).toBeDefined();
      }
    });

    it('should have complete color definitions in each preset', () => {
      for (const [industry, preset] of Object.entries(INDUSTRY_PRESETS)) {
        expect(preset.colors).toBeDefined();
        expect(preset.colors.length).toBeGreaterThanOrEqual(3);

        // Each color palette should have primary, secondary, accent at minimum
        for (const palette of preset.colors) {
          expect(palette.primary).toBeDefined();
          expect(palette.secondary).toBeDefined();
          expect(palette.accent).toBeDefined();
        }
      }
    });

    it('should have typography options in each preset', () => {
      for (const [industry, preset] of Object.entries(INDUSTRY_PRESETS)) {
        expect(preset.typography).toBeDefined();
        expect(preset.typography.length).toBeGreaterThanOrEqual(2);

        for (const typo of preset.typography) {
          expect(typo.headingFont).toBeDefined();
          expect(typo.bodyFont).toBeDefined();
        }
      }
    });

    it('should have style options in each preset', () => {
      for (const [industry, preset] of Object.entries(INDUSTRY_PRESETS)) {
        expect(preset.styles).toBeDefined();
        expect(preset.styles.length).toBeGreaterThanOrEqual(2);

        for (const style of preset.styles) {
          expect(style.borderRadius).toBeDefined();
          expect(style.shadowStyle).toBeDefined();
          expect(style.buttonStyle).toBeDefined();
        }
      }
    });
  });
});

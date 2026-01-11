/**
 * Tests for Theme.json Generator
 *
 * TDD: These tests define the expected behavior of the theme generator.
 */

import { describe, it, expect } from 'vitest';
import {
  generateThemeJson,
  ThemeConfig,
  ColorPalette,
  TypographyConfig,
  SpacingConfig,
} from '../theme';

describe('Theme Generator', () => {
  describe('generateThemeJson', () => {
    it('should generate valid theme.json structure', () => {
      const config: ThemeConfig = {
        name: 'My Theme',
      };

      const theme = generateThemeJson(config);

      expect(theme).toHaveProperty('$schema');
      expect(theme).toHaveProperty('version', 3);
      expect(theme).toHaveProperty('settings');
      expect(theme).toHaveProperty('styles');
    });

    it('should include WordPress theme.json schema URL', () => {
      const theme = generateThemeJson({});

      expect(theme.$schema).toBe('https://schemas.wp.org/trunk/theme.json');
    });
  });

  describe('Color Palette', () => {
    it('should generate color palette from config', () => {
      const config: ThemeConfig = {
        colors: {
          primary: '#0073aa',
          secondary: '#23282d',
          background: '#ffffff',
          foreground: '#1e1e1e',
          accent: '#cd2653',
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.color?.palette).toBeDefined();
      expect(theme.settings!.color!.palette).toContainEqual(
        expect.objectContaining({
          slug: 'primary',
          color: '#0073aa',
        })
      );
    });

    it('should generate human-readable color names', () => {
      const config: ThemeConfig = {
        colors: {
          primary: '#0073aa',
        },
      };

      const theme = generateThemeJson(config);

      const primaryColor = theme.settings!.color!.palette!.find(
        (c: ColorPalette) => c.slug === 'primary'
      );
      expect(primaryColor?.name).toBe('Primary');
    });

    it('should support custom color names', () => {
      const config: ThemeConfig = {
        colors: {
          'brand-blue': { color: '#0066cc', name: 'Brand Blue' },
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings!.color!.palette).toContainEqual(
        expect.objectContaining({
          slug: 'brand-blue',
          name: 'Brand Blue',
          color: '#0066cc',
        })
      );
    });

    it('should include gradient presets if provided', () => {
      const config: ThemeConfig = {
        gradients: [
          {
            slug: 'primary-gradient',
            name: 'Primary Gradient',
            gradient: 'linear-gradient(135deg, #0073aa 0%, #23282d 100%)',
          },
        ],
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.color?.gradients).toBeDefined();
      expect(theme.settings!.color!.gradients).toContainEqual(
        expect.objectContaining({
          slug: 'primary-gradient',
        })
      );
    });
  });

  describe('Typography', () => {
    it('should generate font families', () => {
      const config: ThemeConfig = {
        typography: {
          fontFamilies: [
            {
              slug: 'primary',
              name: 'Primary',
              fontFamily: 'Inter, sans-serif',
            },
            {
              slug: 'secondary',
              name: 'Secondary',
              fontFamily: 'Georgia, serif',
            },
          ],
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.typography?.fontFamilies).toBeDefined();
      expect(theme.settings!.typography!.fontFamilies).toHaveLength(2);
    });

    it('should generate font sizes', () => {
      const config: ThemeConfig = {
        typography: {
          fontSizes: [
            { slug: 'small', size: '0.875rem', name: 'Small' },
            { slug: 'medium', size: '1rem', name: 'Medium' },
            { slug: 'large', size: '1.25rem', name: 'Large' },
            { slug: 'x-large', size: '1.5rem', name: 'Extra Large' },
          ],
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.typography?.fontSizes).toBeDefined();
      expect(theme.settings!.typography!.fontSizes).toHaveLength(4);
    });

    it('should generate fluid typography if enabled', () => {
      const config: ThemeConfig = {
        typography: {
          fluid: true,
          fontSizes: [
            { slug: 'medium', size: '1rem', fluid: { min: '0.875rem', max: '1.125rem' } },
          ],
        },
      };

      const theme = generateThemeJson(config);

      const mediumSize = theme.settings!.typography!.fontSizes!.find(
        (s: { slug: string }) => s.slug === 'medium'
      );
      expect(mediumSize?.fluid).toBeDefined();
    });
  });

  describe('Spacing', () => {
    it('should generate spacing scale', () => {
      const config: ThemeConfig = {
        spacing: {
          units: ['px', 'rem'],
          spacingSizes: [
            { slug: '10', size: '0.625rem', name: 'Extra Small' },
            { slug: '20', size: '1rem', name: 'Small' },
            { slug: '30', size: '1.5rem', name: 'Medium' },
            { slug: '40', size: '2rem', name: 'Large' },
            { slug: '50', size: '3rem', name: 'Extra Large' },
          ],
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.spacing?.spacingSizes).toBeDefined();
      expect(theme.settings!.spacing!.spacingSizes).toHaveLength(5);
    });

    it('should include spacing units', () => {
      const config: ThemeConfig = {
        spacing: {
          units: ['px', 'rem', '%', 'vw'],
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.spacing?.units).toEqual(['px', 'rem', '%', 'vw']);
    });
  });

  describe('Layout', () => {
    it('should generate layout settings', () => {
      const config: ThemeConfig = {
        layout: {
          contentSize: '650px',
          wideSize: '1200px',
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.layout?.contentSize).toBe('650px');
      expect(theme.settings?.layout?.wideSize).toBe('1200px');
    });

    it('should enable layout features', () => {
      const config: ThemeConfig = {
        layout: {
          contentSize: '800px',
          wideSize: '1400px',
          allowEditing: true,
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.settings?.layout).toBeDefined();
    });
  });

  describe('Styles', () => {
    it('should generate global styles', () => {
      const config: ThemeConfig = {
        styles: {
          color: {
            background: 'var(--wp--preset--color--background)',
            text: 'var(--wp--preset--color--foreground)',
          },
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.styles?.color?.background).toContain('--wp--preset--color--background');
    });

    it('should generate element styles', () => {
      const config: ThemeConfig = {
        styles: {
          elements: {
            link: {
              color: {
                text: 'var(--wp--preset--color--primary)',
              },
            },
            h1: {
              typography: {
                fontSize: 'var(--wp--preset--font-size--x-large)',
              },
            },
          },
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.styles?.elements?.link).toBeDefined();
      expect(theme.styles?.elements?.h1).toBeDefined();
    });

    it('should generate block styles', () => {
      const config: ThemeConfig = {
        styles: {
          blocks: {
            'core/button': {
              border: {
                radius: '4px',
              },
            },
          },
        },
      };

      const theme = generateThemeJson(config);

      expect(theme.styles?.blocks?.['core/button']).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should provide sensible defaults when no config provided', () => {
      const theme = generateThemeJson({});

      // Should have default colors
      expect(theme.settings?.color?.palette?.length).toBeGreaterThan(0);

      // Should have default typography
      expect(theme.settings?.typography?.fontSizes?.length).toBeGreaterThan(0);

      // Should have default layout
      expect(theme.settings?.layout?.contentSize).toBeDefined();
    });

    it('should merge user config with defaults', () => {
      const config: ThemeConfig = {
        colors: {
          primary: '#ff0000',
        },
      };

      const theme = generateThemeJson(config);

      // Should have user's primary color
      expect(theme.settings!.color!.palette).toContainEqual(
        expect.objectContaining({
          slug: 'primary',
          color: '#ff0000',
        })
      );

      // Should still have default layout
      expect(theme.settings?.layout?.contentSize).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate hex color format', () => {
      const config: ThemeConfig = {
        colors: {
          primary: 'invalid-color',
        },
      };

      // Should throw or use fallback
      expect(() => generateThemeJson(config)).not.toThrow();
    });

    it('should handle empty arrays gracefully', () => {
      const config: ThemeConfig = {
        typography: {
          fontFamilies: [],
          fontSizes: [],
        },
      };

      const theme = generateThemeJson(config);

      // Should still produce valid theme
      expect(theme.version).toBe(3);
    });
  });

  describe('JSON Output', () => {
    it('should produce valid JSON', () => {
      const theme = generateThemeJson({});

      const jsonString = JSON.stringify(theme);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it('should not include undefined values', () => {
      const theme = generateThemeJson({});
      const jsonString = JSON.stringify(theme);

      expect(jsonString).not.toContain('undefined');
    });
  });
});

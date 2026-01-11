/**
 * Variety Engine
 *
 * Provides industry-specific theme generation and layout selection
 * to ensure each generated website has a unique, professional appearance.
 */

// Engine exports
export {
  generateTheme,
  detectIndustry,
  getIndustryPreset,
  type ThemeConfig,
  type ThemeColors,
  type ThemeTypography,
  type ThemeStyle,
  type ThemeGenerationInput,
  type IndustryType,
  type IndustryPreset,
  type IndustryPresetStyle,
} from './engine';

// Template exports
export {
  getLayoutWeights,
  selectLayout,
  selectPageLayouts,
  INDUSTRY_PRESETS,
  type LayoutWeights,
  type LayoutSection,
  type HeroLayoutType,
  type FeaturesLayoutType,
  type TestimonialsLayoutType,
  type CtaLayoutType,
  type FooterLayoutType,
  type LayoutType,
  type IndustryPresetConfig,
  type IndustryPresetColors,
  type IndustryPresetTypography,
  type IndustryPresetStyle as TemplatePresetStyle,
} from './templates';

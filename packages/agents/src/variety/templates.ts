/**
 * Template Library
 *
 * Provides weighted layout selection based on industry type.
 * Each industry has preferred layouts that work best for their
 * typical content and user expectations.
 */

import type { IndustryType } from './engine';

// ============================================================================
// Types
// ============================================================================

export type { IndustryType };

export type LayoutSection = 'hero' | 'features' | 'testimonials' | 'cta' | 'footer';

export type HeroLayoutType = 'centered' | 'split-left' | 'split-right' | 'minimal' | 'fullscreen';
export type FeaturesLayoutType = 'grid-3' | 'grid-4' | 'grid-2' | 'cards' | 'alternating' | 'icon-left';
export type TestimonialsLayoutType = 'cards' | 'single-large' | 'quote-wall' | 'centered';
export type CtaLayoutType = 'centered' | 'split' | 'banner' | 'card';
export type FooterLayoutType = 'columns' | 'minimal' | 'centered' | 'mega';

export type LayoutType = HeroLayoutType | FeaturesLayoutType | TestimonialsLayoutType | CtaLayoutType | FooterLayoutType;

export interface LayoutWeights {
  hero: Record<HeroLayoutType, number>;
  features: Record<FeaturesLayoutType, number>;
  testimonials: Record<TestimonialsLayoutType, number>;
  cta: Record<CtaLayoutType, number>;
  footer: Record<FooterLayoutType, number>;
}

export interface IndustryPresetColors {
  primary: string;
  secondary: string;
  accent: string;
  text?: string;
  textMuted?: string;
  background?: string;
  surface?: string;
}

export interface IndustryPresetTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight?: string;
  bodyWeight?: string;
}

export interface IndustryPresetStyle {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadowStyle: 'none' | 'subtle' | 'medium' | 'dramatic';
  buttonStyle: 'solid' | 'outline' | 'gradient';
}

export interface IndustryPresetConfig {
  colors: IndustryPresetColors[];
  typography: IndustryPresetTypography[];
  styles: IndustryPresetStyle[];
  layoutWeights: LayoutWeights;
}

// ============================================================================
// Industry Layout Weights
// ============================================================================

const RESTAURANT_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.2,
    'split-left': 0.15,
    'split-right': 0.15,
    'minimal': 0.1,
    'fullscreen': 0.4,
  },
  features: {
    'grid-3': 0.35,
    'grid-4': 0.05,
    'grid-2': 0.15,
    'cards': 0.3,
    'alternating': 0.1,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.35,
    'single-large': 0.25,
    'quote-wall': 0.15,
    'centered': 0.25,
  },
  cta: {
    'centered': 0.4,
    'split': 0.2,
    'banner': 0.25,
    'card': 0.15,
  },
  footer: {
    'columns': 0.4,
    'minimal': 0.2,
    'centered': 0.25,
    'mega': 0.15,
  },
};

const SAAS_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.25,
    'split-left': 0.15,
    'split-right': 0.35,
    'minimal': 0.15,
    'fullscreen': 0.1,
  },
  features: {
    'grid-3': 0.25,
    'grid-4': 0.25,
    'grid-2': 0.1,
    'cards': 0.25,
    'alternating': 0.1,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.4,
    'single-large': 0.2,
    'quote-wall': 0.25,
    'centered': 0.15,
  },
  cta: {
    'centered': 0.35,
    'split': 0.25,
    'banner': 0.15,
    'card': 0.25,
  },
  footer: {
    'columns': 0.35,
    'minimal': 0.15,
    'centered': 0.15,
    'mega': 0.35,
  },
};

const CREATIVE_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.15,
    'split-left': 0.15,
    'split-right': 0.15,
    'minimal': 0.25,
    'fullscreen': 0.3,
  },
  features: {
    'grid-3': 0.2,
    'grid-4': 0.15,
    'grid-2': 0.25,
    'cards': 0.15,
    'alternating': 0.2,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.25,
    'single-large': 0.35,
    'quote-wall': 0.2,
    'centered': 0.2,
  },
  cta: {
    'centered': 0.3,
    'split': 0.3,
    'banner': 0.15,
    'card': 0.25,
  },
  footer: {
    'columns': 0.25,
    'minimal': 0.35,
    'centered': 0.3,
    'mega': 0.1,
  },
};

const PROFESSIONAL_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.35,
    'split-left': 0.25,
    'split-right': 0.2,
    'minimal': 0.15,
    'fullscreen': 0.05,
  },
  features: {
    'grid-3': 0.35,
    'grid-4': 0.15,
    'grid-2': 0.2,
    'cards': 0.15,
    'alternating': 0.1,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.35,
    'single-large': 0.3,
    'quote-wall': 0.15,
    'centered': 0.2,
  },
  cta: {
    'centered': 0.4,
    'split': 0.3,
    'banner': 0.15,
    'card': 0.15,
  },
  footer: {
    'columns': 0.5,
    'minimal': 0.15,
    'centered': 0.15,
    'mega': 0.2,
  },
};

const HEALTH_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.3,
    'split-left': 0.2,
    'split-right': 0.25,
    'minimal': 0.15,
    'fullscreen': 0.1,
  },
  features: {
    'grid-3': 0.35,
    'grid-4': 0.1,
    'grid-2': 0.15,
    'cards': 0.25,
    'alternating': 0.1,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.35,
    'single-large': 0.25,
    'quote-wall': 0.15,
    'centered': 0.25,
  },
  cta: {
    'centered': 0.4,
    'split': 0.2,
    'banner': 0.15,
    'card': 0.25,
  },
  footer: {
    'columns': 0.4,
    'minimal': 0.2,
    'centered': 0.25,
    'mega': 0.15,
  },
};

const GENERAL_WEIGHTS: LayoutWeights = {
  hero: {
    'centered': 0.3,
    'split-left': 0.15,
    'split-right': 0.2,
    'minimal': 0.15,
    'fullscreen': 0.2,
  },
  features: {
    'grid-3': 0.35,
    'grid-4': 0.15,
    'grid-2': 0.15,
    'cards': 0.2,
    'alternating': 0.1,
    'icon-left': 0.05,
  },
  testimonials: {
    'cards': 0.35,
    'single-large': 0.2,
    'quote-wall': 0.2,
    'centered': 0.25,
  },
  cta: {
    'centered': 0.35,
    'split': 0.25,
    'banner': 0.2,
    'card': 0.2,
  },
  footer: {
    'columns': 0.4,
    'minimal': 0.2,
    'centered': 0.2,
    'mega': 0.2,
  },
};

// ============================================================================
// Industry Presets (Full)
// ============================================================================

export const INDUSTRY_PRESETS: Record<string, IndustryPresetConfig> = {
  restaurant: {
    colors: [
      { primary: '#8B4513', secondary: '#D2691E', accent: '#CD853F' },
      { primary: '#6F4E37', secondary: '#A0522D', accent: '#DAA520' },
      { primary: '#4A6741', secondary: '#8B7355', accent: '#E07B39' },
    ],
    typography: [
      { headingFont: 'Playfair Display', bodyFont: 'Lora' },
      { headingFont: 'Merriweather', bodyFont: 'Source Sans Pro' },
      { headingFont: 'DM Serif Display', bodyFont: 'Nunito' },
    ],
    styles: [
      { borderRadius: 'md', shadowStyle: 'subtle', buttonStyle: 'solid' },
      { borderRadius: 'lg', shadowStyle: 'medium', buttonStyle: 'solid' },
      { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'outline' },
    ],
    layoutWeights: RESTAURANT_WEIGHTS,
  },

  saas: {
    colors: [
      { primary: '#6366F1', secondary: '#8B5CF6', accent: '#06B6D4' },
      { primary: '#3B82F6', secondary: '#1E40AF', accent: '#10B981' },
      { primary: '#7C3AED', secondary: '#4F46E5', accent: '#F59E0B' },
    ],
    typography: [
      { headingFont: 'Inter', bodyFont: 'Inter' },
      { headingFont: 'Poppins', bodyFont: 'Open Sans' },
      { headingFont: 'Manrope', bodyFont: 'Inter' },
    ],
    styles: [
      { borderRadius: 'lg', shadowStyle: 'medium', buttonStyle: 'gradient' },
      { borderRadius: 'md', shadowStyle: 'subtle', buttonStyle: 'solid' },
      { borderRadius: 'full', shadowStyle: 'dramatic', buttonStyle: 'gradient' },
    ],
    layoutWeights: SAAS_WEIGHTS,
  },

  creative: {
    colors: [
      { primary: '#EC4899', secondary: '#8B5CF6', accent: '#F97316' },
      { primary: '#000000', secondary: '#374151', accent: '#EF4444' },
      { primary: '#14B8A6', secondary: '#0891B2', accent: '#F43F5E' },
    ],
    typography: [
      { headingFont: 'Space Grotesk', bodyFont: 'DM Sans' },
      { headingFont: 'Outfit', bodyFont: 'Karla' },
      { headingFont: 'Plus Jakarta Sans', bodyFont: 'Rubik' },
    ],
    styles: [
      { borderRadius: 'none', shadowStyle: 'dramatic', buttonStyle: 'solid' },
      { borderRadius: 'none', shadowStyle: 'none', buttonStyle: 'outline' },
      { borderRadius: 'lg', shadowStyle: 'medium', buttonStyle: 'solid' },
    ],
    layoutWeights: CREATIVE_WEIGHTS,
  },

  professional: {
    colors: [
      { primary: '#1E3A5F', secondary: '#2D5A87', accent: '#B8860B' },
      { primary: '#1F2937', secondary: '#374151', accent: '#92400E' },
      { primary: '#0E4D64', secondary: '#146C94', accent: '#FFB800' },
    ],
    typography: [
      { headingFont: 'Libre Baskerville', bodyFont: 'Source Serif Pro' },
      { headingFont: 'Cormorant Garamond', bodyFont: 'Crimson Text' },
      { headingFont: 'Spectral', bodyFont: 'Work Sans' },
    ],
    styles: [
      { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'solid' },
      { borderRadius: 'none', shadowStyle: 'none', buttonStyle: 'solid' },
      { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'outline' },
    ],
    layoutWeights: PROFESSIONAL_WEIGHTS,
  },

  health: {
    colors: [
      { primary: '#059669', secondary: '#0D9488', accent: '#F59E0B' },
      { primary: '#7C9A92', secondary: '#9FB1AB', accent: '#E8B4A2' },
      { primary: '#0EA5E9', secondary: '#0284C7', accent: '#14B8A6' },
    ],
    typography: [
      { headingFont: 'Nunito Sans', bodyFont: 'Quicksand' },
      { headingFont: 'Josefin Sans', bodyFont: 'Mulish' },
      { headingFont: 'Lexend', bodyFont: 'Lato' },
    ],
    styles: [
      { borderRadius: 'lg', shadowStyle: 'subtle', buttonStyle: 'solid' },
      { borderRadius: 'full', shadowStyle: 'subtle', buttonStyle: 'solid' },
      { borderRadius: 'md', shadowStyle: 'none', buttonStyle: 'outline' },
    ],
    layoutWeights: HEALTH_WEIGHTS,
  },

  general: {
    colors: [
      { primary: '#3B82F6', secondary: '#6366F1', accent: '#F59E0B' },
      { primary: '#10B981', secondary: '#059669', accent: '#6366F1' },
      { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#F97316' },
    ],
    typography: [
      { headingFont: 'Inter', bodyFont: 'Inter' },
      { headingFont: 'Poppins', bodyFont: 'Open Sans' },
      { headingFont: 'Plus Jakarta Sans', bodyFont: 'DM Sans' },
    ],
    styles: [
      { borderRadius: 'md', shadowStyle: 'medium', buttonStyle: 'solid' },
      { borderRadius: 'lg', shadowStyle: 'subtle', buttonStyle: 'gradient' },
      { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'outline' },
    ],
    layoutWeights: GENERAL_WEIGHTS,
  },
};

// Map industry types to preset keys
const INDUSTRY_TO_PRESET: Record<IndustryType, string> = {
  restaurant: 'restaurant',
  cafe: 'restaurant',
  food: 'restaurant',
  saas: 'saas',
  tech: 'saas',
  software: 'saas',
  creative: 'creative',
  portfolio: 'creative',
  design: 'creative',
  professional: 'professional',
  legal: 'professional',
  finance: 'professional',
  consulting: 'professional',
  health: 'health',
  wellness: 'health',
  medical: 'health',
  spa: 'health',
  general: 'general',
};

// ============================================================================
// Simple Seeded Random Generator
// ============================================================================

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Get layout weights for a specific industry
 */
export function getLayoutWeights(industry: IndustryType): LayoutWeights {
  const presetKey = INDUSTRY_TO_PRESET[industry] || 'general';
  const preset = INDUSTRY_PRESETS[presetKey] || INDUSTRY_PRESETS.general;
  return preset.layoutWeights;
}

/**
 * Select a layout based on weights and seed
 */
export function selectLayout(
  industry: IndustryType,
  section: LayoutSection,
  seed: number = Math.floor(Math.random() * 1000000)
): string {
  const weights = getLayoutWeights(industry);
  const sectionWeights = weights[section];

  const random = seededRandom(seed);
  const roll = random();

  let cumulative = 0;
  for (const [layout, weight] of Object.entries(sectionWeights)) {
    cumulative += weight;
    if (roll <= cumulative) {
      return layout;
    }
  }

  // Fallback to first option
  return Object.keys(sectionWeights)[0];
}

/**
 * Select all layouts for a page based on industry and seed
 */
export function selectPageLayouts(
  industry: IndustryType,
  seed: number = Math.floor(Math.random() * 1000000)
): Record<LayoutSection, string> {
  const random = seededRandom(seed);

  return {
    hero: selectLayout(industry, 'hero', Math.floor(random() * 1000000)),
    features: selectLayout(industry, 'features', Math.floor(random() * 1000000)),
    testimonials: selectLayout(industry, 'testimonials', Math.floor(random() * 1000000)),
    cta: selectLayout(industry, 'cta', Math.floor(random() * 1000000)),
    footer: selectLayout(industry, 'footer', Math.floor(random() * 1000000)),
  };
}

/**
 * Variety Engine
 *
 * Generates industry-specific themes with unique color schemes,
 * typography, and styling configurations to ensure each generated
 * website has a distinct, professional appearance.
 */

// ============================================================================
// Types
// ============================================================================

export type IndustryType =
  | 'restaurant'
  | 'cafe'
  | 'food'
  | 'saas'
  | 'tech'
  | 'software'
  | 'creative'
  | 'portfolio'
  | 'design'
  | 'professional'
  | 'legal'
  | 'finance'
  | 'consulting'
  | 'health'
  | 'wellness'
  | 'medical'
  | 'spa'
  | 'general';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  background: string;
  surface: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  bodyWeight: string;
}

export interface ThemeStyle {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadowStyle: 'none' | 'subtle' | 'medium' | 'dramatic';
  buttonStyle: 'solid' | 'outline' | 'gradient';
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  style: ThemeStyle;
  industry: IndustryType;
}

export interface ThemeGenerationInput {
  businessDescription: string;
  businessName: string;
  seed?: number;
  colorPreferences?: {
    primary?: string;
    secondary?: string;
  };
  designDirection?: DesignDirection;
}

export type DesignDirection =
  | 'modern-corporate'
  | 'bold-creative'
  | 'elegant-minimal'
  | 'tech-saas'
  | 'organic-lifestyle';

export interface DesignDirectionPreset {
  colorTendency: 'warm' | 'cool' | 'neutral';
  saturation: 'muted' | 'balanced' | 'vibrant';
  typography: 'serif' | 'sans-serif' | 'mixed';
  borderRadius: ThemeStyle['borderRadius'];
  shadowStyle: ThemeStyle['shadowStyle'];
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface IndustryPresetStyle {
  warmth: 'warm' | 'cool' | 'neutral';
  formality: 'formal' | 'casual' | 'neutral';
  contrast: 'high' | 'medium' | 'low';
  mood?: 'calming' | 'energetic' | 'professional' | 'creative';
}

export interface IndustryPreset {
  colors: ThemeColors;
  typography: ThemeTypography;
  style: ThemeStyle & IndustryPresetStyle;
}

// ============================================================================
// Industry Keywords for Detection
// ============================================================================

const INDUSTRY_KEYWORDS: Record<string, IndustryType[]> = {
  // Food & Beverage
  coffee: ['cafe', 'restaurant', 'food'],
  cafe: ['cafe', 'restaurant', 'food'],
  restaurant: ['restaurant', 'food'],
  bakery: ['cafe', 'food'],
  food: ['restaurant', 'food'],
  bistro: ['restaurant', 'food'],
  kitchen: ['restaurant', 'food'],
  dining: ['restaurant', 'food'],
  cuisine: ['restaurant', 'food'],
  catering: ['restaurant', 'food'],
  bar: ['restaurant', 'food'],
  pub: ['restaurant', 'food'],
  pizza: ['restaurant', 'food'],
  sushi: ['restaurant', 'food'],
  grill: ['restaurant', 'food'],
  deli: ['restaurant', 'food'],
  espresso: ['cafe', 'food'],
  pastry: ['cafe', 'food'],
  patisserie: ['cafe', 'food'],

  // Tech & SaaS
  saas: ['saas', 'tech', 'software'],
  software: ['saas', 'tech', 'software'],
  tech: ['tech', 'saas', 'software'],
  startup: ['saas', 'tech'],
  app: ['saas', 'tech', 'software'],
  platform: ['saas', 'tech', 'software'],
  cloud: ['saas', 'tech', 'software'],
  api: ['saas', 'tech', 'software'],
  analytics: ['saas', 'tech', 'software'],
  ai: ['saas', 'tech', 'software'],
  machine: ['saas', 'tech', 'software'],
  developer: ['saas', 'tech', 'software'],
  automation: ['saas', 'tech', 'software'],
  enterprise: ['saas', 'tech', 'software'],
  digital: ['saas', 'tech', 'software'],

  // Creative & Portfolio
  portfolio: ['portfolio', 'creative', 'design'],
  creative: ['creative', 'portfolio', 'design'],
  design: ['design', 'creative', 'portfolio'],
  photography: ['portfolio', 'creative'],
  photographer: ['portfolio', 'creative'],
  artist: ['portfolio', 'creative'],
  artwork: ['portfolio', 'creative'],
  gallery: ['portfolio', 'creative'],
  studio: ['creative', 'portfolio'],
  freelance: ['portfolio', 'creative'],
  agency: ['creative', 'design'],
  brand: ['design', 'creative'],
  illustration: ['portfolio', 'creative'],

  // Professional Services
  law: ['legal', 'professional'],
  lawyer: ['legal', 'professional'],
  attorney: ['legal', 'professional'],
  legal: ['legal', 'professional'],
  finance: ['finance', 'professional'],
  financial: ['finance', 'professional'],
  accounting: ['finance', 'professional'],
  accountant: ['finance', 'professional'],
  consulting: ['consulting', 'professional'],
  consultant: ['consulting', 'professional'],
  advisory: ['consulting', 'finance', 'professional'],
  investment: ['finance', 'professional'],
  insurance: ['finance', 'professional'],
  tax: ['finance', 'professional'],
  corporate: ['professional', 'legal'],

  // Health & Wellness
  health: ['health', 'medical', 'wellness'],
  medical: ['medical', 'health'],
  clinic: ['medical', 'health'],
  doctor: ['medical', 'health'],
  wellness: ['wellness', 'health', 'spa'],
  yoga: ['wellness', 'health', 'spa'],
  spa: ['spa', 'wellness', 'health'],
  massage: ['spa', 'wellness'],
  therapy: ['health', 'wellness', 'medical'],
  fitness: ['wellness', 'health'],
  gym: ['wellness', 'health'],
  mental: ['health', 'wellness'],
  counseling: ['health', 'wellness'],
  dental: ['medical', 'health'],
  chiropractic: ['health', 'medical'],
  holistic: ['wellness', 'health'],
  meditation: ['wellness', 'spa'],
};

// ============================================================================
// Industry Presets
// ============================================================================

const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  // Restaurant / Coffee Shop - Warm, inviting
  restaurant: {
    colors: {
      primary: '#8B4513',      // Saddle brown
      secondary: '#D2691E',    // Chocolate
      accent: '#CD853F',       // Peru
      text: '#2D1810',         // Dark brown
      textMuted: '#6B4423',    // Medium brown
      background: '#FFF8F0',   // Warm cream
      surface: '#FAEBD7',      // Antique white
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lora',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'md',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'warm',
      formality: 'casual',
      contrast: 'medium',
      mood: 'calming',
    },
  },

  cafe: {
    colors: {
      primary: '#6F4E37',      // Coffee
      secondary: '#A0522D',    // Sienna
      accent: '#DAA520',       // Goldenrod
      text: '#3E2723',         // Dark coffee
      textMuted: '#5D4037',    // Medium coffee
      background: '#FFFAF5',   // Warm white
      surface: '#F5F0E6',      // Light cream
    },
    typography: {
      headingFont: 'Merriweather',
      bodyFont: 'Source Sans Pro',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'lg',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'warm',
      formality: 'casual',
      contrast: 'medium',
    },
  },

  food: {
    colors: {
      primary: '#4A6741',      // Forest green (fresh)
      secondary: '#8B7355',    // Light brown
      accent: '#E07B39',       // Orange
      text: '#2C3E2D',         // Dark green
      textMuted: '#5C6B5D',    // Medium green
      background: '#FDFCFA',   // Off white
      surface: '#F4F1EB',      // Light cream
    },
    typography: {
      headingFont: 'DM Serif Display',
      bodyFont: 'Nunito',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'md',
      shadowStyle: 'medium',
      buttonStyle: 'solid',
      warmth: 'warm',
      formality: 'casual',
      contrast: 'medium',
    },
  },

  // SaaS / Tech - Modern, clean, professional
  saas: {
    colors: {
      primary: '#6366F1',      // Indigo
      secondary: '#8B5CF6',    // Purple
      accent: '#06B6D4',       // Cyan
      text: '#1E293B',         // Slate dark
      textMuted: '#64748B',    // Slate medium
      background: '#F8FAFC',   // Slate lightest
      surface: '#FFFFFF',      // Pure white
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'lg',
      shadowStyle: 'medium',
      buttonStyle: 'gradient',
      warmth: 'cool',
      formality: 'neutral',
      contrast: 'high',
      mood: 'professional',
    },
  },

  tech: {
    colors: {
      primary: '#3B82F6',      // Blue
      secondary: '#1E40AF',    // Dark blue
      accent: '#10B981',       // Green
      text: '#111827',         // Near black
      textMuted: '#6B7280',    // Gray
      background: '#F9FAFB',   // Light gray
      surface: '#FFFFFF',      // White
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Open Sans',
      headingWeight: '600',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'md',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'neutral',
      contrast: 'high',
      mood: 'professional',
    },
  },

  software: {
    colors: {
      primary: '#7C3AED',      // Violet
      secondary: '#4F46E5',    // Indigo
      accent: '#F59E0B',       // Amber
      text: '#18181B',         // Zinc dark
      textMuted: '#71717A',    // Zinc medium
      background: '#FAFAFA',   // Zinc lightest
      surface: '#FFFFFF',      // White
    },
    typography: {
      headingFont: 'Manrope',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'lg',
      shadowStyle: 'medium',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'neutral',
      contrast: 'high',
    },
  },

  // Creative / Portfolio - Bold, expressive
  creative: {
    colors: {
      primary: '#EC4899',      // Pink
      secondary: '#8B5CF6',    // Purple
      accent: '#F97316',       // Orange
      text: '#1F2937',         // Dark gray
      textMuted: '#6B7280',    // Medium gray
      background: '#FFFFFF',   // White
      surface: '#F9FAFB',      // Light gray
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'DM Sans',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'none',
      shadowStyle: 'dramatic',
      buttonStyle: 'solid',
      warmth: 'neutral',
      formality: 'casual',
      contrast: 'high',
      mood: 'creative',
    },
  },

  portfolio: {
    colors: {
      primary: '#000000',      // Black
      secondary: '#374151',    // Gray
      accent: '#EF4444',       // Red
      text: '#111827',         // Near black
      textMuted: '#6B7280',    // Gray
      background: '#FFFFFF',   // White
      surface: '#F3F4F6',      // Light gray
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Karla',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'none',
      shadowStyle: 'none',
      buttonStyle: 'outline',
      warmth: 'neutral',
      formality: 'casual',
      contrast: 'high',
      mood: 'creative',
    },
  },

  design: {
    colors: {
      primary: '#14B8A6',      // Teal
      secondary: '#0891B2',    // Cyan
      accent: '#F43F5E',       // Rose
      text: '#0F172A',         // Slate darkest
      textMuted: '#475569',    // Slate medium
      background: '#FFFFFF',   // White
      surface: '#F1F5F9',      // Slate light
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Rubik',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'lg',
      shadowStyle: 'medium',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'casual',
      contrast: 'high',
      mood: 'creative',
    },
  },

  // Professional Services - Conservative, trustworthy
  professional: {
    colors: {
      primary: '#1E3A5F',      // Navy
      secondary: '#2D5A87',    // Steel blue
      accent: '#B8860B',       // Dark goldenrod
      text: '#1A1A2E',         // Dark navy
      textMuted: '#4A4A6A',    // Medium navy
      background: '#FFFFFF',   // White
      surface: '#F5F7FA',      // Light blue-gray
    },
    typography: {
      headingFont: 'Libre Baskerville',
      bodyFont: 'Source Serif Pro',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'sm',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'formal',
      contrast: 'medium',
      mood: 'professional',
    },
  },

  legal: {
    colors: {
      primary: '#1F2937',      // Dark gray
      secondary: '#374151',    // Medium gray
      accent: '#92400E',       // Amber dark
      text: '#111827',         // Near black
      textMuted: '#4B5563',    // Gray
      background: '#FFFFFF',   // White
      surface: '#F9FAFB',      // Light gray
    },
    typography: {
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Crimson Text',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'none',
      shadowStyle: 'none',
      buttonStyle: 'solid',
      warmth: 'neutral',
      formality: 'formal',
      contrast: 'medium',
      mood: 'professional',
    },
  },

  finance: {
    colors: {
      primary: '#0E4D64',      // Dark teal
      secondary: '#146C94',    // Medium teal
      accent: '#FFB800',       // Gold
      text: '#0C2233',         // Dark blue
      textMuted: '#3A5A6D',    // Medium blue
      background: '#FFFFFF',   // White
      surface: '#F0F4F7',      // Light blue-gray
    },
    typography: {
      headingFont: 'Spectral',
      bodyFont: 'Work Sans',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'sm',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'formal',
      contrast: 'medium',
      mood: 'professional',
    },
  },

  consulting: {
    colors: {
      primary: '#0F766E',      // Teal dark
      secondary: '#115E59',    // Teal darker
      accent: '#D97706',       // Amber
      text: '#134E4A',         // Dark teal
      textMuted: '#5F7370',    // Medium teal-gray
      background: '#FFFFFF',   // White
      surface: '#F0FDF4',      // Light green
    },
    typography: {
      headingFont: 'IBM Plex Serif',
      bodyFont: 'IBM Plex Sans',
      headingWeight: '600',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'sm',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'formal',
      contrast: 'medium',
    },
  },

  // Health & Wellness - Calming, trustworthy
  health: {
    colors: {
      primary: '#059669',      // Emerald
      secondary: '#0D9488',    // Teal
      accent: '#F59E0B',       // Amber
      text: '#064E3B',         // Dark green
      textMuted: '#4B6B5B',    // Medium green
      background: '#F0FDF4',   // Light green
      surface: '#FFFFFF',      // White
    },
    typography: {
      headingFont: 'Nunito Sans',
      bodyFont: 'Quicksand',
      headingWeight: '700',
      bodyWeight: '500',
    },
    style: {
      borderRadius: 'lg',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'neutral',
      formality: 'neutral',
      contrast: 'low',
      mood: 'calming',
    },
  },

  wellness: {
    colors: {
      primary: '#7C9A92',      // Sage green
      secondary: '#9FB1AB',    // Light sage
      accent: '#E8B4A2',       // Soft coral
      text: '#2D3B37',         // Dark sage
      textMuted: '#5A6B65',    // Medium sage
      background: '#FAFCFB',   // Off white green
      surface: '#F2F5F4',      // Light sage
    },
    typography: {
      headingFont: 'Josefin Sans',
      bodyFont: 'Mulish',
      headingWeight: '600',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'full',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'neutral',
      formality: 'casual',
      contrast: 'low',
      mood: 'calming',
    },
  },

  medical: {
    colors: {
      primary: '#0EA5E9',      // Sky blue
      secondary: '#0284C7',    // Darker sky
      accent: '#14B8A6',       // Teal
      text: '#0C4A6E',         // Dark blue
      textMuted: '#475569',    // Slate
      background: '#F8FAFC',   // Light slate
      surface: '#FFFFFF',      // White
    },
    typography: {
      headingFont: 'Lexend',
      bodyFont: 'Lato',
      headingWeight: '600',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'md',
      shadowStyle: 'subtle',
      buttonStyle: 'solid',
      warmth: 'cool',
      formality: 'neutral',
      contrast: 'medium',
      mood: 'calming',
    },
  },

  spa: {
    colors: {
      primary: '#84A98C',      // Muted green
      secondary: '#B5C9B3',    // Light green
      accent: '#D4A574',       // Tan
      text: '#344E41',         // Dark forest
      textMuted: '#52796F',    // Medium forest
      background: '#FAF9F6',   // Cream
      surface: '#F5F3EF',      // Light cream
    },
    typography: {
      headingFont: 'Cormorant',
      bodyFont: 'Raleway',
      headingWeight: '600',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'full',
      shadowStyle: 'none',
      buttonStyle: 'outline',
      warmth: 'neutral',
      formality: 'casual',
      contrast: 'low',
      mood: 'calming',
    },
  },

  // General fallback
  general: {
    colors: {
      primary: '#3B82F6',      // Blue
      secondary: '#6366F1',    // Indigo
      accent: '#F59E0B',       // Amber
      text: '#1F2937',         // Dark gray
      textMuted: '#6B7280',    // Medium gray
      background: '#FFFFFF',   // White
      surface: '#F9FAFB',      // Light gray
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
    },
    style: {
      borderRadius: 'md',
      shadowStyle: 'medium',
      buttonStyle: 'solid',
      warmth: 'neutral',
      formality: 'neutral',
      contrast: 'medium',
    },
  },
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
// Color Variation Functions
// ============================================================================

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function varyColor(hex: string, random: () => number, maxHueShift = 15, maxSatShift = 10, maxLightShift = 5): string {
  const hsl = hexToHsl(hex);

  const hueShift = (random() - 0.5) * 2 * maxHueShift;
  const satShift = (random() - 0.5) * 2 * maxSatShift;
  const lightShift = (random() - 0.5) * 2 * maxLightShift;

  const newH = (hsl.h + hueShift + 360) % 360;
  const newS = Math.max(0, Math.min(100, hsl.s + satShift));
  const newL = Math.max(0, Math.min(100, hsl.l + lightShift));

  return hslToHex(newH, newS, newL);
}

const DESIGN_DIRECTION_PRESETS: Record<DesignDirection, DesignDirectionPreset> = {
  'modern-corporate': {
    colorTendency: 'cool',
    saturation: 'muted',
    typography: 'sans-serif',
    borderRadius: 'sm',
    shadowStyle: 'subtle',
    spacing: 'normal',
  },
  'bold-creative': {
    colorTendency: 'warm',
    saturation: 'vibrant',
    typography: 'mixed',
    borderRadius: 'lg',
    shadowStyle: 'dramatic',
    spacing: 'spacious',
  },
  'elegant-minimal': {
    colorTendency: 'neutral',
    saturation: 'muted',
    typography: 'serif',
    borderRadius: 'none',
    shadowStyle: 'none',
    spacing: 'spacious',
  },
  'tech-saas': {
    colorTendency: 'cool',
    saturation: 'balanced',
    typography: 'sans-serif',
    borderRadius: 'md',
    shadowStyle: 'medium',
    spacing: 'normal',
  },
  'organic-lifestyle': {
    colorTendency: 'warm',
    saturation: 'balanced',
    typography: 'serif',
    borderRadius: 'full',
    shadowStyle: 'subtle',
    spacing: 'spacious',
  },
};

export { DESIGN_DIRECTION_PRESETS };

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Detect industry type from business description
 */
export function detectIndustry(description: string): IndustryType {
  const lowerDesc = description.toLowerCase();
  const scores: Record<IndustryType, number> = {} as Record<IndustryType, number>;

  // Initialize scores
  const allIndustries: IndustryType[] = [
    'restaurant',
    'cafe',
    'food',
    'saas',
    'tech',
    'software',
    'creative',
    'portfolio',
    'design',
    'professional',
    'legal',
    'finance',
    'consulting',
    'health',
    'wellness',
    'medical',
    'spa',
    'general',
  ];

  for (const industry of allIndustries) {
    scores[industry] = 0;
  }

  // Score based on keyword matches
  for (const [keyword, industries] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lowerDesc.includes(keyword)) {
      for (let i = 0; i < industries.length; i++) {
        const industry = industries[i];
        // Give more weight to earlier matches (more specific)
        scores[industry] += 1 / (i + 1);
      }
    }
  }

  // Find highest scoring industry
  let maxScore = 0;
  let bestIndustry: IndustryType = 'general';

  for (const [industry, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestIndustry = industry as IndustryType;
    }
  }

  return bestIndustry;
}

/**
 * Get the preset configuration for an industry
 */
export function getIndustryPreset(industry: IndustryType): IndustryPreset {
  return INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.general;
}

/**
 * Generate a theme configuration from business description
 */
export function generateTheme(input: ThemeGenerationInput): ThemeConfig {
  const industry = detectIndustry(input.businessDescription);
  const preset = getIndustryPreset(industry);
  const directionPreset = input.designDirection 
    ? DESIGN_DIRECTION_PRESETS[input.designDirection] 
    : null;

  const seed = input.seed ?? Math.floor(Math.random() * 1000000);
  const random = seededRandom(seed);

  const variedColors: ThemeColors = {
    primary: input.colorPreferences?.primary ?? varyColor(preset.colors.primary, random),
    secondary: input.colorPreferences?.secondary ?? varyColor(preset.colors.secondary, random),
    accent: varyColor(preset.colors.accent, random),
    text: preset.colors.text,
    textMuted: preset.colors.textMuted,
    background: preset.colors.background,
    surface: preset.colors.surface,
  };

  const typographyOptions: ThemeTypography[] = [
    preset.typography,
    ...(TYPOGRAPHY_ALTERNATIVES[industry] || []),
  ];

  const typographyIndex = Math.floor(random() * typographyOptions.length);
  const selectedTypography = typographyOptions[typographyIndex];

  let selectedStyle: ThemeStyle;
  if (directionPreset) {
    selectedStyle = {
      borderRadius: directionPreset.borderRadius,
      shadowStyle: directionPreset.shadowStyle,
      buttonStyle: preset.style.buttonStyle,
    };
  } else {
    const styleOptions: ThemeStyle[] = [
      {
        borderRadius: preset.style.borderRadius,
        shadowStyle: preset.style.shadowStyle,
        buttonStyle: preset.style.buttonStyle,
      },
      ...(STYLE_ALTERNATIVES[industry] || []),
    ];
    const styleIndex = Math.floor(random() * styleOptions.length);
    selectedStyle = styleOptions[styleIndex];
  }

  return {
    colors: variedColors,
    typography: selectedTypography,
    style: selectedStyle,
    industry,
  };
}

// ============================================================================
// Typography Alternatives by Industry
// ============================================================================

const TYPOGRAPHY_ALTERNATIVES: Partial<Record<IndustryType, ThemeTypography[]>> = {
  restaurant: [
    { headingFont: 'Cormorant Garamond', bodyFont: 'Montserrat', headingWeight: '600', bodyWeight: '400' },
    { headingFont: 'Abril Fatface', bodyFont: 'Poppins', headingWeight: '400', bodyWeight: '400' },
  ],
  cafe: [
    { headingFont: 'Playfair Display', bodyFont: 'Lato', headingWeight: '700', bodyWeight: '400' },
    { headingFont: 'Bitter', bodyFont: 'Nunito', headingWeight: '700', bodyWeight: '400' },
  ],
  saas: [
    { headingFont: 'Plus Jakarta Sans', bodyFont: 'DM Sans', headingWeight: '700', bodyWeight: '400' },
    { headingFont: 'Outfit', bodyFont: 'Work Sans', headingWeight: '600', bodyWeight: '400' },
  ],
  tech: [
    { headingFont: 'Manrope', bodyFont: 'Nunito Sans', headingWeight: '700', bodyWeight: '400' },
    { headingFont: 'Lexend', bodyFont: 'Inter', headingWeight: '600', bodyWeight: '400' },
  ],
  creative: [
    { headingFont: 'Syne', bodyFont: 'Outfit', headingWeight: '700', bodyWeight: '400' },
    { headingFont: 'Clash Display', bodyFont: 'Satoshi', headingWeight: '600', bodyWeight: '400' },
  ],
  portfolio: [
    { headingFont: 'Bebas Neue', bodyFont: 'Space Grotesk', headingWeight: '400', bodyWeight: '400' },
    { headingFont: 'Monument Extended', bodyFont: 'DM Sans', headingWeight: '700', bodyWeight: '400' },
  ],
  professional: [
    { headingFont: 'Fraunces', bodyFont: 'Commissioner', headingWeight: '600', bodyWeight: '400' },
    { headingFont: 'Newsreader', bodyFont: 'Source Sans Pro', headingWeight: '500', bodyWeight: '400' },
  ],
  health: [
    { headingFont: 'Outfit', bodyFont: 'Plus Jakarta Sans', headingWeight: '600', bodyWeight: '400' },
    { headingFont: 'Albert Sans', bodyFont: 'Public Sans', headingWeight: '700', bodyWeight: '400' },
  ],
  wellness: [
    { headingFont: 'Tenor Sans', bodyFont: 'Jost', headingWeight: '400', bodyWeight: '400' },
    { headingFont: 'Bodoni Moda', bodyFont: 'Karla', headingWeight: '500', bodyWeight: '400' },
  ],
};

// ============================================================================
// Style Alternatives by Industry
// ============================================================================

const STYLE_ALTERNATIVES: Partial<Record<IndustryType, ThemeStyle[]>> = {
  restaurant: [
    { borderRadius: 'lg', shadowStyle: 'medium', buttonStyle: 'solid' },
    { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'outline' },
  ],
  cafe: [
    { borderRadius: 'full', shadowStyle: 'subtle', buttonStyle: 'solid' },
    { borderRadius: 'md', shadowStyle: 'none', buttonStyle: 'outline' },
  ],
  saas: [
    { borderRadius: 'md', shadowStyle: 'dramatic', buttonStyle: 'gradient' },
    { borderRadius: 'full', shadowStyle: 'subtle', buttonStyle: 'solid' },
  ],
  tech: [
    { borderRadius: 'lg', shadowStyle: 'medium', buttonStyle: 'gradient' },
    { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'solid' },
  ],
  creative: [
    { borderRadius: 'lg', shadowStyle: 'none', buttonStyle: 'outline' },
    { borderRadius: 'none', shadowStyle: 'dramatic', buttonStyle: 'solid' },
  ],
  portfolio: [
    { borderRadius: 'sm', shadowStyle: 'subtle', buttonStyle: 'solid' },
    { borderRadius: 'lg', shadowStyle: 'none', buttonStyle: 'outline' },
  ],
  professional: [
    { borderRadius: 'none', shadowStyle: 'subtle', buttonStyle: 'solid' },
    { borderRadius: 'sm', shadowStyle: 'none', buttonStyle: 'outline' },
  ],
  health: [
    { borderRadius: 'full', shadowStyle: 'subtle', buttonStyle: 'solid' },
    { borderRadius: 'md', shadowStyle: 'none', buttonStyle: 'outline' },
  ],
  wellness: [
    { borderRadius: 'lg', shadowStyle: 'subtle', buttonStyle: 'solid' },
    { borderRadius: 'full', shadowStyle: 'none', buttonStyle: 'outline' },
  ],
};

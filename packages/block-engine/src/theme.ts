/**
 * WordPress theme.json Generator
 *
 * Generates valid WordPress theme.json files with customizable
 * colors, typography, spacing, and layout settings.
 */

// ============================================================================
// Theme Configuration Types
// ============================================================================

export interface ThemeConfig {
  name?: string;
  colors?: ColorConfig;
  gradients?: GradientPreset[];
  typography?: TypographyConfig;
  spacing?: SpacingConfig;
  layout?: LayoutConfig;
  styles?: StylesConfig;
}

export type ColorConfig = Record<string, string | ColorEntry>;

export interface ColorEntry {
  color: string;
  name: string;
}

export interface ColorPalette {
  slug: string;
  name: string;
  color: string;
}

export interface GradientPreset {
  slug: string;
  name: string;
  gradient: string;
}

export interface TypographyConfig {
  fluid?: boolean;
  fontFamilies?: FontFamily[];
  fontSizes?: FontSize[];
}

export interface FontFamily {
  slug: string;
  name: string;
  fontFamily: string;
  fontFace?: FontFace[];
}

export interface FontFace {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  src: string[];
}

export interface FontSize {
  slug: string;
  size: string;
  name?: string;
  fluid?: {
    min: string;
    max: string;
  };
}

export interface SpacingConfig {
  units?: string[];
  spacingSizes?: SpacingSize[];
}

export interface SpacingSize {
  slug: string;
  size: string;
  name: string;
}

export interface LayoutConfig {
  contentSize?: string;
  wideSize?: string;
  allowEditing?: boolean;
}

export interface StylesConfig {
  color?: {
    background?: string;
    text?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: string;
  };
  spacing?: {
    padding?: SpacingValue;
    margin?: SpacingValue;
  };
  elements?: Record<string, ElementStyle>;
  blocks?: Record<string, BlockStyle>;
}

export interface SpacingValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface ElementStyle {
  color?: { text?: string; background?: string };
  typography?: { fontSize?: string; fontWeight?: string; lineHeight?: string };
  border?: { radius?: string; width?: string; color?: string };
}

export interface BlockStyle {
  color?: { text?: string; background?: string };
  typography?: { fontSize?: string };
  border?: { radius?: string };
  spacing?: { padding?: SpacingValue; margin?: SpacingValue };
}

// ============================================================================
// Theme.json Output Types
// ============================================================================

export interface ThemeJson {
  $schema: string;
  version: number;
  settings?: ThemeSettings;
  styles?: ThemeStyles;
}

export interface ThemeSettings {
  color?: {
    palette?: ColorPalette[];
    gradients?: GradientPreset[];
    duotone?: unknown[];
    defaultPalette?: boolean;
    defaultGradients?: boolean;
  };
  typography?: {
    fluid?: boolean;
    fontFamilies?: FontFamily[];
    fontSizes?: FontSize[];
  };
  spacing?: {
    units?: string[];
    spacingSizes?: SpacingSize[];
  };
  layout?: {
    contentSize?: string;
    wideSize?: string;
  };
  appearanceTools?: boolean;
}

export interface ThemeStyles {
  color?: { background?: string; text?: string };
  typography?: { fontFamily?: string; fontSize?: string; lineHeight?: string };
  spacing?: { padding?: SpacingValue; margin?: SpacingValue };
  elements?: Record<string, ElementStyle>;
  blocks?: Record<string, BlockStyle>;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_COLORS: ColorConfig = {
  primary: '#0073aa',
  secondary: '#23282d',
  background: '#ffffff',
  foreground: '#1e1e1e',
  accent: '#cd2653',
};

const DEFAULT_FONT_SIZES: FontSize[] = [
  { slug: 'small', size: '0.875rem', name: 'Small' },
  { slug: 'medium', size: '1rem', name: 'Medium' },
  { slug: 'large', size: '1.25rem', name: 'Large' },
  { slug: 'x-large', size: '1.5rem', name: 'Extra Large' },
  { slug: 'xx-large', size: '2rem', name: 'Huge' },
];

const DEFAULT_SPACING_SIZES: SpacingSize[] = [
  { slug: '10', size: '0.625rem', name: 'Extra Small' },
  { slug: '20', size: '1rem', name: 'Small' },
  { slug: '30', size: '1.5rem', name: 'Medium' },
  { slug: '40', size: '2rem', name: 'Large' },
  { slug: '50', size: '3rem', name: 'Extra Large' },
];

const DEFAULT_LAYOUT: LayoutConfig = {
  contentSize: '650px',
  wideSize: '1200px',
};

// ============================================================================
// Generator Function
// ============================================================================

/**
 * Generate a WordPress theme.json object from configuration
 */
export function generateThemeJson(config: ThemeConfig): ThemeJson {
  const theme: ThemeJson = {
    $schema: 'https://schemas.wp.org/trunk/theme.json',
    version: 3,
    settings: buildSettings(config),
    styles: buildStyles(config),
  };

  // Remove undefined values
  return JSON.parse(JSON.stringify(theme));
}

/**
 * Build the settings section
 */
function buildSettings(config: ThemeConfig): ThemeSettings {
  const settings: ThemeSettings = {
    appearanceTools: true,
  };

  // Color settings
  settings.color = {
    palette: buildColorPalette(config.colors),
    defaultPalette: false,
    defaultGradients: false,
  };

  if (config.gradients && config.gradients.length > 0) {
    settings.color.gradients = config.gradients;
  }

  // Typography settings
  settings.typography = {
    fluid: config.typography?.fluid ?? false,
    fontSizes: config.typography?.fontSizes?.length
      ? config.typography.fontSizes
      : DEFAULT_FONT_SIZES,
  };

  if (config.typography?.fontFamilies?.length) {
    settings.typography.fontFamilies = config.typography.fontFamilies;
  }

  // Spacing settings
  settings.spacing = {
    units: config.spacing?.units ?? ['px', 'rem', '%'],
    spacingSizes: config.spacing?.spacingSizes?.length
      ? config.spacing.spacingSizes
      : DEFAULT_SPACING_SIZES,
  };

  // Layout settings
  const layoutConfig = config.layout || DEFAULT_LAYOUT;
  settings.layout = {
    contentSize: layoutConfig.contentSize || DEFAULT_LAYOUT.contentSize,
    wideSize: layoutConfig.wideSize || DEFAULT_LAYOUT.wideSize,
  };

  return settings;
}

/**
 * Build color palette from config
 */
function buildColorPalette(colors?: ColorConfig): ColorPalette[] {
  const colorConfig = colors || DEFAULT_COLORS;
  const palette: ColorPalette[] = [];

  for (const [slug, value] of Object.entries(colorConfig)) {
    if (typeof value === 'string') {
      palette.push({
        slug,
        name: slugToName(slug),
        color: value,
      });
    } else {
      palette.push({
        slug,
        name: value.name,
        color: value.color,
      });
    }
  }

  return palette;
}

/**
 * Convert slug to human-readable name
 * e.g., 'primary' -> 'Primary', 'brand-blue' -> 'Brand Blue'
 */
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build the styles section
 * Always returns an empty object at minimum to ensure theme.json has styles property
 */
function buildStyles(config: ThemeConfig): ThemeStyles {
  const styles: ThemeStyles = {};

  if (config.styles?.color) {
    styles.color = config.styles.color;
  }

  if (config.styles?.typography) {
    styles.typography = config.styles.typography;
  }

  if (config.styles?.spacing) {
    styles.spacing = config.styles.spacing;
  }

  if (config.styles?.elements) {
    styles.elements = config.styles.elements;
  }

  if (config.styles?.blocks) {
    styles.blocks = config.styles.blocks;
  }

  return styles;
}

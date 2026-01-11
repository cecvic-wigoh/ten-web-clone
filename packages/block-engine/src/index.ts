/**
 * @ai-wp/block-engine
 *
 * Gutenberg block generation engine for AI-powered WordPress site building.
 *
 * Features:
 * - Block serialization to valid Gutenberg block grammar
 * - Pre-built block patterns for common sections
 * - Theme.json generation for styling
 */

// Block Serializer
export { serializeBlock, serializeBlocks } from './serializer';

// Block Patterns
export {
  createHeroPattern,
  createFeaturesPattern,
  createCtaPattern,
  createTestimonialsPattern,
  createFooterPattern,
  type PatternConfig,
  type HeroConfig,
  type FeaturesConfig,
  type CtaConfig,
  type TestimonialsConfig,
  type FooterConfig,
  type FeatureItem,
  type TestimonialItem,
  type FooterColumn,
  type SocialLink,
} from './patterns';

// Theme Generator
export {
  generateThemeJson,
  type ThemeConfig,
  type ThemeJson,
  type ColorConfig,
  type ColorPalette,
  type ColorEntry,
  type GradientPreset,
  type TypographyConfig,
  type FontFamily,
  type FontFace,
  type FontSize,
  type SpacingConfig,
  type SpacingSize,
  type LayoutConfig,
  type StylesConfig,
  type ElementStyle,
  type BlockStyle,
} from './theme';

// Types
export {
  type BlockNode,
  type BlockAttributes,
  type HeadingAttributes,
  type ParagraphAttributes,
  type ImageAttributes,
  type GroupAttributes,
  type ColumnAttributes,
  type ButtonAttributes,
  type CoverAttributes,
  type SpacerAttributes,
  type SeparatorAttributes,
  type ListAttributes,
  type CoreBlockType,
  type SerializedBlock,
  type BlockTypeDefinition,
} from './types';

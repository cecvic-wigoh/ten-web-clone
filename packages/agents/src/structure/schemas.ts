/**
 * Zod schemas for structure agent output validation
 *
 * These schemas define the expected structure of AI-generated site configurations
 * and ensure they map correctly to block-engine patterns.
 */

import { z } from 'zod';

// ============================================================================
// Section Type Enum
// ============================================================================

/**
 * Available section types that map to block-engine patterns
 */
export const SectionType = z.enum([
  'hero',
  'features',
  'cta',
  'testimonials',
  'gallery',
  'contact',
  'footer',
]);

export type SectionType = z.infer<typeof SectionType>;

// ============================================================================
// Layout Templates - Provide variety in how sections are displayed
// ============================================================================

/**
 * Hero layout options
 * - centered: Traditional centered text over image
 * - split-left: Content on left, image on right
 * - split-right: Image on left, content on right
 * - minimal: Simple text, no background image, clean typography
 * - fullscreen: Full viewport height, immersive
 */
export const HeroLayout = z.enum([
  'centered',
  'split-left',
  'split-right',
  'minimal',
  'fullscreen',
]);

export type HeroLayout = z.infer<typeof HeroLayout>;

/**
 * Features layout options
 * - grid-3: Three equal columns
 * - grid-4: Four equal columns
 * - grid-2: Two columns, larger cards
 * - cards: Card-style with shadows and borders
 * - alternating: Zigzag pattern, icon/image alternates sides
 * - icon-left: Icons on left, text on right (list style)
 */
export const FeaturesLayout = z.enum([
  'grid-3',
  'grid-4',
  'grid-2',
  'cards',
  'alternating',
  'icon-left',
]);

export type FeaturesLayout = z.infer<typeof FeaturesLayout>;

/**
 * Testimonials layout options
 * - cards: Card grid with equal-sized testimonials
 * - single-large: One large featured testimonial
 * - quote-wall: Masonry-style quote grid
 * - centered: Single centered testimonial (good for 1-2)
 */
export const TestimonialsLayout = z.enum([
  'cards',
  'single-large',
  'quote-wall',
  'centered',
]);

export type TestimonialsLayout = z.infer<typeof TestimonialsLayout>;

/**
 * CTA layout options
 * - centered: Traditional centered CTA with background
 * - split: Text on one side, form/button on other
 * - banner: Full-width thin banner style
 * - card: Floating card with shadow
 */
export const CtaLayout = z.enum([
  'centered',
  'split',
  'banner',
  'card',
]);

export type CtaLayout = z.infer<typeof CtaLayout>;

/**
 * Footer layout options
 * - columns: Multi-column with navigation links
 * - minimal: Simple single-line footer
 * - centered: Centered content, stacked
 * - mega: Large footer with multiple sections
 */
export const FooterLayout = z.enum([
  'columns',
  'minimal',
  'centered',
  'mega',
]);

export type FooterLayout = z.infer<typeof FooterLayout>;

// ============================================================================
// Section Config Schemas
// ============================================================================

/**
 * Hero section configuration - maps to createHeroPattern
 */
export const HeroConfigSchema = z.object({
  layout: HeroLayout.optional().default('centered'),
  heading: z.string(),
  subheading: z.string(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundOverlay: z.number().min(0).max(100).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional().default('center'),
});

export type HeroConfig = z.infer<typeof HeroConfigSchema>;

/**
 * Feature item for features section
 */
export const FeatureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type FeatureItem = z.infer<typeof FeatureItemSchema>;

/**
 * Features section configuration - maps to createFeaturesPattern
 */
export const FeaturesConfigSchema = z.object({
  layout: FeaturesLayout.optional().default('grid-3'),
  title: z.string(),
  subtitle: z.string().optional(),
  features: z.array(FeatureItemSchema),
  columns: z.number().min(2).max(4).optional(),
});

export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;

/**
 * CTA section configuration - maps to createCtaPattern
 */
export const CtaConfigSchema = z.object({
  layout: CtaLayout.optional().default('centered'),
  heading: z.string(),
  description: z.string(),
  buttonText: z.string(),
  buttonUrl: z.string(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export type CtaConfig = z.infer<typeof CtaConfigSchema>;

/**
 * Testimonial item for testimonials section
 */
export const TestimonialItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  image: z.string().optional(),
});

export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;

/**
 * Testimonials section configuration - maps to createTestimonialsPattern
 */
export const TestimonialsConfigSchema = z.object({
  layout: TestimonialsLayout.optional().default('cards'),
  title: z.string(),
  subtitle: z.string().optional(),
  testimonials: z.array(TestimonialItemSchema),
});

export type TestimonialsConfig = z.infer<typeof TestimonialsConfigSchema>;

/**
 * Gallery item for gallery section
 */
export const GalleryItemSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

/**
 * Gallery section configuration
 */
export const GalleryConfigSchema = z.object({
  title: z.string().optional(),
  images: z.array(GalleryItemSchema),
  columns: z.number().min(1).max(6).optional(),
});

export type GalleryConfig = z.infer<typeof GalleryConfigSchema>;

/**
 * Contact section configuration
 */
export const ContactConfigSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  showForm: z.boolean().optional(),
});

export type ContactConfig = z.infer<typeof ContactConfigSchema>;

/**
 * Footer link item
 */
export const FooterLinkSchema = z.object({
  text: z.string(),
  url: z.string(),
});

export type FooterLink = z.infer<typeof FooterLinkSchema>;

/**
 * Footer column with links
 */
export const FooterColumnSchema = z.object({
  title: z.string(),
  links: z.array(FooterLinkSchema),
});

export type FooterColumn = z.infer<typeof FooterColumnSchema>;

/**
 * Social link for footer
 */
export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

/**
 * Footer section configuration - maps to createFooterPattern
 */
export const FooterConfigSchema = z.object({
  layout: FooterLayout.optional().default('columns'),
  columns: z.array(FooterColumnSchema),
  copyright: z.string(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  showNewsletter: z.boolean().optional(),
});

export type FooterConfig = z.infer<typeof FooterConfigSchema>;

// ============================================================================
// Section Schema (Union of all section types)
// ============================================================================

/**
 * Generic section with type-specific config
 * The config is loosely typed to allow flexibility in AI output
 */
export const SectionSchema = z.object({
  type: SectionType,
  config: z.record(z.any()),
});

export type Section = z.infer<typeof SectionSchema>;

// ============================================================================
// Page Schema
// ============================================================================

/**
 * Page definition with sections
 */
export const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  sections: z.array(SectionSchema),
  meta: z
    .object({
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export type Page = z.infer<typeof PageSchema>;

// ============================================================================
// Navigation Schema
// ============================================================================

/**
 * Navigation item
 */
export const NavigationItemSchema = z.object({
  label: z.string(),
  url: z.string(),
  order: z.number().optional(),
  children: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export type NavigationItem = z.infer<typeof NavigationItemSchema>;

/**
 * Site navigation configuration
 */
export const NavigationSchema = z.object({
  items: z.array(NavigationItemSchema),
});

export type Navigation = z.infer<typeof NavigationSchema>;

// ============================================================================
// Theme Config Schema
// ============================================================================

/**
 * Color configuration for theme
 */
export const ColorsSchema = z.record(z.string());

export type Colors = z.infer<typeof ColorsSchema>;

/**
 * Typography configuration
 */
export const TypographySchema = z.object({
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
});

export type Typography = z.infer<typeof TypographySchema>;

/**
 * Theme configuration for the site
 */
export const ThemeConfigSchema = z.object({
  colors: ColorsSchema.optional(),
  typography: TypographySchema.optional(),
  spacing: z.record(z.string()).optional(),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// ============================================================================
// Site Structure Schema (Main Output)
// ============================================================================

/**
 * Complete site structure returned by the agent
 */
export const SiteStructureSchema = z.object({
  pages: z.array(PageSchema),
  theme: ThemeConfigSchema,
  navigation: NavigationSchema,
});

export type SiteStructure = z.infer<typeof SiteStructureSchema>;

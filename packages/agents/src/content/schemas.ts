/**
 * Zod schemas for content agent output validation
 *
 * These schemas define the expected structure of AI-generated content
 * for website sections including SEO metadata.
 */

import { z } from 'zod';

// ============================================================================
// Tone Preset Enum
// ============================================================================

/**
 * Available tone presets for content generation
 */
export const TonePreset = z.enum([
  'professional',
  'friendly',
  'bold',
  'minimal',
  'playful',
]);

export type TonePreset = z.infer<typeof TonePreset>;

// ============================================================================
// SEO Metadata Schema
// ============================================================================

/**
 * SEO metadata for a page
 */
export const SeoMetadataSchema = z.object({
  /** Meta title for search engines (50-60 chars recommended) */
  metaTitle: z.string().min(1),
  /** Meta description for search engines (150-160 chars recommended) */
  metaDescription: z.string().min(1),
  /** Open Graph title for social sharing */
  ogTitle: z.string().min(1),
  /** Open Graph description for social sharing */
  ogDescription: z.string().min(1),
  /** Focus keywords (3-5 recommended) */
  keywords: z.array(z.string()).min(1),
});

export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;

// ============================================================================
// Section Content Schema
// ============================================================================

/**
 * Content for a single section
 */
export const SectionContentSchema = z.object({
  /** Unique identifier for the section */
  sectionId: z.string(),
  /** Type of section (hero, features, cta, etc.) */
  sectionType: z.string(),
  /** Section-specific content as key-value pairs */
  content: z.record(z.any()),
});

export type SectionContent = z.infer<typeof SectionContentSchema>;

// ============================================================================
// Page Content Schema
// ============================================================================

/**
 * Complete content for a page including sections and SEO
 */
export const PageContentSchema = z.object({
  /** URL-friendly page identifier */
  pageSlug: z.string(),
  /** Array of section content */
  sections: z.array(SectionContentSchema),
  /** SEO metadata for the page */
  seo: SeoMetadataSchema,
});

export type PageContent = z.infer<typeof PageContentSchema>;

// ============================================================================
// Content Request Schema
// ============================================================================

/**
 * Request input for content generation
 */
export const ContentRequestSchema = z.object({
  /** Description of the business/website */
  businessDescription: z.string().min(1),
  /** Page to generate content for */
  pageSlug: z.string().min(1),
  /** Section types to generate content for */
  sectionTypes: z.array(z.string()),
  /** Tone preset for content style */
  tone: TonePreset,
  /** Optional existing content for context */
  existingContent: z.record(z.string()).optional(),
});

export type ContentRequest = z.infer<typeof ContentRequestSchema>;

// ============================================================================
// Hero Content Schema
// ============================================================================

/**
 * Content schema for hero sections
 */
export const HeroContentSchema = z.object({
  heading: z.string(),
  subheading: z.string(),
  buttonText: z.string().optional(),
});

export type HeroContent = z.infer<typeof HeroContentSchema>;

// ============================================================================
// Feature Content Schema
// ============================================================================

/**
 * Single feature item content
 */
export const FeatureContentItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type FeatureContentItem = z.infer<typeof FeatureContentItemSchema>;

/**
 * Content schema for features sections
 */
export const FeaturesContentSchema = z.object({
  title: z.string(),
  features: z.array(FeatureContentItemSchema),
});

export type FeaturesContent = z.infer<typeof FeaturesContentSchema>;

// ============================================================================
// CTA Content Schema
// ============================================================================

/**
 * Content schema for CTA sections
 */
export const CtaContentSchema = z.object({
  heading: z.string(),
  body: z.string(),
  buttonText: z.string(),
});

export type CtaContent = z.infer<typeof CtaContentSchema>;

// ============================================================================
// Testimonial Content Schema
// ============================================================================

/**
 * Single testimonial item content
 */
export const TestimonialContentItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});

export type TestimonialContentItem = z.infer<typeof TestimonialContentItemSchema>;

/**
 * Content schema for testimonials sections
 */
export const TestimonialsContentSchema = z.object({
  title: z.string(),
  testimonials: z.array(TestimonialContentItemSchema),
});

export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;

// ============================================================================
// Footer Content Schema
// ============================================================================

/**
 * Footer column content
 */
export const FooterColumnContentSchema = z.object({
  title: z.string(),
  links: z.array(z.string()),
});

export type FooterColumnContent = z.infer<typeof FooterColumnContentSchema>;

/**
 * Content schema for footer sections
 */
export const FooterContentSchema = z.object({
  columns: z.array(FooterColumnContentSchema).optional(),
  copyright: z.string(),
});

export type FooterContent = z.infer<typeof FooterContentSchema>;

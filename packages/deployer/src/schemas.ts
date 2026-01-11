/**
 * WordPress REST API Response Schemas
 *
 * Zod schemas for validating and parsing WordPress REST API responses.
 */

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * WordPress rendered content wrapper
 * Used for title, content, excerpt, etc.
 */
export const WPRenderedSchema = z.object({
  rendered: z.string(),
  protected: z.boolean().optional(),
});

export type WPRendered = z.infer<typeof WPRenderedSchema>;

/**
 * WordPress error response
 */
export const WPErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  data: z
    .object({
      status: z.number().optional(),
    })
    .passthrough()
    .optional(),
});

export type WPError = z.infer<typeof WPErrorSchema>;

// ============================================================================
// Media Schemas
// ============================================================================

/**
 * WordPress media size variant
 */
export const WPMediaSizeSchema = z.object({
  file: z.string(),
  width: z.number(),
  height: z.number(),
  source_url: z.string(),
  mime_type: z.string(),
});

export type WPMediaSize = z.infer<typeof WPMediaSizeSchema>;

/**
 * WordPress media details
 */
export const WPMediaDetailsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  file: z.string().optional(),
  sizes: z.record(WPMediaSizeSchema).optional(),
});

export type WPMediaDetails = z.infer<typeof WPMediaDetailsSchema>;

/**
 * WordPress media/attachment response
 */
export const WPMediaSchema = z.object({
  id: z.number(),
  date: z.string().optional(),
  date_gmt: z.string().optional(),
  guid: WPRenderedSchema.optional(),
  modified: z.string().optional(),
  modified_gmt: z.string().optional(),
  slug: z.string(),
  status: z.string(),
  type: z.string().optional(),
  link: z.string(),
  title: WPRenderedSchema,
  author: z.number().optional(),
  caption: WPRenderedSchema.optional(),
  alt_text: z.string(),
  media_type: z.string(),
  mime_type: z.string(),
  source_url: z.string(),
  media_details: WPMediaDetailsSchema.optional(),
});

export type WPMedia = z.infer<typeof WPMediaSchema>;

// ============================================================================
// Page/Post Schemas
// ============================================================================

/**
 * Valid post/page status values
 */
export const WPStatusSchema = z.enum([
  'publish',
  'future',
  'draft',
  'pending',
  'private',
  'trash',
  'auto-draft',
  'inherit',
]);

export type WPStatus = z.infer<typeof WPStatusSchema>;

/**
 * WordPress page response
 */
export const WPPageSchema = z.object({
  id: z.number(),
  date: z.string().optional(),
  date_gmt: z.string().optional(),
  guid: WPRenderedSchema.optional(),
  modified: z.string().optional(),
  modified_gmt: z.string().optional(),
  slug: z.string(),
  status: WPStatusSchema,
  type: z.string().optional(),
  link: z.string(),
  title: WPRenderedSchema,
  content: WPRenderedSchema,
  excerpt: WPRenderedSchema.optional(),
  author: z.number().optional(),
  featured_media: z.number().optional(),
  parent: z.number().optional(),
  menu_order: z.number().optional(),
  comment_status: z.string().optional(),
  ping_status: z.string().optional(),
  template: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export type WPPage = z.infer<typeof WPPageSchema>;

/**
 * WordPress post response (similar to page but with categories/tags)
 */
export const WPPostSchema = WPPageSchema.extend({
  format: z.string().optional(),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
  sticky: z.boolean().optional(),
});

export type WPPost = z.infer<typeof WPPostSchema>;

// ============================================================================
// Menu Schemas
// ============================================================================

/**
 * WordPress menu response
 */
export const WPMenuSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(),
  auto_add: z.boolean().optional(),
});

export type WPMenu = z.infer<typeof WPMenuSchema>;

/**
 * WordPress menu item response
 */
export const WPMenuItemSchema = z.object({
  id: z.number(),
  title: WPRenderedSchema,
  url: z.string(),
  menu_order: z.number().optional(),
  parent: z.number().optional(),
  object: z.string().optional(),
  object_id: z.number().optional(),
  type: z.string().optional(),
  target: z.string().optional(),
  attr_title: z.string().optional(),
  classes: z.array(z.string()).optional(),
  description: z.string().optional(),
  menus: z.number().optional(),
});

export type WPMenuItem = z.infer<typeof WPMenuItemSchema>;

// ============================================================================
// User Schemas
// ============================================================================

/**
 * WordPress user response
 */
export const WPUserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  name: z.string(),
  email: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  slug: z.string(),
  roles: z.array(z.string()).optional(),
  capabilities: z.record(z.boolean()).optional(),
  avatar_urls: z.record(z.string()).optional(),
});

export type WPUser = z.infer<typeof WPUserSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simplified page result
 */
export interface PageResult {
  id: number;
  slug: string;
  title: string;
  content: string;
  url: string;
  status: string;
}

/**
 * Simplified media result
 */
export interface MediaResult {
  id: number;
  url: string;
  alt: string;
  title: string;
}

/**
 * Parsed error result
 */
export interface ErrorResult {
  code: string;
  message: string;
  status?: number;
}

/**
 * Parse WordPress page response to simplified format
 */
export function parseWPPage(data: unknown): PageResult {
  const page = WPPageSchema.parse(data);
  return {
    id: page.id,
    slug: page.slug,
    title: page.title.rendered,
    content: page.content.rendered,
    url: page.link,
    status: page.status,
  };
}

/**
 * Parse WordPress media response to simplified format
 */
export function parseWPMedia(data: unknown): MediaResult {
  const media = WPMediaSchema.parse(data);
  return {
    id: media.id,
    url: media.source_url,
    alt: media.alt_text,
    title: media.title.rendered,
  };
}

/**
 * Parse WordPress error response
 */
export function parseWPError(data: unknown): ErrorResult {
  const error = WPErrorSchema.parse(data);
  return {
    code: error.code,
    message: error.message,
    status: error.data?.status,
  };
}

/**
 * Check if response is a WordPress error
 */
export function isWPError(data: unknown): boolean {
  const result = WPErrorSchema.safeParse(data);
  return result.success && typeof result.data.code === 'string';
}

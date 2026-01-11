/**
 * TypeScript types for WordPress Gutenberg blocks
 *
 * These types represent the block structure used throughout the block engine.
 */

/**
 * Represents a WordPress Gutenberg block node
 */
export interface BlockNode {
  /** Block name (e.g., 'core/heading', 'core/paragraph') */
  name: string;

  /** Block attributes (e.g., level, align, url) */
  attributes: BlockAttributes;

  /** Inner content - strings for text content, null for child block positions */
  innerContent: (string | null)[];

  /** Child blocks (for container blocks like group, columns) */
  innerBlocks?: BlockNode[];
}

/**
 * Generic block attributes - specific blocks have typed attributes
 */
export interface BlockAttributes {
  [key: string]: unknown;
}

/**
 * Heading block attributes
 */
export interface HeadingAttributes extends BlockAttributes {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: 'left' | 'center' | 'right';
  anchor?: string;
}

/**
 * Paragraph block attributes
 */
export interface ParagraphAttributes extends BlockAttributes {
  align?: 'left' | 'center' | 'right';
  dropCap?: boolean;
}

/**
 * Image block attributes
 */
export interface ImageAttributes extends BlockAttributes {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  id?: number;
  sizeSlug?: string;
  linkDestination?: 'none' | 'media' | 'attachment' | 'custom';
}

/**
 * Group block attributes
 */
export interface GroupAttributes extends BlockAttributes {
  layout?: {
    type: 'constrained' | 'flex' | 'default' | 'grid';
    justifyContent?: 'left' | 'center' | 'right' | 'space-between';
    orientation?: 'horizontal' | 'vertical';
  };
  tagName?: string;
}

/**
 * Column block attributes
 */
export interface ColumnAttributes extends BlockAttributes {
  width?: string;
  verticalAlignment?: 'top' | 'center' | 'bottom';
}

/**
 * Button block attributes
 */
export interface ButtonAttributes extends BlockAttributes {
  url?: string;
  text?: string;
  linkTarget?: string;
  rel?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Cover block attributes
 */
export interface CoverAttributes extends BlockAttributes {
  url?: string;
  id?: number;
  dimRatio?: number;
  overlayColor?: string;
  customOverlayColor?: string;
  minHeight?: number | string;
  minHeightUnit?: string;
}

/**
 * Spacer block attributes
 */
export interface SpacerAttributes extends BlockAttributes {
  height?: string;
}

/**
 * Separator block attributes
 */
export interface SeparatorAttributes extends BlockAttributes {
  className?: string;
}

/**
 * List block attributes
 */
export interface ListAttributes extends BlockAttributes {
  ordered?: boolean;
  start?: number;
  reversed?: boolean;
}

/**
 * Supported core block types
 */
export type CoreBlockType =
  | 'core/heading'
  | 'core/paragraph'
  | 'core/image'
  | 'core/group'
  | 'core/columns'
  | 'core/column'
  | 'core/buttons'
  | 'core/button'
  | 'core/cover'
  | 'core/spacer'
  | 'core/separator'
  | 'core/list'
  | 'core/list-item';

/**
 * Block serialization result
 */
export interface SerializedBlock {
  html: string;
  isValid: boolean;
}

/**
 * Block registry entry
 */
export interface BlockTypeDefinition {
  name: string;
  serialize: (block: BlockNode) => string;
  supports?: {
    anchor?: boolean;
    align?: boolean | string[];
    color?: boolean | { background?: boolean; text?: boolean; link?: boolean };
    typography?: boolean | { fontSize?: boolean; lineHeight?: boolean };
  };
}

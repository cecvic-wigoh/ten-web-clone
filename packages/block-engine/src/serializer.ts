/**
 * Gutenberg Block Serializer
 *
 * Converts BlockNode structures into valid WordPress Gutenberg block grammar.
 *
 * Block grammar format:
 * &lt;!-- wp:blockname {"attr":"value"} --&gt;
 * <html content>
 * &lt;!-- /wp:blockname --&gt;
 */

import { BlockNode, BlockAttributes } from './types';

export type { BlockNode } from './types';

/**
 * Serialize a single block to Gutenberg block grammar
 */
export function serializeBlock(block: BlockNode): string {
  const serializer = getBlockSerializer(block.name);
  return serializer(block);
}

/**
 * Serialize multiple blocks, separated by double newlines
 */
export function serializeBlocks(blocks: BlockNode[]): string {
  return blocks.map(serializeBlock).join('\n\n');
}

/**
 * Get the appropriate serializer for a block type
 */
function getBlockSerializer(
  blockName: string
): (block: BlockNode) => string {
  const serializers: Record<string, (block: BlockNode) => string> = {
    'core/heading': serializeHeading,
    'core/paragraph': serializeParagraph,
    'core/image': serializeImage,
    'core/group': serializeGroup,
    'core/columns': serializeColumns,
    'core/column': serializeColumn,
    'core/buttons': serializeButtons,
    'core/button': serializeButton,
    'core/cover': serializeCover,
    'core/spacer': serializeSpacer,
    'core/separator': serializeSeparator,
    'core/list': serializeList,
    'core/list-item': serializeListItem,
  };

  return serializers[blockName] || serializeGeneric;
}

/**
 * Create the opening comment for a block
 */
function openComment(blockName: string, attributes: BlockAttributes): string {
  const shortName = blockName.replace('core/', '');
  const filteredAttrs = filterEmptyAttributes(attributes);

  if (Object.keys(filteredAttrs).length === 0) {
    return `<!-- wp:${shortName} -->`;
  }

  return `<!-- wp:${shortName} ${JSON.stringify(filteredAttrs)} -->`;
}

/**
 * Create the closing comment for a block
 */
function closeComment(blockName: string): string {
  const shortName = blockName.replace('core/', '');
  return `<!-- /wp:${shortName} -->`;
}

/**
 * Filter out empty/undefined attributes
 */
function filterEmptyAttributes(attrs: BlockAttributes): BlockAttributes {
  const result: BlockAttributes = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Get text alignment class
 */
function getAlignmentClass(align?: string): string {
  if (!align) return '';
  return `has-text-align-${align}`;
}

/**
 * Get background color class
 */
function getBackgroundColorClass(color?: string): string {
  if (!color) return '';
  return `has-${color}-background-color`;
}

/**
 * Build class string from multiple classes
 */
function buildClassString(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Serialize inner blocks recursively
 */
function serializeInnerBlocks(block: BlockNode): string {
  if (!block.innerBlocks || block.innerBlocks.length === 0) {
    return '';
  }

  return block.innerBlocks.map(serializeBlock).join('\n');
}

// ============================================================================
// Block Serializers
// ============================================================================

function serializeHeading(block: BlockNode): string {
  const level = (block.attributes.level as number) || 2;
  const textAlign = block.attributes.textAlign as string | undefined;

  const classes = buildClassString(
    'wp-block-heading',
    getAlignmentClass(textAlign)
  );

  const attrs: BlockAttributes = { ...block.attributes };
  // Level 2 is default, don't include in attributes
  if (level === 2) {
    delete attrs.level;
  }

  const content = block.innerContent[0] || '';

  return (
    `${openComment(block.name, attrs)}\n` +
    `<h${level} class="${classes}">${content}</h${level}>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeParagraph(block: BlockNode): string {
  const align = block.attributes.align as string | undefined;
  const content = block.innerContent[0] || '';

  const classes = getAlignmentClass(align);
  const classAttr = classes ? ` class="${classes}"` : '';

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<p${classAttr}>${content}</p>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeImage(block: BlockNode): string {
  const { url, alt, width, height, caption } = block.attributes as {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
  };

  let imgAttrs = `src="${url || ''}"`;
  if (alt) imgAttrs += ` alt="${alt}"`;
  if (width) imgAttrs += ` width="${width}"`;
  if (height) imgAttrs += ` height="${height}"`;

  let html = `<figure class="wp-block-image"><img ${imgAttrs}/></figure>`;

  if (caption) {
    html = `<figure class="wp-block-image"><img ${imgAttrs}/><figcaption class="wp-element-caption">${caption}</figcaption></figure>`;
  }

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `${html}\n` +
    `${closeComment(block.name)}`
  );
}

function serializeGroup(block: BlockNode): string {
  const innerBlocksHtml = serializeInnerBlocks(block);
  const backgroundColor = block.attributes.backgroundColor as string | undefined;

  const classes = buildClassString(
    'wp-block-group',
    getBackgroundColorClass(backgroundColor)
  );

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="${classes}">\n` +
    `${innerBlocksHtml}\n` +
    `</div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeColumns(block: BlockNode): string {
  const innerBlocksHtml = serializeInnerBlocks(block);

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="wp-block-columns">\n` +
    `${innerBlocksHtml}\n` +
    `</div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeColumn(block: BlockNode): string {
  const innerBlocksHtml = serializeInnerBlocks(block);

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="wp-block-column">\n` +
    `${innerBlocksHtml}\n` +
    `</div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeButtons(block: BlockNode): string {
  const innerBlocksHtml = serializeInnerBlocks(block);

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="wp-block-buttons">\n` +
    `${innerBlocksHtml}\n` +
    `</div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeButton(block: BlockNode): string {
  const { url, text, backgroundColor } = block.attributes as {
    url?: string;
    text?: string;
    backgroundColor?: string;
  };

  const buttonClasses = buildClassString(
    'wp-block-button__link',
    'wp-element-button',
    getBackgroundColorClass(backgroundColor)
  );

  const content = block.innerContent[0] || text || '';

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="wp-block-button"><a class="${buttonClasses}" href="${url || '#'}">${content}</a></div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeCover(block: BlockNode): string {
  const { url, dimRatio, overlayColor } = block.attributes as {
    url?: string;
    dimRatio?: number;
    overlayColor?: string;
  };

  const classes = buildClassString(
    'wp-block-cover',
    overlayColor ? getBackgroundColorClass(overlayColor) : ''
  );

  const innerBlocksHtml = serializeInnerBlocks(block);

  let style = '';
  if (url) {
    style = ` style="background-image:url(${url})"`;
  }

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div class="${classes}"${style}>\n` +
    `<span aria-hidden="true" class="wp-block-cover__background has-background-dim${dimRatio ? `-${dimRatio}` : ''}"></span>\n` +
    `<div class="wp-block-cover__inner-container">\n` +
    `${innerBlocksHtml}\n` +
    `</div>\n` +
    `</div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeSpacer(block: BlockNode): string {
  const height = (block.attributes.height as string) || '100px';

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<div style="height:${height}" aria-hidden="true" class="wp-block-spacer"></div>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeSeparator(block: BlockNode): string {
  const className = block.attributes.className as string | undefined;

  const classes = buildClassString('wp-block-separator', className || '');

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<hr class="${classes}"/>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeList(block: BlockNode): string {
  const ordered = block.attributes.ordered as boolean | undefined;
  const tag = ordered ? 'ol' : 'ul';

  const innerBlocksHtml = serializeInnerBlocks(block);

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<${tag} class="wp-block-list">\n` +
    `${innerBlocksHtml}\n` +
    `</${tag}>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeListItem(block: BlockNode): string {
  const content = block.innerContent[0] || '';

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `<li>${content}</li>\n` +
    `${closeComment(block.name)}`
  );
}

function serializeGeneric(block: BlockNode): string {
  const innerBlocksHtml = serializeInnerBlocks(block);
  const content = block.innerContent.filter((c): c is string => typeof c === 'string').join('');

  return (
    `${openComment(block.name, block.attributes)}\n` +
    `${content}${innerBlocksHtml}\n` +
    `${closeComment(block.name)}`
  );
}

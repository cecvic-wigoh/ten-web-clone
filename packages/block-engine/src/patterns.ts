/**
 * Block Pattern Library
 *
 * Pre-built patterns for common website sections.
 * Each pattern returns a BlockNode that can be serialized.
 */

import { BlockNode } from './types';

// ============================================================================
// Pattern Configuration Types
// ============================================================================

export interface PatternConfig {
  hero?: HeroConfig;
  features?: FeaturesConfig;
  cta?: CtaConfig;
  testimonials?: TestimonialsConfig;
  footer?: FooterConfig;
}

export interface HeroConfig {
  heading: string;
  subheading: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesConfig {
  title: string;
  features: FeatureItem[];
}

export interface CtaConfig {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  image?: string;
}

export interface TestimonialsConfig {
  title: string;
  testimonials: TestimonialItem[];
}

export interface FooterColumn {
  title: string;
  links: { text: string; url: string }[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface FooterConfig {
  columns: FooterColumn[];
  copyright: string;
  socialLinks?: SocialLink[];
}

// ============================================================================
// Pattern Generators
// ============================================================================

/**
 * Create a hero section pattern
 */
export function createHeroPattern(config: HeroConfig): BlockNode {
  const { heading, subheading, buttonText, buttonUrl, backgroundImage } = config;

  // Build inner blocks
  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 1, textAlign: 'center' },
      innerContent: [heading],
    },
    {
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [subheading],
    },
  ];

  // Add button if provided
  if (buttonText && buttonUrl) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: [
        {
          name: 'core/button',
          attributes: { url: buttonUrl, text: buttonText },
          innerContent: [buttonText],
        },
      ],
      innerContent: [null],
    });
  }

  // If background image, wrap in cover block
  if (backgroundImage) {
    return {
      name: 'core/cover',
      attributes: {
        url: backgroundImage,
        dimRatio: config.backgroundOverlay || 50,
        minHeight: 500,
        align: 'full',
      },
      innerBlocks,
      innerContent: innerBlocks.map(() => null),
    };
  }

  // Otherwise, wrap in group
  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      align: 'full',
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

/**
 * Create a features section pattern
 */
export function createFeaturesPattern(config: FeaturesConfig): BlockNode {
  const { title, features } = config;

  // Create column for each feature
  const columns: BlockNode[] = features.map((feature) => {
    const columnBlocks: BlockNode[] = [];

    // Add icon if provided
    if (feature.icon) {
      columnBlocks.push({
        name: 'core/paragraph',
        attributes: { align: 'center' },
        innerContent: [feature.icon],
      });
    }

    // Feature title
    columnBlocks.push({
      name: 'core/heading',
      attributes: { level: 3, textAlign: 'center' },
      innerContent: [feature.title],
    });

    // Feature description
    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [feature.description],
    });

    return {
      name: 'core/column',
      attributes: {},
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    };
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [title],
      },
      {
        name: 'core/spacer',
        attributes: { height: '30px' },
        innerContent: [],
      },
      {
        name: 'core/columns',
        attributes: {},
        innerBlocks: columns,
        innerContent: columns.map(() => null),
      },
    ],
    innerContent: [null, null, null],
  };
}

/**
 * Create a CTA (Call to Action) section pattern
 */
export function createCtaPattern(config: CtaConfig): BlockNode {
  const { heading, description, buttonText, buttonUrl, backgroundColor } = config;

  const groupAttrs: Record<string, unknown> = {
    layout: { type: 'constrained' },
    align: 'full',
  };

  if (backgroundColor) {
    groupAttrs.backgroundColor = backgroundColor;
  }

  return {
    name: 'core/group',
    attributes: groupAttrs,
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [heading],
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center' },
        innerContent: [description],
      },
      {
        name: 'core/buttons',
        attributes: { layout: { type: 'flex', justifyContent: 'center' } },
        innerBlocks: [
          {
            name: 'core/button',
            attributes: { url: buttonUrl, text: buttonText },
            innerContent: [buttonText],
          },
        ],
        innerContent: [null],
      },
    ],
    innerContent: [null, null, null],
  };
}

/**
 * Create a testimonials section pattern
 */
export function createTestimonialsPattern(config: TestimonialsConfig): BlockNode {
  const { title, testimonials } = config;

  // Create column for each testimonial
  const columns: BlockNode[] = testimonials.map((testimonial) => {
    const columnBlocks: BlockNode[] = [];

    // Add image if provided
    if (testimonial.image) {
      columnBlocks.push({
        name: 'core/image',
        attributes: {
          url: testimonial.image,
          alt: testimonial.author,
          align: 'center',
          width: 80,
          height: 80,
        },
        innerContent: [],
      });
    }

    // Quote
    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [`"${testimonial.quote}"`],
    });

    // Author
    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [
        `<strong>${testimonial.author}</strong>${testimonial.role ? `<br/><em>${testimonial.role}</em>` : ''}`,
      ],
    });

    return {
      name: 'core/column',
      attributes: {},
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    };
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [title],
      },
      {
        name: 'core/spacer',
        attributes: { height: '30px' },
        innerContent: [],
      },
      {
        name: 'core/columns',
        attributes: {},
        innerBlocks: columns,
        innerContent: columns.map(() => null),
      },
    ],
    innerContent: [null, null, null],
  };
}

/**
 * Create a footer section pattern
 */
export function createFooterPattern(config: FooterConfig): BlockNode {
  const { columns, copyright, socialLinks } = config;

  const innerBlocks: BlockNode[] = [];

  // Create columns for navigation if provided
  if (columns.length > 0) {
    const columnBlocks: BlockNode[] = columns.map((column) => {
      const linkBlocks: BlockNode[] = [
        {
          name: 'core/heading',
          attributes: { level: 4 },
          innerContent: [column.title],
        },
        {
          name: 'core/list',
          attributes: {},
          innerBlocks: column.links.map((link) => ({
            name: 'core/list-item',
            attributes: {},
            innerContent: [`<a href="${link.url}">${link.text}</a>`],
          })),
          innerContent: column.links.map(() => null),
        },
      ];

      return {
        name: 'core/column',
        attributes: {},
        innerBlocks: linkBlocks,
        innerContent: linkBlocks.map(() => null),
      };
    });

    innerBlocks.push({
      name: 'core/columns',
      attributes: {},
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    });
  }

  // Add social links if provided
  if (socialLinks && socialLinks.length > 0) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: socialLinks.map((social) => ({
        name: 'core/button',
        attributes: { url: social.url, text: social.platform },
        innerContent: [social.platform],
      })),
      innerContent: socialLinks.map(() => null),
    });
  }

  // Add separator
  innerBlocks.push({
    name: 'core/separator',
    attributes: {},
    innerContent: [],
  });

  // Add copyright
  innerBlocks.push({
    name: 'core/paragraph',
    attributes: { align: 'center' },
    innerContent: [copyright],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

/**
 * Block Pattern Library
 *
 * Pre-built patterns for common website sections with multiple layout variants.
 * Each pattern returns a BlockNode that can be serialized.
 */

import { BlockNode } from './types';

// ============================================================================
// Layout Types
// ============================================================================

export type HeroLayout = 'centered' | 'split-left' | 'split-right' | 'minimal' | 'fullscreen';
export type FeaturesLayout = 'grid-3' | 'grid-4' | 'grid-2' | 'cards' | 'alternating' | 'icon-left';
export type TestimonialsLayout = 'cards' | 'single-large' | 'quote-wall' | 'centered';
export type CtaLayout = 'centered' | 'split' | 'banner' | 'card';
export type FooterLayout = 'columns' | 'minimal' | 'centered' | 'mega';

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
  layout?: HeroLayout;
  heading: string;
  subheading: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface FeaturesConfig {
  layout?: FeaturesLayout;
  title: string;
  subtitle?: string;
  features: FeatureItem[];
  columns?: number;
}

export interface CtaConfig {
  layout?: CtaLayout;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  image?: string;
}

export interface TestimonialsConfig {
  layout?: TestimonialsLayout;
  title: string;
  subtitle?: string;
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
  layout?: FooterLayout;
  columns: FooterColumn[];
  copyright: string;
  socialLinks?: SocialLink[];
  showNewsletter?: boolean;
}

// ============================================================================
// Hero Pattern - Multiple Layout Variants
// ============================================================================

/**
 * Create a hero section pattern with layout variants
 */
export function createHeroPattern(config: HeroConfig): BlockNode {
  const layout = config.layout || 'centered';
  const alignment = config.alignment || 'center';

  switch (layout) {
    case 'split-left':
      return createSplitHero(config, 'left');
    case 'split-right':
      return createSplitHero(config, 'right');
    case 'minimal':
      return createMinimalHero(config);
    case 'fullscreen':
      return createFullscreenHero(config);
    case 'centered':
    default:
      return createCenteredHero(config, alignment);
  }
}

function createCenteredHero(config: HeroConfig, alignment: string): BlockNode {
  const { heading, subheading, buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl, backgroundImage } = config;
  const textAlign = alignment === 'center' ? 'center' : alignment;

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 1, textAlign },
      innerContent: [heading],
    },
    {
      name: 'core/paragraph',
      attributes: { align: textAlign, fontSize: 'large' },
      innerContent: [subheading],
    },
  ];

  // Add buttons
  const buttons: BlockNode[] = [];
  if (buttonText && buttonUrl) {
    buttons.push({
      name: 'core/button',
      attributes: { url: buttonUrl, text: buttonText, className: 'is-style-fill' },
      innerContent: [buttonText],
    });
  }
  if (secondaryButtonText && secondaryButtonUrl) {
    buttons.push({
      name: 'core/button',
      attributes: { url: secondaryButtonUrl, text: secondaryButtonText, className: 'is-style-outline' },
      innerContent: [secondaryButtonText],
    });
  }
  if (buttons.length > 0) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: textAlign } },
      innerBlocks: buttons,
      innerContent: buttons.map(() => null),
    });
  }

  if (backgroundImage) {
    return {
      name: 'core/cover',
      attributes: {
        url: backgroundImage,
        dimRatio: config.backgroundOverlay || 50,
        minHeight: 600,
        align: 'full',
        contentPosition: 'center center',
      },
      innerBlocks,
      innerContent: innerBlocks.map(() => null),
    };
  }

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      align: 'full',
      style: { spacing: { padding: { top: '100px', bottom: '100px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createSplitHero(config: HeroConfig, contentSide: 'left' | 'right'): BlockNode {
  const { heading, subheading, buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl, backgroundImage } = config;

  const contentColumn: BlockNode = {
    name: 'core/column',
    attributes: { width: '50%', verticalAlignment: 'center' },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 1, textAlign: 'left' },
        innerContent: [heading],
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'left', fontSize: 'large' },
        innerContent: [subheading],
      },
      ...(buttonText && buttonUrl
        ? [
            {
              name: 'core/buttons',
              attributes: { layout: { type: 'flex', justifyContent: 'left' } },
              innerBlocks: [
                {
                  name: 'core/button',
                  attributes: { url: buttonUrl, text: buttonText },
                  innerContent: [buttonText],
                },
                ...(secondaryButtonText && secondaryButtonUrl
                  ? [
                      {
                        name: 'core/button',
                        attributes: { url: secondaryButtonUrl, text: secondaryButtonText, className: 'is-style-outline' },
                        innerContent: [secondaryButtonText],
                      },
                    ]
                  : []),
              ],
              innerContent: [null, ...(secondaryButtonText ? [null] : [])],
            } as BlockNode,
          ]
        : []),
    ],
    innerContent: [null, null, ...(buttonText ? [null] : [])],
  };

  const imageColumn: BlockNode = {
    name: 'core/column',
    attributes: { width: '50%' },
    innerBlocks: backgroundImage
      ? [
          {
            name: 'core/image',
            attributes: {
              url: backgroundImage,
              alt: heading,
              sizeSlug: 'large',
              className: 'is-style-rounded',
            },
            innerContent: [],
          },
        ]
      : [],
    innerContent: backgroundImage ? [null] : [],
  };

  const columns = contentSide === 'left' ? [contentColumn, imageColumn] : [imageColumn, contentColumn];

  return {
    name: 'core/group',
    attributes: {
      align: 'full',
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '80px', bottom: '80px' } } },
    },
    innerBlocks: [
      {
        name: 'core/columns',
        attributes: { verticalAlignment: 'center', isStackedOnMobile: true },
        innerBlocks: columns,
        innerContent: [null, null],
      },
    ],
    innerContent: [null],
  };
}

function createMinimalHero(config: HeroConfig): BlockNode {
  const { heading, subheading, buttonText, buttonUrl } = config;

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/spacer',
      attributes: { height: '60px' },
      innerContent: [],
    },
    {
      name: 'core/heading',
      attributes: { level: 1, textAlign: 'center', fontSize: 'x-large' },
      innerContent: [heading],
    },
    {
      name: 'core/paragraph',
      attributes: { align: 'center', fontSize: 'medium' },
      innerContent: [subheading],
    },
  ];

  if (buttonText && buttonUrl) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: [
        {
          name: 'core/button',
          attributes: { url: buttonUrl, text: buttonText, className: 'is-style-outline' },
          innerContent: [buttonText],
        },
      ],
      innerContent: [null],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '60px' },
    innerContent: [],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained', contentSize: '800px' },
      align: 'full',
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createFullscreenHero(config: HeroConfig): BlockNode {
  const { heading, subheading, buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl, backgroundImage } = config;

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 1, textAlign: 'center', fontSize: 'x-large' },
      innerContent: [heading],
    },
    {
      name: 'core/paragraph',
      attributes: { align: 'center', fontSize: 'large' },
      innerContent: [subheading],
    },
  ];

  const buttons: BlockNode[] = [];
  if (buttonText && buttonUrl) {
    buttons.push({
      name: 'core/button',
      attributes: { url: buttonUrl, text: buttonText, className: 'is-style-fill' },
      innerContent: [buttonText],
    });
  }
  if (secondaryButtonText && secondaryButtonUrl) {
    buttons.push({
      name: 'core/button',
      attributes: { url: secondaryButtonUrl, text: secondaryButtonText, className: 'is-style-outline' },
      innerContent: [secondaryButtonText],
    });
  }
  if (buttons.length > 0) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: buttons,
      innerContent: buttons.map(() => null),
    });
  }

  return {
    name: 'core/cover',
    attributes: {
      url: backgroundImage || '',
      dimRatio: config.backgroundOverlay || 60,
      minHeightUnit: 'vh',
      minHeight: 100,
      align: 'full',
      contentPosition: 'center center',
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

// ============================================================================
// Features Pattern - Multiple Layout Variants
// ============================================================================

/**
 * Create a features section pattern with layout variants
 */
export function createFeaturesPattern(config: FeaturesConfig): BlockNode {
  const layout = config.layout || 'grid-3';

  switch (layout) {
    case 'grid-2':
      return createGridFeatures(config, 2);
    case 'grid-4':
      return createGridFeatures(config, 4);
    case 'cards':
      return createCardFeatures(config);
    case 'alternating':
      return createAlternatingFeatures(config);
    case 'icon-left':
      return createIconLeftFeatures(config);
    case 'grid-3':
    default:
      return createGridFeatures(config, 3);
  }
}

function createGridFeatures(config: FeaturesConfig, columnCount: number): BlockNode {
  const { title, subtitle, features } = config;

  // Split features into rows based on column count
  const rows: FeatureItem[][] = [];
  for (let i = 0; i < features.length; i += columnCount) {
    rows.push(features.slice(i, i + columnCount));
  }

  const rowBlocks: BlockNode[] = rows.map((rowFeatures) => {
    const columns: BlockNode[] = rowFeatures.map((feature) => {
      const columnBlocks: BlockNode[] = [];

      if (feature.icon) {
        columnBlocks.push({
          name: 'core/paragraph',
          attributes: { align: 'center', fontSize: 'x-large' },
          innerContent: [feature.icon],
        });
      }

      columnBlocks.push({
        name: 'core/heading',
        attributes: { level: 3, textAlign: 'center' },
        innerContent: [feature.title],
      });

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
      name: 'core/columns',
      attributes: { isStackedOnMobile: true },
      innerBlocks: columns,
      innerContent: columns.map(() => null),
    };
  });

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [title],
    },
  ];

  if (subtitle) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center', fontSize: 'medium' },
      innerContent: [subtitle],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '40px' },
    innerContent: [],
  });

  innerBlocks.push(...rowBlocks);

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createCardFeatures(config: FeaturesConfig): BlockNode {
  const { title, subtitle, features } = config;

  const columns: BlockNode[] = features.map((feature) => {
    const columnBlocks: BlockNode[] = [];

    if (feature.icon) {
      columnBlocks.push({
        name: 'core/paragraph',
        attributes: { align: 'center', fontSize: 'x-large' },
        innerContent: [feature.icon],
      });
    }

    columnBlocks.push({
      name: 'core/heading',
      attributes: { level: 3, textAlign: 'center' },
      innerContent: [feature.title],
    });

    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [feature.description],
    });

    return {
      name: 'core/column',
      attributes: {
        style: {
          border: { radius: '8px', width: '1px', color: '#e5e7eb' },
          spacing: { padding: { top: '30px', bottom: '30px', left: '20px', right: '20px' } },
        },
        backgroundColor: 'white',
      },
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    };
  });

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [title],
    },
  ];

  if (subtitle) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [subtitle],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '40px' },
    innerContent: [],
  });

  innerBlocks.push({
    name: 'core/columns',
    attributes: { isStackedOnMobile: true },
    innerBlocks: columns,
    innerContent: columns.map(() => null),
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
      backgroundColor: 'tertiary',
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createAlternatingFeatures(config: FeaturesConfig): BlockNode {
  const { title, subtitle, features } = config;

  const featureBlocks: BlockNode[] = features.map((feature, index) => {
    const isImageLeft = index % 2 === 0;

    const textColumn: BlockNode = {
      name: 'core/column',
      attributes: { width: '50%', verticalAlignment: 'center' },
      innerBlocks: [
        {
          name: 'core/heading',
          attributes: { level: 3 },
          innerContent: [feature.title],
        },
        {
          name: 'core/paragraph',
          attributes: {},
          innerContent: [feature.description],
        },
      ],
      innerContent: [null, null],
    };

    const iconColumn: BlockNode = {
      name: 'core/column',
      attributes: { width: '50%', verticalAlignment: 'center' },
      innerBlocks: [
        {
          name: 'core/paragraph',
          attributes: { align: 'center', fontSize: 'x-large' },
          innerContent: [feature.icon || ''],
        },
      ],
      innerContent: [null],
    };

    const columns = isImageLeft ? [iconColumn, textColumn] : [textColumn, iconColumn];

    return {
      name: 'core/columns',
      attributes: { verticalAlignment: 'center', isStackedOnMobile: true },
      innerBlocks: columns,
      innerContent: [null, null],
    };
  });

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [title],
    },
  ];

  if (subtitle) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [subtitle],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '40px' },
    innerContent: [],
  });

  // Add spacers between feature blocks
  featureBlocks.forEach((block, index) => {
    innerBlocks.push(block);
    if (index < featureBlocks.length - 1) {
      innerBlocks.push({
        name: 'core/spacer',
        attributes: { height: '40px' },
        innerContent: [],
      });
    }
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createIconLeftFeatures(config: FeaturesConfig): BlockNode {
  const { title, subtitle, features } = config;

  const featureBlocks: BlockNode[] = features.map((feature) => ({
    name: 'core/columns',
    attributes: { isStackedOnMobile: false },
    innerBlocks: [
      {
        name: 'core/column',
        attributes: { width: '60px', verticalAlignment: 'top' },
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'large' },
            innerContent: [feature.icon || ''],
          },
        ],
        innerContent: [null],
      },
      {
        name: 'core/column',
        attributes: { verticalAlignment: 'top' },
        innerBlocks: [
          {
            name: 'core/heading',
            attributes: { level: 4 },
            innerContent: [feature.title],
          },
          {
            name: 'core/paragraph',
            attributes: {},
            innerContent: [feature.description],
          },
        ],
        innerContent: [null, null],
      },
    ],
    innerContent: [null, null],
  }));

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [title],
    },
  ];

  if (subtitle) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [subtitle],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '30px' },
    innerContent: [],
  });

  innerBlocks.push(...featureBlocks);

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained', contentSize: '800px' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

// ============================================================================
// CTA Pattern - Multiple Layout Variants
// ============================================================================

/**
 * Create a CTA (Call to Action) section pattern with layout variants
 */
export function createCtaPattern(config: CtaConfig): BlockNode {
  const layout = config.layout || 'centered';

  switch (layout) {
    case 'split':
      return createSplitCta(config);
    case 'banner':
      return createBannerCta(config);
    case 'card':
      return createCardCta(config);
    case 'centered':
    default:
      return createCenteredCta(config);
  }
}

function createCenteredCta(config: CtaConfig): BlockNode {
  const { heading, description, buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl, backgroundColor, backgroundImage } =
    config;

  const buttons: BlockNode[] = [
    {
      name: 'core/button',
      attributes: { url: buttonUrl, text: buttonText, className: 'is-style-fill' },
      innerContent: [buttonText],
    },
  ];

  if (secondaryButtonText && secondaryButtonUrl) {
    buttons.push({
      name: 'core/button',
      attributes: { url: secondaryButtonUrl, text: secondaryButtonText, className: 'is-style-outline' },
      innerContent: [secondaryButtonText],
    });
  }

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [heading],
    },
    {
      name: 'core/paragraph',
      attributes: { align: 'center', fontSize: 'medium' },
      innerContent: [description],
    },
    {
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: buttons,
      innerContent: buttons.map(() => null),
    },
  ];

  const groupAttrs: Record<string, unknown> = {
    layout: { type: 'constrained' },
    align: 'full',
    style: { spacing: { padding: { top: '80px', bottom: '80px' } } },
  };

  if (backgroundColor) {
    groupAttrs.style = { ...groupAttrs.style as object, color: { background: backgroundColor } };
  }

  if (backgroundImage) {
    return {
      name: 'core/cover',
      attributes: {
        url: backgroundImage,
        dimRatio: 70,
        align: 'full',
      },
      innerBlocks,
      innerContent: innerBlocks.map(() => null),
    };
  }

  return {
    name: 'core/group',
    attributes: groupAttrs,
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createSplitCta(config: CtaConfig): BlockNode {
  const { heading, description, buttonText, buttonUrl } = config;

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      align: 'full',
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks: [
      {
        name: 'core/columns',
        attributes: { verticalAlignment: 'center', isStackedOnMobile: true },
        innerBlocks: [
          {
            name: 'core/column',
            attributes: { width: '66.66%' },
            innerBlocks: [
              {
                name: 'core/heading',
                attributes: { level: 2 },
                innerContent: [heading],
              },
              {
                name: 'core/paragraph',
                attributes: { fontSize: 'medium' },
                innerContent: [description],
              },
            ],
            innerContent: [null, null],
          },
          {
            name: 'core/column',
            attributes: { width: '33.33%', verticalAlignment: 'center' },
            innerBlocks: [
              {
                name: 'core/buttons',
                attributes: { layout: { type: 'flex', justifyContent: 'right' } },
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
            innerContent: [null],
          },
        ],
        innerContent: [null, null],
      },
    ],
    innerContent: [null],
  };
}

function createBannerCta(config: CtaConfig): BlockNode {
  const { heading, buttonText, buttonUrl, backgroundColor } = config;

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' },
      align: 'full',
      style: {
        spacing: { padding: { top: '20px', bottom: '20px', left: '40px', right: '40px' } },
        color: { background: backgroundColor || '#1e40af' },
      },
    },
    innerBlocks: [
      {
        name: 'core/paragraph',
        attributes: { fontSize: 'medium', style: { color: { text: '#ffffff' } } },
        innerContent: [heading],
      },
      {
        name: 'core/buttons',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/button',
            attributes: { url: buttonUrl, text: buttonText, className: 'is-style-outline', style: { color: { text: '#ffffff' } } },
            innerContent: [buttonText],
          },
        ],
        innerContent: [null],
      },
    ],
    innerContent: [null, null],
  };
}

function createCardCta(config: CtaConfig): BlockNode {
  const { heading, description, buttonText, buttonUrl, backgroundColor } = config;

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '40px', bottom: '40px' } } },
    },
    innerBlocks: [
      {
        name: 'core/group',
        attributes: {
          layout: { type: 'constrained', contentSize: '600px' },
          style: {
            spacing: { padding: { top: '40px', bottom: '40px', left: '40px', right: '40px' } },
            border: { radius: '12px' },
            color: { background: backgroundColor || '#f3f4f6' },
          },
        },
        innerBlocks: [
          {
            name: 'core/heading',
            attributes: { level: 3, textAlign: 'center' },
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
      },
    ],
    innerContent: [null],
  };
}

// ============================================================================
// Testimonials Pattern - Multiple Layout Variants
// ============================================================================

/**
 * Create a testimonials section pattern with layout variants
 */
export function createTestimonialsPattern(config: TestimonialsConfig): BlockNode {
  const layout = config.layout || 'cards';

  switch (layout) {
    case 'single-large':
      return createSingleLargeTestimonial(config);
    case 'quote-wall':
      return createQuoteWallTestimonials(config);
    case 'centered':
      return createCenteredTestimonials(config);
    case 'cards':
    default:
      return createCardTestimonials(config);
  }
}

function createCardTestimonials(config: TestimonialsConfig): BlockNode {
  const { title, subtitle, testimonials } = config;

  const columns: BlockNode[] = testimonials.map((testimonial) => {
    const columnBlocks: BlockNode[] = [];

    if (testimonial.image) {
      columnBlocks.push({
        name: 'core/image',
        attributes: {
          url: testimonial.image,
          alt: testimonial.author,
          align: 'center',
          width: 80,
          height: 80,
          className: 'is-style-rounded',
        },
        innerContent: [],
      });
    }

    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center', style: { typography: { fontStyle: 'italic' } } },
      innerContent: [`"${testimonial.quote}"`],
    });

    columnBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [`<strong>${testimonial.author}</strong>${testimonial.role ? `<br/><em>${testimonial.role}</em>` : ''}`],
    });

    return {
      name: 'core/column',
      attributes: {
        style: {
          spacing: { padding: { top: '30px', bottom: '30px', left: '20px', right: '20px' } },
        },
      },
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    };
  });

  const innerBlocks: BlockNode[] = [
    {
      name: 'core/heading',
      attributes: { level: 2, textAlign: 'center' },
      innerContent: [title],
    },
  ];

  if (subtitle) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [subtitle],
    });
  }

  innerBlocks.push({
    name: 'core/spacer',
    attributes: { height: '30px' },
    innerContent: [],
  });

  innerBlocks.push({
    name: 'core/columns',
    attributes: { isStackedOnMobile: true },
    innerBlocks: columns,
    innerContent: columns.map(() => null),
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createSingleLargeTestimonial(config: TestimonialsConfig): BlockNode {
  const { title, testimonials } = config;
  const testimonial = testimonials[0]; // Use first testimonial

  if (!testimonial) {
    return createCardTestimonials(config); // Fallback
  }

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained', contentSize: '800px' },
      style: { spacing: { padding: { top: '80px', bottom: '80px' } } },
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [title],
      },
      {
        name: 'core/spacer',
        attributes: { height: '40px' },
        innerContent: [],
      },
      {
        name: 'core/quote',
        attributes: { align: 'center', className: 'is-style-large' },
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'large' },
            innerContent: [testimonial.quote],
          },
        ],
        innerContent: [null],
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center', fontSize: 'medium' },
        innerContent: [`— ${testimonial.author}${testimonial.role ? `, ${testimonial.role}` : ''}`],
      },
    ],
    innerContent: [null, null, null, null],
  };
}

function createQuoteWallTestimonials(config: TestimonialsConfig): BlockNode {
  const { title, testimonials } = config;

  const quoteBlocks: BlockNode[] = testimonials.map((testimonial) => ({
    name: 'core/group',
    attributes: {
      style: {
        spacing: { padding: { top: '20px', bottom: '20px', left: '20px', right: '20px' } },
        border: { left: { width: '4px', color: '#3b82f6' } },
      },
    },
    innerBlocks: [
      {
        name: 'core/paragraph',
        attributes: { style: { typography: { fontStyle: 'italic' } } },
        innerContent: [`"${testimonial.quote}"`],
      },
      {
        name: 'core/paragraph',
        attributes: { fontSize: 'small' },
        innerContent: [`— ${testimonial.author}${testimonial.role ? `, ${testimonial.role}` : ''}`],
      },
    ],
    innerContent: [null, null],
  }));

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [title],
      },
      {
        name: 'core/spacer',
        attributes: { height: '40px' },
        innerContent: [],
      },
      {
        name: 'core/columns',
        attributes: { isStackedOnMobile: true },
        innerBlocks: [
          {
            name: 'core/column',
            attributes: {},
            innerBlocks: quoteBlocks.filter((_, i) => i % 2 === 0),
            innerContent: quoteBlocks.filter((_, i) => i % 2 === 0).map(() => null),
          },
          {
            name: 'core/column',
            attributes: {},
            innerBlocks: quoteBlocks.filter((_, i) => i % 2 !== 0),
            innerContent: quoteBlocks.filter((_, i) => i % 2 !== 0).map(() => null),
          },
        ],
        innerContent: [null, null],
      },
    ],
    innerContent: [null, null, null],
  };
}

function createCenteredTestimonials(config: TestimonialsConfig): BlockNode {
  const { title, testimonials } = config;

  const testimonialBlocks: BlockNode[] = testimonials.map((testimonial) => ({
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained', contentSize: '700px' },
      style: { spacing: { padding: { top: '40px', bottom: '40px' } } },
    },
    innerBlocks: [
      {
        name: 'core/paragraph',
        attributes: { align: 'center', fontSize: 'large', style: { typography: { fontStyle: 'italic' } } },
        innerContent: [`"${testimonial.quote}"`],
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center' },
        innerContent: [`<strong>${testimonial.author}</strong>${testimonial.role ? `<br/>${testimonial.role}` : ''}`],
      },
    ],
    innerContent: [null, null],
  }));

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { level: 2, textAlign: 'center' },
        innerContent: [title],
      },
      ...testimonialBlocks,
    ],
    innerContent: [null, ...testimonialBlocks.map(() => null)],
  };
}

// ============================================================================
// Footer Pattern - Multiple Layout Variants
// ============================================================================

/**
 * Create a footer section pattern with layout variants
 */
export function createFooterPattern(config: FooterConfig): BlockNode {
  const layout = config.layout || 'columns';

  switch (layout) {
    case 'minimal':
      return createMinimalFooter(config);
    case 'centered':
      return createCenteredFooter(config);
    case 'mega':
      return createMegaFooter(config);
    case 'columns':
    default:
      return createColumnsFooter(config);
  }
}

function createColumnsFooter(config: FooterConfig): BlockNode {
  const { columns, copyright, socialLinks } = config;

  const innerBlocks: BlockNode[] = [];

  if (columns.length > 0) {
    const columnBlocks: BlockNode[] = columns.map((column) => ({
      name: 'core/column',
      attributes: {},
      innerBlocks: [
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
      ],
      innerContent: [null, null],
    }));

    innerBlocks.push({
      name: 'core/columns',
      attributes: { isStackedOnMobile: true },
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    });
  }

  if (socialLinks && socialLinks.length > 0) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: socialLinks.map((social) => ({
        name: 'core/button',
        attributes: { url: social.url, text: social.platform, className: 'is-style-outline' },
        innerContent: [social.platform],
      })),
      innerContent: socialLinks.map(() => null),
    });
  }

  innerBlocks.push({
    name: 'core/separator',
    attributes: {},
    innerContent: [],
  });

  innerBlocks.push({
    name: 'core/paragraph',
    attributes: { align: 'center', fontSize: 'small' },
    innerContent: [copyright],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '40px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createMinimalFooter(config: FooterConfig): BlockNode {
  const { copyright, socialLinks } = config;

  const innerBlocks: BlockNode[] = [];

  if (socialLinks && socialLinks.length > 0) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [socialLinks.map((s) => `<a href="${s.url}">${s.platform}</a>`).join(' · ')],
    });
  }

  innerBlocks.push({
    name: 'core/paragraph',
    attributes: { align: 'center', fontSize: 'small' },
    innerContent: [copyright],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '30px', bottom: '30px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createCenteredFooter(config: FooterConfig): BlockNode {
  const { columns, copyright, socialLinks } = config;

  const innerBlocks: BlockNode[] = [];

  // Flatten all links into one list
  const allLinks = columns.flatMap((col) => col.links);
  if (allLinks.length > 0) {
    innerBlocks.push({
      name: 'core/paragraph',
      attributes: { align: 'center' },
      innerContent: [allLinks.map((l) => `<a href="${l.url}">${l.text}</a>`).join(' · ')],
    });
  }

  if (socialLinks && socialLinks.length > 0) {
    innerBlocks.push({
      name: 'core/buttons',
      attributes: { layout: { type: 'flex', justifyContent: 'center' } },
      innerBlocks: socialLinks.map((social) => ({
        name: 'core/button',
        attributes: { url: social.url, text: social.platform, className: 'is-style-outline', style: { border: { radius: '50%' } } },
        innerContent: [social.platform],
      })),
      innerContent: socialLinks.map(() => null),
    });
  }

  innerBlocks.push({
    name: 'core/paragraph',
    attributes: { align: 'center', fontSize: 'small' },
    innerContent: [copyright],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '40px', bottom: '40px' } } },
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}

function createMegaFooter(config: FooterConfig): BlockNode {
  const { columns, copyright, socialLinks, showNewsletter } = config;

  const innerBlocks: BlockNode[] = [];

  // Newsletter section
  if (showNewsletter) {
    innerBlocks.push({
      name: 'core/columns',
      attributes: { isStackedOnMobile: true },
      innerBlocks: [
        {
          name: 'core/column',
          attributes: { width: '40%' },
          innerBlocks: [
            {
              name: 'core/heading',
              attributes: { level: 3 },
              innerContent: ['Stay Updated'],
            },
            {
              name: 'core/paragraph',
              attributes: {},
              innerContent: ['Subscribe to our newsletter for the latest updates.'],
            },
          ],
          innerContent: [null, null],
        },
        {
          name: 'core/column',
          attributes: { width: '60%', verticalAlignment: 'center' },
          innerBlocks: [
            {
              name: 'core/buttons',
              attributes: { layout: { type: 'flex', justifyContent: 'right' } },
              innerBlocks: [
                {
                  name: 'core/button',
                  attributes: { text: 'Subscribe', url: '#newsletter' },
                  innerContent: ['Subscribe'],
                },
              ],
              innerContent: [null],
            },
          ],
          innerContent: [null],
        },
      ],
      innerContent: [null, null],
    });

    innerBlocks.push({
      name: 'core/separator',
      attributes: { style: { spacing: { margin: { top: '40px', bottom: '40px' } } } },
      innerContent: [],
    });
  }

  // Link columns
  if (columns.length > 0) {
    const columnBlocks: BlockNode[] = columns.map((column) => ({
      name: 'core/column',
      attributes: {},
      innerBlocks: [
        {
          name: 'core/heading',
          attributes: { level: 4 },
          innerContent: [column.title],
        },
        {
          name: 'core/list',
          attributes: { style: { typography: { lineHeight: '2' } } },
          innerBlocks: column.links.map((link) => ({
            name: 'core/list-item',
            attributes: {},
            innerContent: [`<a href="${link.url}">${link.text}</a>`],
          })),
          innerContent: column.links.map(() => null),
        },
      ],
      innerContent: [null, null],
    }));

    innerBlocks.push({
      name: 'core/columns',
      attributes: { isStackedOnMobile: true },
      innerBlocks: columnBlocks,
      innerContent: columnBlocks.map(() => null),
    });
  }

  innerBlocks.push({
    name: 'core/separator',
    attributes: { style: { spacing: { margin: { top: '40px', bottom: '20px' } } } },
    innerContent: [],
  });

  // Bottom bar with social and copyright
  innerBlocks.push({
    name: 'core/columns',
    attributes: { verticalAlignment: 'center', isStackedOnMobile: true },
    innerBlocks: [
      {
        name: 'core/column',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'small' },
            innerContent: [copyright],
          },
        ],
        innerContent: [null],
      },
      {
        name: 'core/column',
        attributes: {},
        innerBlocks:
          socialLinks && socialLinks.length > 0
            ? [
                {
                  name: 'core/paragraph',
                  attributes: { align: 'right', fontSize: 'small' },
                  innerContent: [socialLinks.map((s) => `<a href="${s.url}">${s.platform}</a>`).join(' · ')],
                },
              ]
            : [],
        innerContent: socialLinks && socialLinks.length > 0 ? [null] : [],
      },
    ],
    innerContent: [null, null],
  });

  return {
    name: 'core/group',
    attributes: {
      layout: { type: 'constrained' },
      style: { spacing: { padding: { top: '60px', bottom: '40px' } } },
      backgroundColor: 'tertiary',
    },
    innerBlocks,
    innerContent: innerBlocks.map(() => null),
  };
}


// ============================================================================
// Convenience Function: Create Pattern from Section
// ============================================================================

export type SectionType = 'hero' | 'features' | 'cta' | 'testimonials' | 'gallery' | 'contact' | 'footer';

export interface SectionInput {
  type: SectionType;
  config: Record<string, unknown>;
}

/**
 * Creates a block pattern from a section definition
 * Maps section types to their respective pattern functions
 */
export function createPatternFromSection(section: SectionInput): BlockNode | null {
  switch (section.type) {
    case 'hero':
      return createHeroPattern(section.config as unknown as HeroConfig);

    case 'features':
      return createFeaturesPattern(section.config as unknown as FeaturesConfig);

    case 'cta':
      return createCtaPattern(section.config as unknown as CtaConfig);

    case 'testimonials':
      return createTestimonialsPattern(section.config as unknown as TestimonialsConfig);

    case 'footer':
      return createFooterPattern(section.config as unknown as FooterConfig);

    case 'gallery':
    case 'contact':
      // These section types are not yet implemented
      // Return a placeholder group
      return {
        name: 'core/group',
        attributes: {
          layout: { type: 'constrained' },
          style: { spacing: { padding: { top: '60px', bottom: '60px' } } },
        },
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { align: 'center' },
            innerContent: [`${section.type.charAt(0).toUpperCase() + section.type.slice(1)} section coming soon`],
          },
        ],
        innerContent: [null],
      };

    default:
      return null;
  }
}

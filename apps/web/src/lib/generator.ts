/**
 * Site Generator Orchestrator
 *
 * Orchestrates the full site generation pipeline:
 * 1. Structure Agent - Creates site structure from business description
 * 2. Content Agent - Generates copywriting for each section
 * 3. Image Agent - Selects/generates images for sections
 * 4. Block Engine - Converts structure + content to WordPress blocks
 * 5. Deployer (optional) - Deploys to WordPress
 */

import type {
  StructureAgent,
  ContentAgent,
  ImageAgent,
  SiteStructure,
  PageContent,
  TonePreset,
  Image,
} from '@ai-wp/agents';
import type { Deployer, DeploymentResult } from '@ai-wp/deployer';
import {
  createHeroPattern,
  createFeaturesPattern,
  createCtaPattern,
  createTestimonialsPattern,
  createFooterPattern,
  serializeBlock,
  type BlockNode,
} from '@ai-wp/block-engine';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for site generation
 */
export interface GenerationInput {
  businessName: string;
  businessDescription: string;
  industry: string;
  tone: TonePreset;
  deploy?: boolean;
  colorPreferences?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * Generation event types for streaming progress
 */
export type GenerationEvent =
  | { type: 'start'; message: string }
  | { type: 'progress'; step: GenerationStep; message: string }
  | { type: 'preview'; blocks: GeneratedPage[] }
  | { type: 'complete'; result: DeploymentResult }
  | { type: 'error'; step: GenerationStep; message: string };

/**
 * Generation steps
 */
export type GenerationStep =
  | 'structure'
  | 'content'
  | 'images'
  | 'blocks'
  | 'deploy';

/**
 * Generated page with blocks
 */
export interface GeneratedPage {
  slug: string;
  title: string;
  blocks: string;
}

/**
 * Dependencies for the generator
 */
export interface GeneratorDependencies {
  structureAgent: StructureAgent;
  contentAgent: ContentAgent;
  imageAgent: ImageAgent;
  deployer: Deployer;
}

/**
 * Generator interface
 */
export interface Generator {
  generate(input: GenerationInput): AsyncGenerator<GenerationEvent>;
}

// ============================================================================
// Block Generation Helpers
// ============================================================================

/**
 * Generate blocks for a section based on its type and content
 */
function generateSectionBlocks(
  sectionType: string,
  config: Record<string, unknown>,
  content: Record<string, unknown>,
  images: Map<string, Image>
): string {
  let blockNode: BlockNode | null = null;

  switch (sectionType.toLowerCase()) {
    case 'hero': {
      const heroImage = images.get('hero');
      blockNode = createHeroPattern({
        heading: (content.heading as string) || (config.heading as string) || 'Welcome',
        subheading: (content.subheading as string) || (config.subheading as string) || '',
        buttonText: (content.ctaText as string) || (config.ctaText as string) || 'Get Started',
        buttonUrl: (config.ctaUrl as string) || '#contact',
        backgroundImage: heroImage?.url || (config.backgroundImage as string) || '',
      });
      break;
    }

    case 'features': {
      const items = (content.items as Array<{ title: string; description: string }>) ||
        (config.items as Array<{ title: string; description: string }>) || [];
      blockNode = createFeaturesPattern({
        title: (content.heading as string) || (config.heading as string) || 'Features',
        features: items.map((item) => ({
          title: item.title,
          description: item.description,
          icon: '',
        })),
      });
      break;
    }

    case 'cta': {
      blockNode = createCtaPattern({
        heading: (content.heading as string) || (config.heading as string) || 'Ready to get started?',
        description: (content.description as string) || (config.description as string) || '',
        buttonText: (content.primaryText as string) || (config.primaryText as string) || 'Contact Us',
        buttonUrl: (config.primaryUrl as string) || '#contact',
        backgroundColor: (config.backgroundColor as string) || '#1a1a2e',
      });
      break;
    }

    case 'testimonials': {
      const testimonials = (content.testimonials as Array<{
        quote: string;
        author: string;
        role?: string;
      }>) || (config.testimonials as Array<{
        quote: string;
        author: string;
        role?: string;
      }>) || [];
      blockNode = createTestimonialsPattern({
        title: (content.heading as string) || (config.heading as string) || 'What Our Customers Say',
        testimonials: testimonials.map((t) => ({
          quote: t.quote,
          author: t.author,
          role: t.role || '',
        })),
      });
      break;
    }

    case 'footer': {
      const columns = (config.columns as Array<{
        title: string;
        links: Array<{ text: string; url: string }>;
      }>) || [];
      blockNode = createFooterPattern({
        columns: columns,
        copyright: `Copyright ${new Date().getFullYear()} ${(content.businessName as string) || 'Business Name'}. All rights reserved.`,
        socialLinks: (config.socialLinks as Array<{
          platform: string;
          url: string;
        }>) || [],
      });
      break;
    }

    default:
      // For unknown section types, return empty
      return '';
  }

  return blockNode ? serializeBlock(blockNode) : '';
}

// ============================================================================
// Generator Implementation
// ============================================================================

/**
 * Create a site generator
 */
export function createGenerator(deps: GeneratorDependencies): Generator {
  const { structureAgent, contentAgent, imageAgent, deployer } = deps;

  return {
    async *generate(input: GenerationInput): AsyncGenerator<GenerationEvent> {
      // Start event
      yield {
        type: 'start',
        message: `Starting site generation for ${input.businessName}...`,
      };

      // Step 1: Generate structure
      yield {
        type: 'progress',
        step: 'structure',
        message: 'Creating site structure...',
      };

      const structureResult = await structureAgent.generate({
        businessDescription: input.businessDescription,
        businessType: input.industry,
      });

      if (!structureResult.success) {
        yield {
          type: 'error',
          step: 'structure',
          message: `Failed to generate structure: ${structureResult.error}`,
        };
        return;
      }

      const structure = structureResult.structure;

      // Step 2: Generate content for each page
      yield {
        type: 'progress',
        step: 'content',
        message: 'Writing content...',
      };

      const contentByPage = new Map<string, PageContent>();

      for (const page of structure.pages) {
        const sectionTypes = page.sections.map((s) => s.type);
        const contentResult = await contentAgent.generate({
          businessDescription: input.businessDescription,
          pageSlug: page.slug,
          sectionTypes,
          tone: input.tone,
        });

        if (!contentResult.success) {
          yield {
            type: 'error',
            step: 'content',
            message: `Failed to generate content for ${page.slug}: ${contentResult.error}`,
          };
          return;
        }

        contentByPage.set(page.slug, contentResult.content);
      }

      // Step 3: Generate/select images
      yield {
        type: 'progress',
        step: 'images',
        message: 'Selecting images...',
      };

      const imagesBySection = new Map<string, Image>();

      for (const page of structure.pages) {
        for (const section of page.sections) {
          // Only get images for sections that need them
          if (['hero', 'gallery', 'testimonials'].includes(section.type.toLowerCase())) {
            try {
              const imageResult = await imageAgent.getImage({
                sectionType: section.type,
                imageType: section.type === 'hero' ? 'background' : 'feature',
                context: input.businessDescription,
              });

              if (imageResult.success) {
                imagesBySection.set(section.type.toLowerCase(), imageResult.image);
              }
            } catch {
              // Image failures are non-fatal, continue without image
            }
          }
        }
      }

      // Step 4: Generate blocks
      yield {
        type: 'progress',
        step: 'blocks',
        message: 'Building pages...',
      };

      const generatedPages: GeneratedPage[] = [];

      for (const page of structure.pages) {
        const pageContent = contentByPage.get(page.slug);
        const blockStrings: string[] = [];

        for (const section of page.sections) {
          // Find matching content section
          const sectionContent = pageContent?.sections.find(
            (s) => s.sectionType.toLowerCase() === section.type.toLowerCase()
          )?.content || {};

          const sectionBlocks = generateSectionBlocks(
            section.type,
            section.config || {},
            sectionContent,
            imagesBySection
          );

          if (sectionBlocks) {
            blockStrings.push(sectionBlocks);
          }
        }

        generatedPages.push({
          slug: page.slug,
          title: page.title || page.slug.charAt(0).toUpperCase() + page.slug.slice(1),
          blocks: blockStrings.join('\n\n'),
        });
      }

      // Step 5: Deploy or preview
      if (input.deploy) {
        yield {
          type: 'progress',
          step: 'deploy',
          message: 'Deploying to WordPress...',
        };

        const deployResult = await deployer.deploy({
          pages: generatedPages.map((p) => ({
            title: p.title,
            slug: p.slug,
            content: p.blocks,
            status: 'publish' as const,
          })),
          images: Array.from(imagesBySection.values()).map((img) => ({
            originalUrl: img.url,
            alt: img.alt,
          })),
          navigation: {
            items: (structure.navigation?.items || []).map((item) => ({
              title: item.label,
              url: item.url,
            })),
          },
        });

        yield {
          type: 'complete',
          result: deployResult,
        };
      } else {
        yield {
          type: 'preview',
          blocks: generatedPages,
        };
      }
    },
  };
}

/**
 * Site Generation API Route
 *
 * POST /api/generate
 *
 * Uses real AI agents to generate unique, contextual websites.
 * Streams generation progress events via Server-Sent Events (SSE).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import {
  createClaudeClient,
  createStructureAgent,
  createImageAgent,
  createUnsplashProvider,
  generateTheme,
  type SiteStructure,
  type Section,
  type VarietyThemeConfig,
} from '@ai-wp/agents';

import {
  serializeBlocks,
  createHeroPattern,
  createFeaturesPattern,
  createCtaPattern,
  createTestimonialsPattern,
  createFooterPattern,
} from '@ai-wp/block-engine';

// ============================================================================
// Schema
// ============================================================================

const GenerationInputSchema = z.object({
  businessName: z.string().min(1),
  businessDescription: z.string().min(30),
  industry: z.string().optional().default('other'),
  tone: z.enum(['professional', 'friendly', 'casual', 'formal', 'playful']).default('professional'),
  deploy: z.boolean().optional().default(false),
  colorPreferences: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
    })
    .optional(),
  designDirection: z
    .enum(['modern-corporate', 'bold-creative', 'elegant-minimal', 'tech-saas', 'organic-lifestyle'])
    .optional(),
  siteGoal: z
    .enum(['lead-generation', 'sell-products', 'portfolio', 'inform-educate', 'community'])
    .optional(),
  pageCount: z.number().min(1).max(5).optional(),
  tagline: z.string().optional(),
  services: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  uniqueSellingPoints: z.array(z.string()).optional(),
});

type GenerationInput = z.infer<typeof GenerationInputSchema>;

// ============================================================================
// Types
// ============================================================================

interface PreviewPage {
  slug: string;
  title: string;
  blocks: string;
}

interface GeneratedThemeCSS {
  cssVars: string;
  googleFontsUrl: string;
}

/**
 * Generate CSS custom properties from theme config
 */
function generateThemeCss(theme: VarietyThemeConfig): GeneratedThemeCSS {
  const { colors, typography, style } = theme;

  // Generate border radius value
  const borderRadiusMap: Record<string, string> = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  };

  // Generate shadow value
  const shadowMap: Record<string, string> = {
    none: 'none',
    subtle: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    dramatic: '0 10px 15px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1)',
  };

  const cssVars = `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-text: ${colors.text};
      --color-text-muted: ${colors.textMuted};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --font-heading: '${typography.headingFont}', serif;
      --font-body: '${typography.bodyFont}', sans-serif;
      --font-heading-weight: ${typography.headingWeight};
      --font-body-weight: ${typography.bodyWeight};
      --border-radius: ${borderRadiusMap[style.borderRadius] || '0.5rem'};
      --shadow: ${shadowMap[style.shadowStyle] || 'none'};
    }

    body {
      font-family: var(--font-body);
      font-weight: var(--font-body-weight);
      color: var(--color-text);
      background-color: var(--color-background);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: var(--font-heading-weight);
      color: var(--color-text);
    }

    /* Button styles */
    .wp-block-button__link,
    a.wp-block-button__link,
    .btn-primary {
      background-color: var(--color-primary) !important;
      color: white !important;
      border-radius: var(--border-radius) !important;
      padding: 0.75rem 1.5rem !important;
      font-family: var(--font-body);
      font-weight: 600;
      text-decoration: none !important;
      display: inline-block;
      border: none;
      transition: all 0.2s;
    }

    .wp-block-button__link:hover,
    a.wp-block-button__link:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .is-style-outline .wp-block-button__link,
    .btn-secondary {
      background-color: transparent !important;
      color: var(--color-primary) !important;
      border: 2px solid var(--color-primary) !important;
    }

    /* Card styling */
    .wp-block-column,
    .feature-card {
      background-color: var(--color-surface);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
    }

    /* Section backgrounds */
    .wp-block-group.has-background,
    .section-surface {
      background-color: var(--color-surface) !important;
    }

    /* Text muted */
    .has-text-muted-color,
    .text-muted {
      color: var(--color-text-muted) !important;
    }

    /* Links */
    a {
      color: var(--color-primary);
    }

    a:hover {
      color: var(--color-secondary);
    }

    /* Hero overlay for text readability */
    .wp-block-cover::before {
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.4) 0%,
        rgba(0,0,0,0.6) 100%
      ) !important;
    }

    .wp-block-cover h1,
    .wp-block-cover h2,
    .wp-block-cover p {
      color: white !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    /* Quote styling */
    .wp-block-quote {
      border-left-color: var(--color-primary);
      font-style: italic;
    }

    /* CTA sections */
    .cta-section {
      background-color: var(--color-primary);
      color: white;
    }

    .cta-section h2,
    .cta-section p {
      color: white;
    }

    /* Animation Keyframes */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Animation Classes */
    .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
    .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
    .animate-fadeInDown { animation: fadeInDown 0.6s ease-out both; }
    .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out both; }
    .animate-fadeInRight { animation: fadeInRight 0.6s ease-out both; }
    .animate-scaleIn { animation: scaleIn 0.6s ease-out both; }

    /* Animation Delays for Staggered Effects */
    .animate-delay-100 { animation-delay: 0.1s; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-300 { animation-delay: 0.3s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-500 { animation-delay: 0.5s; }

    /* Hover Effects */
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }

    .hover-glow { transition: box-shadow 0.3s ease; }
    .hover-glow:hover { box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 59,130,246), 0.4); }

    .hover-scale { transition: transform 0.3s ease; }
    .hover-scale:hover { transform: scale(1.05); }
  `;

  // Generate Google Fonts URL
  const fonts = [typography.headingFont, typography.bodyFont]
    .filter((f, i, arr) => arr.indexOf(f) === i) // dedupe
    .map(f => f.replace(/\s+/g, '+'))
    .join('&family=');

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fonts}:wght@400;500;600;700&display=swap`;

  return { cssVars, googleFontsUrl };
}

// ============================================================================
// Helper Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert a section from the Structure Agent into block markup
 */
function sectionToBlocks(section: Section, heroImageUrl?: string): string {
  const config = section.config as Record<string, unknown>;

  switch (section.type) {
    case 'hero': {
      const heroConfig = {
        layout: config.layout as 'centered' | 'split-left' | 'split-right' | 'minimal' | 'fullscreen' | undefined,
        heading: (config.heading as string) || 'Welcome',
        subheading: (config.subheading as string) || '',
        buttonText: config.buttonText as string | undefined,
        buttonUrl: config.buttonUrl as string | undefined,
        secondaryButtonText: config.secondaryButtonText as string | undefined,
        secondaryButtonUrl: config.secondaryButtonUrl as string | undefined,
        backgroundImage: heroImageUrl || (config.backgroundImage as string | undefined),
        backgroundOverlay: 50,
        alignment: config.alignment as 'left' | 'center' | 'right' | undefined,
      };
      const block = createHeroPattern(heroConfig);
      return serializeBlocks([block]);
    }

    case 'features': {
      const featuresConfig = {
        layout: config.layout as 'grid-3' | 'grid-4' | 'grid-2' | 'cards' | 'alternating' | 'icon-left' | undefined,
        title: (config.title as string) || 'Our Features',
        subtitle: config.subtitle as string | undefined,
        features: ((config.features as unknown[]) || []).map((f: unknown) => {
          const feature = f as Record<string, unknown>;
          return {
            title: (feature.title as string) || '',
            description: (feature.description as string) || '',
            icon: feature.icon as string | undefined,
          };
        }),
      };
      const block = createFeaturesPattern(featuresConfig);
      return serializeBlocks([block]);
    }

    case 'cta': {
      const ctaConfig = {
        layout: config.layout as 'centered' | 'split' | 'banner' | 'card' | undefined,
        heading: (config.heading as string) || 'Get Started',
        description: (config.description as string) || '',
        buttonText: (config.buttonText as string) || 'Contact Us',
        buttonUrl: (config.buttonUrl as string) || '#contact',
        secondaryButtonText: config.secondaryButtonText as string | undefined,
        secondaryButtonUrl: config.secondaryButtonUrl as string | undefined,
        backgroundColor: config.backgroundColor as string | undefined,
        backgroundImage: config.backgroundImage as string | undefined,
      };
      const block = createCtaPattern(ctaConfig);
      return serializeBlocks([block]);
    }

    case 'testimonials': {
      const testimonialsConfig = {
        layout: config.layout as 'cards' | 'single-large' | 'quote-wall' | 'centered' | undefined,
        title: (config.title as string) || 'What Our Customers Say',
        subtitle: config.subtitle as string | undefined,
        testimonials: ((config.testimonials as unknown[]) || []).map((t: unknown) => {
          const testimonial = t as Record<string, unknown>;
          return {
            quote: (testimonial.quote as string) || '',
            author: (testimonial.author as string) || 'Anonymous',
            role: testimonial.role as string | undefined,
            image: testimonial.image as string | undefined,
          };
        }),
      };
      const block = createTestimonialsPattern(testimonialsConfig);
      return serializeBlocks([block]);
    }

    case 'footer': {
      const footerConfig = {
        layout: config.layout as 'columns' | 'minimal' | 'centered' | 'mega' | undefined,
        columns: ((config.columns as unknown[]) || []).map((c: unknown) => {
          const column = c as Record<string, unknown>;
          return {
            title: (column.title as string) || '',
            links: ((column.links as unknown[]) || []).map((l: unknown) => {
              const link = l as Record<string, unknown>;
              return {
                text: (link.text as string) || '',
                url: (link.url as string) || '#',
              };
            }),
          };
        }),
        copyright: (config.copyright as string) || '© 2024 All rights reserved.',
        socialLinks: ((config.socialLinks as unknown[]) || []).map((s: unknown) => {
          const social = s as Record<string, unknown>;
          return {
            platform: (social.platform as string) || '',
            url: (social.url as string) || '#',
          };
        }),
        showNewsletter: config.showNewsletter as boolean | undefined,
      };
      const block = createFooterPattern(footerConfig);
      return serializeBlocks([block]);
    }

    case 'contact': {
      // Create a simple contact section using basic blocks
      const title = (config.title as string) || 'Contact Us';
      const description = (config.description as string) || '';
      const email = config.email as string | undefined;
      const phone = config.phone as string | undefined;
      const address = config.address as string | undefined;

      let contactInfo = '';
      if (email) contactInfo += `<p>📧 ${email}</p>`;
      if (phone) contactInfo += `<p>📞 ${phone}</p>`;
      if (address) contactInfo += `<p>📍 ${address}</p>`;

      return `
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading {"textAlign":"center"} -->
  <h2 class="wp-block-heading has-text-align-center">${title}</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph {"align":"center"} -->
  <p class="has-text-align-center">${description}</p>
  <!-- /wp:paragraph -->
  ${contactInfo}
</div>
<!-- /wp:group -->
`;
    }

    case 'gallery': {
      const title = (config.title as string) || '';
      const images = (config.images as unknown[]) || [];

      const galleryItems = images.map((img: unknown) => {
        const image = img as Record<string, unknown>;
        return `
<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${image.url || 'https://placehold.co/400x300'}" alt="${image.alt || ''}"/></figure>
<!-- /wp:image -->
`;
      }).join('\n');

      return `
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  ${title ? `<!-- wp:heading {"textAlign":"center"} --><h2 class="wp-block-heading has-text-align-center">${title}</h2><!-- /wp:heading -->` : ''}
  <!-- wp:gallery {"columns":${(config.columns as number) || 3}} -->
  <figure class="wp-block-gallery has-nested-images columns-${(config.columns as number) || 3}">
    ${galleryItems}
  </figure>
  <!-- /wp:gallery -->
</div>
<!-- /wp:group -->
`;
    }

    default:
      return '';
  }
}

/**
 * Generate site using real AI agents
 */
async function* generateWithAgents(input: GenerationInput) {
  yield { type: 'start', message: `Starting AI generation for ${input.businessName}...` };

  // Initialize clients
  const claudeClient = createClaudeClient({ maxTokens: 8192 }); // Increased for complex sites
  const structureAgent = createStructureAgent(claudeClient);

  // Initialize image agent if Unsplash key is available
  let imageAgent: ReturnType<typeof createImageAgent> | null = null;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    const unsplashProvider = createUnsplashProvider({ accessKey: unsplashKey });
    imageAgent = createImageAgent({
      claudeClient,
      unsplashProvider,
    });
  }

  // Step 1: Generate site structure
  yield { type: 'progress', step: 'structure', message: 'Creating site structure with AI...' };

  // Build enhanced business description with optional fields
  let enhancedDescription = `${input.businessName}: ${input.businessDescription}`;
  
  if (input.tagline) {
    enhancedDescription += `. Tagline: ${input.tagline}`;
  }
  
  if (input.services && input.services.length > 0) {
    enhancedDescription += `. Services: ${input.services.join(', ')}`;
  }
  
  if (input.targetAudience) {
    enhancedDescription += `. Target audience: ${input.targetAudience}`;
  }
  
  if (input.uniqueSellingPoints && input.uniqueSellingPoints.length > 0) {
    enhancedDescription += `. Unique selling points: ${input.uniqueSellingPoints.join(', ')}`;
  }

  const structureResult = await structureAgent.generate({
    businessDescription: enhancedDescription,
    businessType: input.industry,
    siteGoal: input.siteGoal,
    maxTokens: 8192, // Allow more tokens for complete output
  });

  if (!structureResult.success) {
    yield { type: 'error', step: 'structure', message: `Structure generation failed: ${structureResult.error}` };
    return;
  }

  const structure = structureResult.structure;
  yield { type: 'progress', step: 'structure', message: `Generated ${structure.pages.length} pages` };

  // Step 1.5: Generate theme using Variety Engine
  yield { type: 'progress', step: 'structure', message: 'Creating visual theme...' };

  const varietyTheme = generateTheme({
    businessDescription: input.businessDescription,
    businessName: input.businessName,
    seed: Date.now(), // Use timestamp for variety
    colorPreferences: input.colorPreferences,
    designDirection: input.designDirection,
  });

  const themeCss = generateThemeCss(varietyTheme);

  yield {
    type: 'progress',
    step: 'structure',
    message: `Theme: ${varietyTheme.industry} style with ${varietyTheme.typography.headingFont} headings`,
  };

  // Step 2: Generate images for hero sections
  yield { type: 'progress', step: 'images', message: 'Selecting contextual images...' };

  const heroImages: Map<string, string> = new Map();

  if (imageAgent) {
    for (const page of structure.pages) {
      const heroSection = page.sections.find(s => s.type === 'hero');
      if (heroSection) {
        try {
          const imageResult = await imageAgent.getImage({
            sectionType: 'hero',
            imageType: 'background',
            context: `${input.businessName}: ${input.businessDescription}`,
          });

          if (imageResult.success) {
            heroImages.set(page.slug, imageResult.image.url);
          }
        } catch {
          // Continue without image on failure
        }
      }
    }
  }

  yield { type: 'progress', step: 'images', message: `Selected ${heroImages.size} hero images` };

  // Step 3: Convert structure to blocks
  yield { type: 'progress', step: 'blocks', message: 'Building WordPress blocks...' };

  const previewPages: PreviewPage[] = [];

  for (const page of structure.pages) {
    const heroImage = heroImages.get(page.slug);
    const blocks: string[] = [];

    for (const section of page.sections) {
      const blockMarkup = sectionToBlocks(section, section.type === 'hero' ? heroImage : undefined);
      if (blockMarkup) {
        blocks.push(blockMarkup);
      }
    }

    previewPages.push({
      slug: page.slug,
      title: page.title,
      blocks: blocks.join('\n\n'),
    });
  }

  yield { type: 'progress', step: 'blocks', message: `Built ${previewPages.length} pages` };

  // Step 4: Handle deployment if requested
  if (input.deploy) {
    yield { type: 'progress', step: 'deploy', message: 'Preparing deployment...' };
    await sleep(1000);

    yield {
      type: 'complete',
      result: {
        success: true,
        pages: previewPages,
        theme: structure.theme,
        navigation: structure.navigation,
        varietyTheme: {
          config: varietyTheme,
          css: themeCss.cssVars,
          fontsUrl: themeCss.googleFontsUrl,
        },
      },
    };
  } else {
    yield {
      type: 'preview',
      blocks: previewPages,
      theme: structure.theme,
      navigation: structure.navigation,
      varietyTheme: {
        config: varietyTheme,
        css: themeCss.cssVars,
        fontsUrl: themeCss.googleFontsUrl,
      },
    };
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = GenerationInputSchema.parse(body);

    // Create SSE response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of generateWithAgents(input)) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          const errorEvent = {
            type: 'error',
            step: 'structure',
            message: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

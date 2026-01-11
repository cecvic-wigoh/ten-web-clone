/**
 * Site Generation API Route
 *
 * POST /api/generate
 *
 * Streams generation progress events via Server-Sent Events (SSE).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

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
});

// ============================================================================
// Mock Generator (for development)
// ============================================================================

/**
 * In production, this would use the actual agents and deployer.
 * For now, we simulate the generation process.
 */
async function* mockGenerate(input: z.infer<typeof GenerationInputSchema>) {
  yield { type: 'start', message: `Starting site generation for ${input.businessName}...` };

  await sleep(1000);

  // Step 1: Structure
  yield { type: 'progress', step: 'structure', message: 'Creating site structure...' };
  await sleep(1500);

  // Step 2: Content
  yield { type: 'progress', step: 'content', message: 'Writing content...' };
  await sleep(2000);

  // Step 3: Images
  yield { type: 'progress', step: 'images', message: 'Selecting images...' };
  await sleep(1500);

  // Step 4: Blocks
  yield { type: 'progress', step: 'blocks', message: 'Building pages...' };
  await sleep(1000);

  // Generate mock blocks
  const mockBlocks = generateMockBlocks(input);

  if (input.deploy) {
    yield { type: 'progress', step: 'deploy', message: 'Deploying to WordPress...' };
    await sleep(2000);

    yield {
      type: 'complete',
      result: {
        success: true,
        deploymentId: `deploy-${Date.now()}`,
        pages: [{ slug: 'home', url: 'https://example.com/', id: 1 }],
        media: [],
      },
    };
  } else {
    yield { type: 'preview', blocks: mockBlocks };
  }
}

function generateMockBlocks(input: z.infer<typeof GenerationInputSchema>) {
  const heroContent = `
<!-- wp:cover {"url":"https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920","dimRatio":50,"minHeight":500,"align":"full"} -->
<div class="wp-block-cover alignfull" style="min-height:500px">
  <span aria-hidden="true" class="wp-block-cover__background has-background-dim-50 has-background-dim"></span>
  <img class="wp-block-cover__image-background" alt="" src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920" data-object-fit="cover"/>
  <div class="wp-block-cover__inner-container">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Welcome to ${input.businessName}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">${input.businessDescription.substring(0, 150)}...</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
      <!-- wp:button -->
      <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#contact">Get Started</a></div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
  </div>
</div>
<!-- /wp:cover -->
`;

  const featuresContent = `
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading {"textAlign":"center"} -->
  <h2 class="wp-block-heading has-text-align-center">Why Choose Us</h2>
  <!-- /wp:heading -->
  <!-- wp:columns -->
  <div class="wp-block-columns">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":3} -->
      <h3 class="wp-block-heading">Quality Service</h3>
      <!-- /wp:heading -->
      <!-- wp:paragraph -->
      <p>We deliver exceptional quality in everything we do.</p>
      <!-- /wp:paragraph -->
    </div>
    <!-- /wp:column -->
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":3} -->
      <h3 class="wp-block-heading">Expert Team</h3>
      <!-- /wp:heading -->
      <!-- wp:paragraph -->
      <p>Our team of experts is dedicated to your success.</p>
      <!-- /wp:paragraph -->
    </div>
    <!-- /wp:column -->
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":3} -->
      <h3 class="wp-block-heading">Fast Delivery</h3>
      <!-- /wp:heading -->
      <!-- wp:paragraph -->
      <p>Quick turnaround times without compromising quality.</p>
      <!-- /wp:paragraph -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
`;

  const ctaContent = `
<!-- wp:group {"backgroundColor":"primary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-primary-background-color has-background">
  <!-- wp:heading {"textAlign":"center"} -->
  <h2 class="wp-block-heading has-text-align-center">Ready to Get Started?</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph {"align":"center"} -->
  <p class="has-text-align-center">Contact us today to discuss your project.</p>
  <!-- /wp:paragraph -->
  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
  <div class="wp-block-buttons">
    <!-- wp:button {"backgroundColor":"white","textColor":"primary"} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-white-background-color has-text-color has-background wp-element-button" href="#contact">Contact Us</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
`;

  return [
    {
      slug: 'home',
      title: 'Home',
      blocks: heroContent + '\n\n' + featuresContent + '\n\n' + ctaContent,
    },
    {
      slug: 'about',
      title: 'About',
      blocks: `
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">About ${input.businessName}</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>${input.businessDescription}</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`,
    },
    {
      slug: 'contact',
      title: 'Contact',
      blocks: `
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">Contact Us</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Get in touch with our team today.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`,
    },
  ];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
          for await (const event of mockGenerate(input)) {
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

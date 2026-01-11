/**
 * WordPress Deployment API Route
 *
 * POST /api/deploy
 *
 * Deploys generated pages to WordPress.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// Schema
// ============================================================================

const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  blocks: z.string(),
});

const VarietyThemeSchema = z.object({
  config: z.object({
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      text: z.string(),
      textMuted: z.string(),
      background: z.string(),
      surface: z.string(),
    }).optional(),
    typography: z.object({
      headingFont: z.string(),
      bodyFont: z.string(),
      headingWeight: z.string(),
      bodyWeight: z.string(),
    }).optional(),
    style: z.object({
      borderRadius: z.string(),
      shadowStyle: z.string(),
      buttonStyle: z.string(),
    }).optional(),
    industry: z.string().optional(),
  }).optional(),
  css: z.string().optional(),
  fontsUrl: z.string().optional(),
}).optional();

const DeployInputSchema = z.object({
  pages: z.array(PageSchema),
  businessName: z.string(),
  varietyTheme: VarietyThemeSchema,
});

// ============================================================================
// WordPress Client
// ============================================================================

interface WordPressConfig {
  baseUrl: string;
  username: string;
  appPassword: string;
  useQueryRoutes: boolean;
}

function getWordPressConfig(): WordPressConfig {
  const baseUrl = process.env.WP_URL;
  const username = process.env.WP_USERNAME;
  const appPassword = process.env.WP_APP_PASSWORD;
  const useQueryRoutes = process.env.WP_USE_QUERY_ROUTES === 'true';

  if (!baseUrl || !username || !appPassword) {
    throw new Error('WordPress configuration missing. Set WP_URL, WP_USERNAME, and WP_APP_PASSWORD environment variables.');
  }

  return { baseUrl, username, appPassword, useQueryRoutes };
}

async function wpRequest(
  config: WordPressConfig,
  method: string,
  endpoint: string,
  data?: unknown
): Promise<unknown> {
  const { baseUrl, username, appPassword, useQueryRoutes } = config;

  // Build URL based on whether we use query routes or pretty permalinks
  let url: string;
  if (useQueryRoutes) {
    // Parse endpoint to separate path from query string
    const [path, queryString] = endpoint.split('?');
    url = `${baseUrl}/?rest_route=/wp/v2${path}`;
    if (queryString) {
      url += `&${queryString}`;
    }
  } else {
    url = `${baseUrl}/wp-json/wp/v2${endpoint}`;
  }

  const headers: Record<string, string> = {
    'Authorization': `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`,
    'Accept': 'application/json',
  };

  const options: RequestInit = { method, headers };

  if (data && (method === 'POST' || method === 'PUT')) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `WordPress API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Theme CSS Injection via Inline Styles
// ============================================================================

/**
 * Transform block content to include inline styles based on theme
 * WordPress REST API strips wp:html blocks with <style> tags,
 * so we inject styles directly into block attributes
 */
function injectThemeStyles(
  content: string,
  varietyTheme?: z.infer<typeof VarietyThemeSchema>
): string {
  if (!varietyTheme?.config?.colors) {
    return content;
  }

  const colors = varietyTheme.config.colors;
  let styledContent = content;

  // Add background color to button links (primary buttons)
  // Match: wp-block-button__link without is-style-outline
  styledContent = styledContent.replace(
    /(<a[^>]*class="wp-block-button__link[^"]*"[^>]*)>/g,
    (match, prefix) => {
      // Check if it's an outline button
      if (match.includes('is-style-outline')) {
        // Outline button - use border and text color
        return `${prefix} style="border: 2px solid ${colors.primary}; color: ${colors.primary}; background: transparent; padding: 12px 28px; border-radius: 6px; font-weight: 600;">`;
      }
      // Primary button - use background color
      return `${prefix} style="background-color: ${colors.primary}; color: white; padding: 12px 28px; border-radius: 6px; font-weight: 600;">`;
    }
  );

  // Style the columns container for responsive grid layout
  styledContent = styledContent.replace(
    /(<div[^>]*class="wp-block-columns[^"]*"[^>]*)>/g,
    `$1 style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin: 40px auto; max-width: 1200px;">`
  );

  // Add surface background to individual columns (feature cards)
  styledContent = styledContent.replace(
    /(<div[^>]*class="wp-block-column[^"]*"[^>]*)>/g,
    `$1 style="background-color: ${colors.surface}; padding: 30px; border-radius: 8px; text-align: center;">`
  );

  // Style section headings with text color
  styledContent = styledContent.replace(
    /(<h2[^>]*class="[^"]*wp-block-heading[^"]*"[^>]*)>/g,
    `$1 style="color: ${colors.text};">`
  );

  // Add accent color to links in footers/lists
  styledContent = styledContent.replace(
    /(<a[^>]*href="[^"]*"[^>]*)>([^<]*)<\/a>/g,
    (match, prefix, text) => {
      // Skip button links (already styled)
      if (prefix.includes('wp-block-button__link')) {
        return match;
      }
      return `${prefix} style="color: ${colors.primary};">${text}</a>`;
    }
  );

  return styledContent;
}

// ============================================================================
// Deploy Logic
// ============================================================================

interface DeployResult {
  success: boolean;
  siteUrl: string;
  pages: { slug: string; url: string; id: number }[];
  errors?: string[];
}

async function deployToWordPress(
  config: WordPressConfig,
  pages: z.infer<typeof PageSchema>[],
  varietyTheme?: z.infer<typeof VarietyThemeSchema>
): Promise<DeployResult> {
  const deployedPages: { slug: string; url: string; id: number }[] = [];
  const errors: string[] = [];

  for (const page of pages) {
    try {
      // Inject inline styles into block content
      const styledContent = injectThemeStyles(page.blocks, varietyTheme);

      // Check if page already exists
      const existingPages = await wpRequest(config, 'GET', `/pages?slug=${page.slug}`) as { id: number; link: string }[];

      let pageResult: { id: number; link: string };

      // Page data - use styled content with inline styles
      const pageData = {
        title: page.title,
        content: styledContent,
        status: 'publish',
      };

      if (existingPages.length > 0) {
        // Update existing page
        pageResult = await wpRequest(config, 'PUT', `/pages/${existingPages[0].id}`, pageData) as { id: number; link: string };
      } else {
        // Create new page
        pageResult = await wpRequest(config, 'POST', '/pages', {
          ...pageData,
          slug: page.slug,
        }) as { id: number; link: string };
      }

      deployedPages.push({
        slug: page.slug,
        url: pageResult.link,
        id: pageResult.id,
      });
    } catch (error) {
      errors.push(`Failed to deploy ${page.slug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Find home page URL
  const homePage = deployedPages.find(p => p.slug === 'home');
  const siteUrl = homePage?.url || config.baseUrl;

  return {
    success: errors.length === 0,
    siteUrl,
    pages: deployedPages,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse input
    const body = await request.json();
    const input = DeployInputSchema.parse(body);

    // Get WordPress config
    const config = getWordPressConfig();

    // Deploy pages with theme CSS
    const result = await deployToWordPress(config, input.pages, input.varietyTheme);

    if (!result.success && result.errors) {
      return NextResponse.json(
        { error: 'Partial deployment failure', details: result.errors, ...result },
        { status: 207 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Deploy error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deployment failed' },
      { status: 500 }
    );
  }
}

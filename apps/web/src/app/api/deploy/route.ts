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

const DeployInputSchema = z.object({
  pages: z.array(PageSchema),
  businessName: z.string(),
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
  pages: z.infer<typeof PageSchema>[]
): Promise<DeployResult> {
  const deployedPages: { slug: string; url: string; id: number }[] = [];
  const errors: string[] = [];

  for (const page of pages) {
    try {
      // Check if page already exists
      const existingPages = await wpRequest(config, 'GET', `/pages?slug=${page.slug}`) as { id: number; link: string }[];

      let pageResult: { id: number; link: string };

      if (existingPages.length > 0) {
        // Update existing page
        pageResult = await wpRequest(config, 'PUT', `/pages/${existingPages[0].id}`, {
          title: page.title,
          content: page.blocks,
          status: 'publish',
        }) as { id: number; link: string };
      } else {
        // Create new page
        pageResult = await wpRequest(config, 'POST', '/pages', {
          title: page.title,
          slug: page.slug,
          content: page.blocks,
          status: 'publish',
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

    // Deploy pages
    const result = await deployToWordPress(config, input.pages);

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

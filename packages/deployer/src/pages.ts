/**
 * WordPress Page Manager
 *
 * Create, update, and manage WordPress pages with block content.
 */

import { type WordPressClient } from './client';
import { parseWPPage, type WPPage } from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Page result (simplified)
 */
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  url: string;
  status: string;
  parent?: number;
}

/**
 * Input for creating a page
 */
export interface PageInput {
  title: string;
  slug: string;
  content: string;
  status?: 'publish' | 'draft';
  meta?: Record<string, unknown>;
  parent?: number;
}

/**
 * Options for querying pages
 */
export interface PageQueryOptions {
  status?: string;
}

/**
 * Options for deleting pages
 */
export interface DeleteOptions {
  force?: boolean;
}

/**
 * Page manager interface
 */
export interface PageManager {
  /**
   * Create a new page
   */
  create(page: PageInput): Promise<Page>;

  /**
   * Update an existing page
   */
  update(id: number, page: Partial<PageInput>): Promise<Page>;

  /**
   * Delete a page
   */
  delete(id: number, options?: DeleteOptions): Promise<void>;

  /**
   * Get page by slug
   */
  getBySlug(slug: string, options?: PageQueryOptions): Promise<Page | null>;

  /**
   * Get page by ID
   */
  getById(id: number): Promise<Page | null>;

  /**
   * List all pages
   */
  listAll(): Promise<Page[]>;

  /**
   * Create or update a page (upsert by slug)
   */
  createOrUpdate(page: PageInput): Promise<Page>;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a WordPress page manager
 */
export function createPageManager(client: WordPressClient): PageManager {
  /**
   * Transform WordPress page response to simplified Page
   */
  function transformPage(wpPage: WPPage): Page {
    return {
      id: wpPage.id,
      slug: wpPage.slug,
      title: wpPage.title.rendered,
      content: wpPage.content.rendered,
      url: wpPage.link,
      status: wpPage.status,
      parent: wpPage.parent,
    };
  }

  /**
   * Build request body for page creation/update
   */
  function buildRequestBody(page: Partial<PageInput>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (page.title !== undefined) body.title = page.title;
    if (page.slug !== undefined) body.slug = page.slug;
    if (page.content !== undefined) body.content = page.content;
    if (page.status !== undefined) body.status = page.status;
    if (page.meta !== undefined) body.meta = page.meta;
    if (page.parent !== undefined) body.parent = page.parent;

    return body;
  }

  return {
    async create(page: PageInput): Promise<Page> {
      const body = buildRequestBody({
        ...page,
        status: page.status || 'draft',
      });

      const result = await client.post<WPPage>('/wp/v2/pages', body);
      return transformPage(result);
    },

    async update(id: number, page: Partial<PageInput>): Promise<Page> {
      const body = buildRequestBody(page);
      const result = await client.put<WPPage>(`/wp/v2/pages/${id}`, body);
      return transformPage(result);
    },

    async delete(id: number, options: DeleteOptions = { force: true }): Promise<void> {
      await client.delete(`/wp/v2/pages/${id}`, { force: options.force });
    },

    async getBySlug(
      slug: string,
      options: PageQueryOptions = {}
    ): Promise<Page | null> {
      const params: Record<string, string> = { slug };
      if (options.status) {
        params.status = options.status;
      }

      const results = await client.get<WPPage[]>('/wp/v2/pages', params);

      if (results.length === 0) {
        return null;
      }

      return transformPage(results[0]);
    },

    async getById(id: number): Promise<Page | null> {
      try {
        const result = await client.get<WPPage>(`/wp/v2/pages/${id}`);
        return transformPage(result);
      } catch {
        return null;
      }
    },

    async listAll(): Promise<Page[]> {
      const results = await client.get<WPPage[]>('/wp/v2/pages', {
        per_page: 100,
        status: 'any',
      });

      return results.map(transformPage);
    },

    async createOrUpdate(page: PageInput): Promise<Page> {
      // Try to find existing page by slug
      const existing = await this.getBySlug(page.slug);

      if (existing) {
        // Update existing page
        return this.update(existing.id, {
          title: page.title,
          content: page.content,
          status: page.status,
          meta: page.meta,
          parent: page.parent,
        });
      }

      // Create new page
      return this.create(page);
    },
  };
}

/**
 * WordPress REST API Client
 *
 * Provides authenticated access to WordPress REST API with retry logic
 * and proper error handling.
 */

import { isWPError, parseWPError } from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for WordPress client
 */
export interface WordPressClientConfig {
  /** WordPress site base URL (e.g., https://example.com) */
  baseUrl: string;
  /** WordPress username */
  username: string;
  /** Application password (with spaces) */
  appPassword: string;
  /** Number of retry attempts for 5xx errors (default: 0) */
  retryAttempts?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelayMs?: number;
  /** Request timeout in ms (default: 30000) */
  timeoutMs?: number;
  /** Use query string REST routes (?rest_route=) instead of /wp-json/ (default: false) */
  useQueryStringRoutes?: boolean;
}

/**
 * Query parameters for GET requests
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * WordPress REST API client interface
 */
export interface WordPressClient {
  /**
   * Make a GET request
   */
  get<T>(endpoint: string, params?: QueryParams): Promise<T>;

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: unknown): Promise<T>;

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: unknown): Promise<T>;

  /**
   * Make a DELETE request
   */
  delete(endpoint: string, params?: QueryParams): Promise<void>;
}

// ============================================================================
// Error Class
// ============================================================================

/**
 * WordPress client error with additional context
 */
export class WordPressClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = 'WordPressClientError';
  }
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a WordPress REST API client
 */
export function createWordPressClient(
  config: WordPressClientConfig
): WordPressClient {
  // Validate configuration
  if (!config.baseUrl) {
    throw new Error('baseUrl is required');
  }
  if (!config.username) {
    throw new Error('username is required');
  }
  if (!config.appPassword) {
    throw new Error('appPassword is required');
  }

  const {
    baseUrl,
    username,
    appPassword,
    retryAttempts = 0,
    retryDelayMs = 1000,
    timeoutMs = 30000,
    useQueryStringRoutes = false,
  } = config;

  // Normalize base URL (remove trailing slash)
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  // Create Basic auth header
  const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`;

  /**
   * Build full URL with query parameters
   */
  function buildUrl(endpoint: string, params?: QueryParams): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const searchParams = new URLSearchParams();

    // Add query params if provided
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
    }

    let url: string;
    if (useQueryStringRoutes) {
      // Use ?rest_route= format (for sites without pretty permalinks)
      searchParams.set('rest_route', `/wp/v2${normalizedEndpoint}`);
      const queryString = searchParams.toString();
      url = `${normalizedBaseUrl}/?${queryString}`;
    } else {
      // Use /wp-json/ format (default, requires pretty permalinks)
      url = `${normalizedBaseUrl}/wp-json${normalizedEndpoint}`;
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Delay helper for retries
   */
  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  async function request<T>(
    method: string,
    endpoint: string,
    options: {
      params?: QueryParams;
      data?: unknown;
    } = {}
  ): Promise<T> {
    const url = buildUrl(endpoint, options.params);
    const headers: Record<string, string> = {
      Authorization: authHeader,
      Accept: 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT
    if (options.data !== undefined && (method === 'POST' || method === 'PUT')) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.data);
    }

    let lastError: Error | null = null;
    const maxAttempts = retryAttempts + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        if (response.ok) {
          const json = await response.json();
          return json as T;
        }

        // Parse error response
        const errorBody = await response.json().catch(() => ({
          code: 'unknown_error',
          message: `HTTP ${response.status}`,
        })) as { code?: string; message?: string };

        // Don't retry on 4xx errors
        if (response.status >= 400 && response.status < 500) {
          const errorResult = isWPError(errorBody) ? parseWPError(errorBody) : null;
          throw new WordPressClientError(
            errorResult?.message || errorBody.message || `HTTP ${response.status}`,
            errorResult?.code || errorBody.code || 'http_error',
            response.status,
            endpoint
          );
        }

        // For 5xx errors, retry if attempts remaining
        lastError = new WordPressClientError(
          errorBody.message || `HTTP ${response.status}`,
          errorBody.code || 'server_error',
          response.status,
          endpoint
        );

        if (attempt < maxAttempts - 1) {
          // Exponential backoff
          await delay(retryDelayMs * Math.pow(2, attempt));
        }
      } catch (error) {
        if (error instanceof WordPressClientError) {
          throw error;
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxAttempts - 1) {
          await delay(retryDelayMs * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Unknown error');
  }

  return {
    async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
      return request<T>('GET', endpoint, { params });
    },

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
      return request<T>('POST', endpoint, { data });
    },

    async put<T>(endpoint: string, data?: unknown): Promise<T> {
      return request<T>('PUT', endpoint, { data });
    },

    async delete(endpoint: string, params?: QueryParams): Promise<void> {
      await request<unknown>('DELETE', endpoint, { params });
    },
  };
}

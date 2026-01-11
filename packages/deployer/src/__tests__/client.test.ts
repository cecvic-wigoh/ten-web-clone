/**
 * Tests for WordPress REST API Client
 *
 * TDD: These tests define the expected behavior of the WordPress client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createWordPressClient,
  WordPressClientError,
  type WordPressClient,
  type WordPressClientConfig,
} from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('WordPress Client', () => {
  let client: WordPressClient;
  const config: WordPressClientConfig = {
    baseUrl: 'https://example.com',
    username: 'admin',
    appPassword: 'xxxx xxxx xxxx xxxx',
  };

  beforeEach(() => {
    mockFetch.mockReset();
    client = createWordPressClient(config);
  });

  describe('createWordPressClient', () => {
    it('should create a client with valid configuration', () => {
      expect(client).toBeDefined();
      expect(client.get).toBeInstanceOf(Function);
      expect(client.post).toBeInstanceOf(Function);
      expect(client.put).toBeInstanceOf(Function);
      expect(client.delete).toBeInstanceOf(Function);
    });

    it('should throw if baseUrl is missing', () => {
      expect(() =>
        createWordPressClient({
          baseUrl: '',
          username: 'admin',
          appPassword: 'xxxx',
        })
      ).toThrow('baseUrl is required');
    });

    it('should throw if username is missing', () => {
      expect(() =>
        createWordPressClient({
          baseUrl: 'https://example.com',
          username: '',
          appPassword: 'xxxx',
        })
      ).toThrow('username is required');
    });

    it('should throw if appPassword is missing', () => {
      expect(() =>
        createWordPressClient({
          baseUrl: 'https://example.com',
          username: 'admin',
          appPassword: '',
        })
      ).toThrow('appPassword is required');
    });
  });

  describe('get', () => {
    it('should make GET request with auth header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Test' }),
      });

      const result = await client.get('/wp/v2/posts/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
      expect(result).toEqual({ id: 1, title: 'Test' });
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await client.get('/wp/v2/posts', { per_page: 10, status: 'publish' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts?per_page=10&status=publish',
        expect.any(Object)
      );
    });

    it('should throw WordPressClientError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 'rest_post_invalid_id',
          message: 'Invalid post ID.',
        }),
      });

      await expect(client.get('/wp/v2/posts/999')).rejects.toThrow(
        WordPressClientError
      );
    });

    it('should throw WordPressClientError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 'rest_forbidden',
          message: 'Authentication required.',
        }),
      });

      await expect(client.get('/wp/v2/users/me')).rejects.toThrow(
        WordPressClientError
      );
    });
  });

  describe('post', () => {
    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: { rendered: 'New Post' } }),
      });

      const result = await client.post('/wp/v2/posts', {
        title: 'New Post',
        content: 'Content here',
        status: 'draft',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            title: 'New Post',
            content: 'Content here',
            status: 'draft',
          }),
        })
      );
      expect(result).toEqual({ id: 1, title: { rendered: 'New Post' } });
    });

    it('should throw on validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          code: 'rest_invalid_param',
          message: 'Invalid parameter: status',
        }),
      });

      await expect(
        client.post('/wp/v2/posts', { status: 'invalid' })
      ).rejects.toThrow(WordPressClientError);
    });
  });

  describe('put', () => {
    it('should make PUT request to update resource', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: { rendered: 'Updated' } }),
      });

      const result = await client.put('/wp/v2/posts/1', {
        title: 'Updated',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated' }),
        })
      );
      expect(result).toEqual({ id: 1, title: { rendered: 'Updated' } });
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      await client.delete('/wp/v2/posts/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle force delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      await client.delete('/wp/v2/posts/1', { force: true });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-json/wp/v2/posts/1?force=true',
        expect.any(Object)
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ message: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 }),
        });

      const clientWithRetry = createWordPressClient({
        ...config,
        retryAttempts: 3,
        retryDelayMs: 10,
      });

      const result = await clientWithRetry.get('/wp/v2/posts/1');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ id: 1 });
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      const clientWithRetry = createWordPressClient({
        ...config,
        retryAttempts: 3,
        retryDelayMs: 10,
      });

      await expect(clientWithRetry.get('/wp/v2/posts/1')).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal error' }),
      });

      const clientWithRetry = createWordPressClient({
        ...config,
        retryAttempts: 2,
        retryDelayMs: 10,
      });

      await expect(clientWithRetry.get('/wp/v2/posts/1')).rejects.toThrow(
        WordPressClientError
      );
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('base64 auth encoding', () => {
    it('should properly encode credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/wp/v2/users/me');

      const expectedAuth = Buffer.from('admin:xxxx xxxx xxxx xxxx').toString(
        'base64'
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${expectedAuth}`,
          }),
        })
      );
    });
  });
});

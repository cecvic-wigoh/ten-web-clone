/**
 * WordPress Media Upload Handler
 *
 * Uploads images to WordPress media library from URLs.
 */

import { type WordPressClient } from './client';
import { parseWPMedia, type WPMedia } from './schemas';

// ============================================================================
// Types
// ============================================================================

/**
 * Media item result
 */
export interface MediaItem {
  id: number;
  url: string;
  alt: string;
  title: string;
}

/**
 * Image to upload
 */
export interface ImageToUpload {
  url: string;
  title?: string;
  alt?: string;
}

/**
 * Upload options for single image
 */
export interface UploadOptions {
  title?: string;
  alt?: string;
  caption?: string;
}

/**
 * Batch upload options
 */
export interface BatchUploadOptions {
  /** Continue uploading if one fails (default: false) */
  continueOnError?: boolean;
  /** Maximum concurrent uploads (default: 3) */
  concurrency?: number;
}

/**
 * Media uploader interface
 */
export interface MediaUploader {
  /**
   * Upload a single image from URL
   */
  upload(imageUrl: string, options?: UploadOptions): Promise<MediaItem>;

  /**
   * Upload multiple images
   */
  uploadBatch(
    images: ImageToUpload[],
    options?: BatchUploadOptions
  ): Promise<MediaItem[]>;

  /**
   * Get media by ID
   */
  getById(id: number): Promise<MediaItem | null>;

  /**
   * Delete media by ID
   */
  deleteById(id: number): Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get filename from URL
 */
function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'image';
    return filename;
  } catch {
    return 'image';
  }
}

/**
 * Get content type from URL or response
 */
function getContentType(url: string, responseContentType?: string | null): string {
  if (responseContentType && responseContentType.startsWith('image/')) {
    return responseContentType;
  }

  const filename = getFilenameFromUrl(url);
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
  };

  return mimeTypes[ext || ''] || 'image/jpeg';
}

/**
 * Process uploads with concurrency limit using a semaphore pattern
 */
async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number,
  continueOnError: boolean
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const executing: Set<Promise<void>> = new Set();

  const enqueue = async (): Promise<void> => {
    if (index >= items.length) return;

    const currentIndex = index++;
    const item = items[currentIndex];

    const promise = (async () => {
      try {
        const result = await processor(item);
        results.push(result);
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        // Skip failed items when continueOnError is true
      }
    })();

    executing.add(promise);
    await promise;
    executing.delete(promise);

    // Start next item
    await enqueue();
  };

  // Start initial batch up to concurrency limit
  const initialBatch = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => enqueue());

  await Promise.all(initialBatch);

  return results;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a WordPress media uploader
 */
export function createMediaUploader(client: WordPressClient): MediaUploader {
  /**
   * Download image from URL and get its data
   */
  async function downloadImage(
    url: string
  ): Promise<{ data: ArrayBuffer; contentType: string; filename: string }> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status}`);
    }

    const data = await response.arrayBuffer();
    const contentType = getContentType(url, response.headers.get('content-type'));
    const filename = getFilenameFromUrl(url);

    return { data, contentType, filename };
  }

  /**
   * Upload image data to WordPress
   */
  async function uploadToWordPress(
    data: ArrayBuffer,
    filename: string,
    contentType: string,
    options: UploadOptions = {}
  ): Promise<MediaItem> {
    // WordPress expects multipart form data for media uploads
    // We'll use the REST API directly with base64 encoding
    const base64 = Buffer.from(data).toString('base64');

    // Use the WordPress REST API media endpoint
    const result = await client.post<WPMedia>('/wp/v2/media', {
      file: base64,
      title: options.title || filename,
      alt_text: options.alt || '',
      caption: options.caption || '',
      // Content-Disposition header would be set server-side
    });

    return parseWPMedia(result);
  }

  return {
    async upload(imageUrl: string, options: UploadOptions = {}): Promise<MediaItem> {
      const { data, contentType, filename } = await downloadImage(imageUrl);
      return uploadToWordPress(data, filename, contentType, options);
    },

    async uploadBatch(
      images: ImageToUpload[],
      options: BatchUploadOptions = {}
    ): Promise<MediaItem[]> {
      const { continueOnError = false, concurrency = 3 } = options;

      return processWithConcurrency(
        images,
        async (image) => {
          const { data, contentType, filename } = await downloadImage(image.url);
          return uploadToWordPress(data, filename, contentType, {
            title: image.title,
            alt: image.alt,
          });
        },
        concurrency,
        continueOnError
      );
    },

    async getById(id: number): Promise<MediaItem | null> {
      try {
        const result = await client.get<WPMedia>(`/wp/v2/media/${id}`);
        return parseWPMedia(result);
      } catch {
        return null;
      }
    },

    async deleteById(id: number): Promise<void> {
      await client.delete(`/wp/v2/media/${id}`, { force: true });
    },
  };
}

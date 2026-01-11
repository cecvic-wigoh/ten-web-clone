/**
 * Claude API Client Wrapper
 *
 * Provides a typed interface to the Anthropic SDK with support for
 * structured output validation using Zod schemas.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { TokenUsage } from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Client configuration options
 */
export interface ClaudeClientConfig {
  /** API key (defaults to ANTHROPIC_API_KEY env var) */
  apiKey?: string;
  /** Model to use (defaults to claude-3-5-sonnet) */
  model?: string;
  /** Maximum tokens for output */
  maxTokens?: number;
  /** Default temperature */
  temperature?: number;
}

/**
 * Request options for generateStructuredOutput
 */
export interface StructuredOutputRequest<T extends z.ZodTypeAny> {
  /** System prompt defining assistant behavior */
  systemPrompt: string;
  /** User prompt with the actual request */
  userPrompt: string;
  /** Zod schema for output validation */
  schema: T;
  /** Override max tokens for this request */
  maxTokens?: number;
  /** Override temperature for this request */
  temperature?: number;
}

/**
 * Request options for generateText
 */
export interface TextRequest {
  /** System prompt defining assistant behavior */
  systemPrompt: string;
  /** User prompt with the actual request */
  userPrompt: string;
  /** Override max tokens for this request */
  maxTokens?: number;
  /** Override temperature for this request */
  temperature?: number;
}

/**
 * Success result from structured output generation
 */
export interface StructuredOutputSuccess<T> {
  success: true;
  data: T;
  usage?: TokenUsage;
  rawResponse?: string;
}

/**
 * Error result from structured output generation
 */
export interface StructuredOutputError {
  success: false;
  error: string;
  rawResponse?: string;
}

/**
 * Result type for structured output
 */
export type StructuredOutputResult<T> =
  | StructuredOutputSuccess<T>
  | StructuredOutputError;

/**
 * Success result from text generation
 */
export interface TextSuccess {
  success: true;
  text: string;
  usage?: TokenUsage;
}

/**
 * Error result from text generation
 */
export interface TextError {
  success: false;
  error: string;
}

/**
 * Result type for text generation
 */
export type TextResult = TextSuccess | TextError;

// ============================================================================
// Error Class
// ============================================================================

/**
 * Custom error class for Claude client errors
 */
export class ClaudeClientError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'API_ERROR'
      | 'PARSE_ERROR'
      | 'VALIDATION_ERROR'
      | 'CONFIG_ERROR',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ClaudeClientError';
  }
}

// ============================================================================
// Client Interface
// ============================================================================

/**
 * Claude client interface
 */
export interface ClaudeClient {
  /**
   * Generate output matching a Zod schema
   */
  generateStructuredOutput<T extends z.ZodTypeAny>(
    request: StructuredOutputRequest<T>
  ): Promise<StructuredOutputResult<z.infer<T>>>;

  /**
   * Generate plain text output
   */
  generateText(request: TextRequest): Promise<TextResult>;
}

// ============================================================================
// Client Implementation
// ============================================================================

/**
 * Default model to use
 */
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Default max tokens
 */
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Default temperature
 */
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Create a Claude client instance
 */
export function createClaudeClient(config: ClaudeClientConfig = {}): ClaudeClient {
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new ClaudeClientError(
      'ANTHROPIC_API_KEY environment variable is not set and no apiKey was provided',
      'CONFIG_ERROR'
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const model = config.model || DEFAULT_MODEL;
  const defaultMaxTokens = config.maxTokens || DEFAULT_MAX_TOKENS;
  const defaultTemperature = config.temperature || DEFAULT_TEMPERATURE;

  return {
    async generateStructuredOutput<T extends z.ZodTypeAny>(
      request: StructuredOutputRequest<T>
    ): Promise<StructuredOutputResult<z.infer<T>>> {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: request.maxTokens || defaultMaxTokens,
          temperature: request.temperature ?? defaultTemperature,
          system: request.systemPrompt,
          messages: [
            {
              role: 'user',
              content: request.userPrompt,
            },
          ],
        });

        // Extract text from response
        const textContent = response.content.find((c) => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          return {
            success: false,
            error: 'No text content in response',
          };
        }

        const rawText = textContent.text;

        // Try to extract JSON from the response
        // Handle cases where Claude wraps JSON in markdown code blocks
        let jsonText = rawText.trim();

        // Remove markdown code block if present
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonText);
        } catch (parseError) {
          return {
            success: false,
            error: `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
            rawResponse: rawText,
          };
        }

        // Validate against schema
        const validation = request.schema.safeParse(parsed);
        if (!validation.success) {
          return {
            success: false,
            error: `Schema validation failed: ${validation.error.message}`,
            rawResponse: rawText,
          };
        }

        return {
          success: true,
          data: validation.data,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
          rawResponse: rawText,
        };
      } catch (error) {
        if (error instanceof ClaudeClientError) {
          throw error;
        }

        return {
          success: false,
          error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },

    async generateText(request: TextRequest): Promise<TextResult> {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: request.maxTokens || defaultMaxTokens,
          temperature: request.temperature ?? defaultTemperature,
          system: request.systemPrompt,
          messages: [
            {
              role: 'user',
              content: request.userPrompt,
            },
          ],
        });

        // Extract text from response
        const textContent = response.content.find((c) => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          return {
            success: false,
            error: 'No text content in response',
          };
        }

        return {
          success: true,
          text: textContent.text,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  };
}

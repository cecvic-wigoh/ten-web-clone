/**
 * Shared types for AI agents
 */

/**
 * Token usage statistics from Claude API
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

/**
 * Base result type for agent operations
 */
export type AgentResult<T> =
  | { success: true; data: T; usage?: TokenUsage }
  | { success: false; error: string };

/**
 * Configuration options for agents
 */
export interface AgentConfig {
  /** Maximum tokens for output */
  maxTokens?: number;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Whether to enable verbose logging */
  verbose?: boolean;
}

/**
 * Business type categories for site structure recommendations
 */
export type BusinessType =
  | 'restaurant'
  | 'ecommerce'
  | 'portfolio'
  | 'saas'
  | 'agency'
  | 'blog'
  | 'nonprofit'
  | 'healthcare'
  | 'education'
  | 'other';

/**
 * Structure Generation Agent
 *
 * AI agent that generates website structure from business descriptions
 * using Claude API with structured output.
 */

import type { ClaudeClient } from '../client';
import type { TokenUsage } from '../types';
import { SiteStructureSchema, type SiteStructure } from './schemas';
import { buildSystemPrompt, buildUserPrompt, buildUserPromptWithGoal } from './prompts';
import type { SiteGoal } from './goals';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for structure generation
 */
export interface GenerationInput {
  businessDescription: string;
  businessType?: string;
  siteGoal?: SiteGoal;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Successful generation result
 */
export interface GenerationSuccess {
  success: true;
  structure: SiteStructure;
  usage?: TokenUsage;
  rawResponse?: string;
}

/**
 * Failed generation result
 */
export interface GenerationError {
  success: false;
  error: string;
  rawResponse?: string;
}

/**
 * Result from structure generation
 */
export type GenerationResult = GenerationSuccess | GenerationError;

/**
 * Structure agent interface
 */
export interface StructureAgent {
  /**
   * Generate a site structure from a business description
   */
  generate(input: GenerationInput): Promise<GenerationResult>;
}

// ============================================================================
// Agent Implementation
// ============================================================================

/**
 * Create a structure generation agent
 */
export function createStructureAgent(client: ClaudeClient): StructureAgent {
  return {
    async generate(input: GenerationInput): Promise<GenerationResult> {
      try {
        const systemPrompt = buildSystemPrompt();
        const userPrompt = input.siteGoal
          ? buildUserPromptWithGoal(input.businessDescription, input.siteGoal)
          : buildUserPrompt(input.businessDescription);

        const result = await client.generateStructuredOutput({
          systemPrompt,
          userPrompt,
          schema: SiteStructureSchema,
          maxTokens: input.maxTokens,
          temperature: input.temperature ?? 0.7,
        });

        if (!result.success) {
          return {
            success: false,
            error: result.error,
            rawResponse: result.rawResponse,
          };
        }

        return {
          success: true,
          structure: result.data,
          usage: result.usage,
          rawResponse: result.rawResponse,
        };
      } catch (error) {
        return {
          success: false,
          error: `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate a site structure against the schema
 */
export function validateSiteStructure(
  data: unknown
): { valid: true; structure: SiteStructure } | { valid: false; error: string } {
  const result = SiteStructureSchema.safeParse(data);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.message,
    };
  }

  return {
    valid: true,
    structure: result.data,
  };
}

/**
 * Extract section configs from a site structure
 * Useful for mapping to block-engine patterns
 */
export function extractSectionConfigs(
  structure: SiteStructure,
  pageSlug = 'home'
): Map<string, Record<string, unknown>> {
  const configs = new Map<string, Record<string, unknown>>();

  const page = structure.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    return configs;
  }

  for (const section of page.sections) {
    configs.set(section.type, section.config);
  }

  return configs;
}

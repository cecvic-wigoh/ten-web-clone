/**
 * Content Generation Agent
 *
 * AI agent that generates copywriting and SEO content for website sections
 * using Claude API with structured output.
 */

import type { ClaudeClient } from '../client';
import type { TokenUsage } from '../types';
import {
  PageContentSchema,
  type PageContent,
  type TonePreset,
} from './schemas';
import { buildContentSystemPrompt, buildContentUserPrompt } from './prompts';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for content generation
 */
export interface ContentGenerationInput {
  /** Description of the business/website */
  businessDescription: string;
  /** Page slug to generate content for */
  pageSlug: string;
  /** Section types to generate content for */
  sectionTypes: string[];
  /** Tone preset for content style */
  tone: TonePreset;
  /** Optional existing content for context */
  existingContent?: Record<string, string>;
  /** Override max tokens */
  maxTokens?: number;
  /** Override temperature */
  temperature?: number;
}

/**
 * Successful content generation result
 */
export interface ContentGenerationSuccess {
  success: true;
  content: PageContent;
  usage?: TokenUsage;
  rawResponse?: string;
}

/**
 * Failed content generation result
 */
export interface ContentGenerationError {
  success: false;
  error: string;
  rawResponse?: string;
}

/**
 * Result from content generation
 */
export type ContentGenerationResult =
  | ContentGenerationSuccess
  | ContentGenerationError;

/**
 * Content agent interface
 */
export interface ContentAgent {
  /**
   * Generate content for a page
   */
  generate(input: ContentGenerationInput): Promise<ContentGenerationResult>;
}

// ============================================================================
// Agent Implementation
// ============================================================================

/**
 * Create a content generation agent
 */
export function createContentAgent(client: ClaudeClient): ContentAgent {
  return {
    async generate(input: ContentGenerationInput): Promise<ContentGenerationResult> {
      try {
        const systemPrompt = buildContentSystemPrompt(input.tone);
        const userPrompt = buildContentUserPrompt({
          businessDescription: input.businessDescription,
          pageSlug: input.pageSlug,
          sectionTypes: input.sectionTypes,
          existingContent: input.existingContent,
        });

        const result = await client.generateStructuredOutput({
          systemPrompt,
          userPrompt,
          schema: PageContentSchema,
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
          content: result.data,
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
 * Validate page content against the schema
 */
export function validatePageContent(
  data: unknown
): { valid: true; content: PageContent } | { valid: false; error: string } {
  const result = PageContentSchema.safeParse(data);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.message,
    };
  }

  return {
    valid: true,
    content: result.data,
  };
}

/**
 * Extract section content by type from page content
 */
export function extractSectionContent(
  content: PageContent,
  sectionType: string
): Record<string, unknown> | undefined {
  const section = content.sections.find((s) => s.sectionType === sectionType);
  return section?.content;
}

/**
 * Merge generated content into existing structure config
 * Useful for filling in content from Structure Agent
 */
export function mergeContentIntoStructure(
  structureConfig: Record<string, unknown>,
  generatedContent: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...structureConfig,
    ...generatedContent,
  };
}

/**
 * Get all section types from page content
 */
export function getSectionTypes(content: PageContent): string[] {
  return content.sections.map((s) => s.sectionType);
}

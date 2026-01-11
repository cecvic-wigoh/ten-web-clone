/**
 * SEO Metadata Generation Utilities
 *
 * Provides SEO-specific prompts and validation for meta tags.
 */

// ============================================================================
// SEO Constraints
// ============================================================================

/**
 * SEO character length constraints based on best practices
 */
export const SEO_CONSTRAINTS = {
  metaTitle: {
    minLength: 10,
    maxLength: 60,
    recommendedMin: 50,
    recommendedMax: 60,
  },
  metaDescription: {
    minLength: 50,
    maxLength: 160,
    recommendedMin: 150,
    recommendedMax: 160,
  },
  ogTitle: {
    minLength: 10,
    maxLength: 70,
  },
  ogDescription: {
    minLength: 50,
    maxLength: 200,
  },
  keywords: {
    min: 3,
    max: 5,
  },
};

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of SEO validation
 */
export interface SeoValidationResult {
  valid: boolean;
  length: number;
  error?: string;
  warning?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate meta title length
 */
export function validateMetaTitle(title: string): SeoValidationResult {
  const trimmed = title.trim();
  const length = trimmed.length;

  if (length === 0) {
    return {
      valid: false,
      length,
      error: 'Meta title cannot be empty',
    };
  }

  if (length > SEO_CONSTRAINTS.metaTitle.maxLength) {
    return {
      valid: false,
      length,
      error: `Meta title is too long (${length} chars). Maximum is ${SEO_CONSTRAINTS.metaTitle.maxLength} characters.`,
    };
  }

  if (length < SEO_CONSTRAINTS.metaTitle.minLength) {
    return {
      valid: false,
      length,
      error: `Meta title is too short (${length} chars). Minimum is ${SEO_CONSTRAINTS.metaTitle.minLength} characters.`,
    };
  }

  // Check for approaching max
  if (length > SEO_CONSTRAINTS.metaTitle.recommendedMax) {
    return {
      valid: true,
      length,
      warning: `Meta title is approaching the limit (${length}/${SEO_CONSTRAINTS.metaTitle.maxLength}). Consider shortening.`,
    };
  }

  return { valid: true, length };
}

/**
 * Validate meta description length
 */
export function validateMetaDescription(description: string): SeoValidationResult {
  const trimmed = description.trim();
  const length = trimmed.length;

  if (length === 0) {
    return {
      valid: false,
      length,
      error: 'Meta description cannot be empty',
    };
  }

  if (length > SEO_CONSTRAINTS.metaDescription.maxLength) {
    return {
      valid: false,
      length,
      error: `Meta description is too long (${length} chars). Maximum is ${SEO_CONSTRAINTS.metaDescription.maxLength} characters.`,
    };
  }

  if (length < SEO_CONSTRAINTS.metaDescription.minLength) {
    return {
      valid: false,
      length,
      error: `Meta description is too short (${length} chars). Minimum is ${SEO_CONSTRAINTS.metaDescription.minLength} characters.`,
    };
  }

  // Check for optimal range
  if (
    length >= SEO_CONSTRAINTS.metaDescription.recommendedMin &&
    length <= SEO_CONSTRAINTS.metaDescription.recommendedMax
  ) {
    return { valid: true, length };
  }

  return { valid: true, length };
}

/**
 * Validate keywords array
 */
export function validateKeywords(
  keywords: string[]
): SeoValidationResult & { count: number } {
  const count = keywords.length;

  if (count < SEO_CONSTRAINTS.keywords.min) {
    return {
      valid: false,
      length: 0,
      count,
      error: `Too few keywords (${count}). Minimum is ${SEO_CONSTRAINTS.keywords.min}.`,
    };
  }

  if (count > SEO_CONSTRAINTS.keywords.max) {
    return {
      valid: true,
      length: 0,
      count,
      warning: `Many keywords (${count}). Recommended is ${SEO_CONSTRAINTS.keywords.min}-${SEO_CONSTRAINTS.keywords.max}.`,
    };
  }

  return { valid: true, length: 0, count };
}

// ============================================================================
// SEO Prompts
// ============================================================================

/**
 * Build system prompt for SEO-focused generation
 */
export function buildSeoSystemPrompt(): string {
  return `You are an SEO specialist creating optimized meta tags for web pages.

## Output Format

Respond with valid JSON matching this schema:

{
  "metaTitle": "string",
  "metaDescription": "string",
  "ogTitle": "string",
  "ogDescription": "string",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

## Character Limits

- **metaTitle**: 50-60 characters (Google truncates at ~60)
- **metaDescription**: 150-160 characters (Google truncates at ~160)
- **ogTitle**: Up to 70 characters for social platforms
- **ogDescription**: Up to 200 characters for social platforms
- **keywords**: 3-5 relevant focus keywords

## SEO Best Practices

1. **Meta Title**
   - Include primary keyword near the beginning
   - Make it compelling and click-worthy
   - Include brand name at the end if space permits
   - Use title case or sentence case consistently

2. **Meta Description**
   - Write a compelling summary that encourages clicks
   - Include a call-to-action when appropriate
   - Incorporate relevant keywords naturally
   - Don't keyword stuff - write for humans

3. **Open Graph Tags**
   - ogTitle can differ slightly from metaTitle
   - ogDescription should be compelling for social sharing
   - Optimize for Facebook, LinkedIn, Twitter previews

4. **Keywords**
   - Choose 3-5 focus keywords
   - Include primary keyword and variations
   - Mix head terms and long-tail keywords
   - Consider search intent

Remember: Write for humans first, search engines second. Natural, compelling copy performs better than keyword-stuffed text.`;
}

/**
 * Options for building SEO user prompt
 */
export interface SeoUserPromptOptions {
  businessDescription: string;
  pageSlug: string;
  pageTitle: string;
  contentSummary?: string;
}

/**
 * Build user prompt for SEO generation
 */
export function buildSeoUserPrompt(options: SeoUserPromptOptions): string {
  const { businessDescription, pageSlug, pageTitle, contentSummary } = options;

  let prompt = `Generate SEO metadata for the "${pageSlug}" page titled "${pageTitle}".

## Business Context
${businessDescription}`;

  if (contentSummary) {
    prompt += `

## Page Content Summary
${contentSummary}`;
  }

  prompt += `

## Requirements
- Generate meta title (50-60 chars)
- Generate meta description (150-160 chars)
- Generate Open Graph title and description
- Suggest 3-5 focus keywords

Respond with valid JSON only.`;

  return prompt;
}

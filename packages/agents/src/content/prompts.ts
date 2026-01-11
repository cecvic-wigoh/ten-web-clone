/**
 * System prompts for the Content Agent
 *
 * These prompts guide Claude to generate compelling copywriting
 * with appropriate tone and style for each section type.
 */

import type { TonePreset } from './schemas';

// ============================================================================
// Tone Preset Definitions
// ============================================================================

/**
 * Tone preset configuration
 */
export interface TonePresetConfig {
  name: string;
  description: string;
  characteristics: string[];
  examples: {
    headline: string;
    cta: string;
  };
}

/**
 * Available tone presets with their configurations
 */
export const TONE_PRESETS: Record<TonePreset, TonePresetConfig> = {
  professional: {
    name: 'Professional',
    description: 'Corporate, formal, and expertise-focused',
    characteristics: [
      'Formal language without being stiff',
      'Industry terminology where appropriate',
      'Focus on expertise and credibility',
      'Data-driven and results-oriented',
      'Confident but not boastful',
    ],
    examples: {
      headline: 'Enterprise Solutions for Modern Business Challenges',
      cta: 'Schedule a Consultation',
    },
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable, and welcoming',
    characteristics: [
      'Conversational and warm tone',
      'Uses "you" and "we" to connect',
      'Approachable and inviting language',
      'Positive and encouraging',
      'Relatable and down-to-earth',
    ],
    examples: {
      headline: "We're Here to Help You Succeed",
      cta: "Let's Get Started Together",
    },
  },
  bold: {
    name: 'Bold',
    description: 'Confident, assertive, and strong statements',
    characteristics: [
      'Short, punchy sentences',
      'Strong action verbs',
      'Confident and assertive claims',
      'No hedging or qualifiers',
      'Direct and impactful',
    ],
    examples: {
      headline: 'Dominate Your Market',
      cta: 'Start Winning Now',
    },
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, concise, and simple',
    characteristics: [
      'Extremely concise copy',
      'One idea per sentence',
      'No unnecessary words',
      'Clean and simple language',
      'Whitespace-friendly (short text)',
    ],
    examples: {
      headline: 'Simple. Fast. Effective.',
      cta: 'Try Free',
    },
  },
  playful: {
    name: 'Playful',
    description: 'Fun, energetic, and creative',
    characteristics: [
      'Casual and fun language',
      'Creative wordplay when appropriate',
      'Energetic and enthusiastic',
      'Light-hearted but not unprofessional',
      'Memorable and engaging',
    ],
    examples: {
      headline: 'Ready to Make Some Magic?',
      cta: "Let's Do This!",
    },
  },
};

// ============================================================================
// Section Content Templates
// ============================================================================

/**
 * Content structure templates for each section type
 */
export const SECTION_CONTENT_TEMPLATES: Record<string, string> = {
  hero: `{
  "heading": "Primary headline (5-10 words, attention-grabbing)",
  "subheading": "Supporting text (15-25 words, clarifies value)",
  "buttonText": "Call-to-action button text (2-4 words)"
}`,

  features: `{
  "title": "Section heading (3-6 words)",
  "features": [
    {
      "title": "Feature name (2-4 words)",
      "description": "Feature benefit (10-20 words)",
      "icon": "Icon name suggestion (single word like 'bolt', 'shield', 'chart')"
    }
  ]
}
Note: Include 3-6 features typically`,

  cta: `{
  "heading": "Action-oriented headline (5-10 words)",
  "body": "Supporting persuasive text (15-30 words)",
  "buttonText": "Call-to-action button text (2-4 words)"
}`,

  testimonials: `{
  "title": "Section heading (3-6 words)",
  "testimonials": [
    {
      "quote": "Customer testimonial (20-40 words, sounds authentic)",
      "author": "Customer name",
      "role": "Title/Company (optional)"
    }
  ]
}
Note: Include 2-4 testimonials typically`,

  footer: `{
  "columns": [
    {
      "title": "Column heading (1-2 words like 'Company', 'Product')",
      "links": ["Link label 1", "Link label 2", "Link label 3"]
    }
  ],
  "copyright": "Copyright text including year and company name"
}
Note: Include 2-4 columns typically`,

  gallery: `{
  "title": "Section heading (3-6 words, optional)",
  "images": [
    {
      "alt": "Descriptive alt text for accessibility",
      "caption": "Optional caption for the image"
    }
  ]
}`,

  contact: `{
  "title": "Section heading (3-6 words)",
  "description": "Invitation to get in touch (15-30 words)",
  "formHeading": "Form heading if applicable"
}`,
};

// ============================================================================
// Tone Instructions
// ============================================================================

/**
 * Get tone-specific writing instructions
 */
export function getToneInstructions(tone: TonePreset): string {
  const preset = TONE_PRESETS[tone];

  return `## Writing Tone: ${preset.name}

**Description:** ${preset.description}

**Characteristics to embody:**
${preset.characteristics.map((c) => `- ${c}`).join('\n')}

**Example headline in this tone:** "${preset.examples.headline}"
**Example CTA in this tone:** "${preset.examples.cta}"

Apply this ${tone} tone consistently across all content you generate.`;
}

// ============================================================================
// System Prompt Builder
// ============================================================================

/**
 * Build the system prompt for content generation
 */
export function buildContentSystemPrompt(tone: TonePreset): string {
  const toneInstructions = getToneInstructions(tone);

  return `You are an expert copywriter and SEO specialist. Your task is to generate compelling website content that converts visitors into customers.

${toneInstructions}

## Output Format

You must respond with valid JSON matching this exact schema:

{
  "pageSlug": "string (URL-friendly page identifier)",
  "sections": [
    {
      "sectionId": "string (unique id like 'hero-1', 'features-1')",
      "sectionType": "string (hero, features, cta, testimonials, footer, etc.)",
      "content": { /* section-specific content */ }
    }
  ],
  "seo": {
    "metaTitle": "string (50-60 characters max, include primary keyword)",
    "metaDescription": "string (150-160 characters max, compelling and keyword-rich)",
    "ogTitle": "string (for social sharing, can be slightly different from meta)",
    "ogDescription": "string (for social sharing)",
    "keywords": ["keyword1", "keyword2", ...] (3-5 focus keywords)
  }
}

## Section Content Structures

### hero
${SECTION_CONTENT_TEMPLATES.hero}

### features
${SECTION_CONTENT_TEMPLATES.features}

### cta
${SECTION_CONTENT_TEMPLATES.cta}

### testimonials
${SECTION_CONTENT_TEMPLATES.testimonials}

### footer
${SECTION_CONTENT_TEMPLATES.footer}

## Content Guidelines

1. **Headlines should be benefit-focused** - Focus on what the visitor gains, not features
2. **Use active voice** - "Transform your business" not "Your business will be transformed"
3. **Be specific** - Concrete details are more persuasive than vague claims
4. **Create urgency when appropriate** - But don't be pushy
5. **Match the business context** - Tailor language to the industry

## Character Limits

- Hero headline: 50-70 characters
- Hero subheadline: 100-150 characters
- Button text: 15-25 characters
- Feature title: 20-40 characters
- Feature description: 60-120 characters
- CTA headline: 40-70 characters
- CTA body: 100-200 characters
- Testimonial quote: 100-250 characters

## SEO Best Practices

- Meta title: 50-60 characters, primary keyword near the beginning
- Meta description: 150-160 characters, compelling call-to-action
- Include 3-5 relevant focus keywords
- Make metaTitle and ogTitle slightly different for variety
- Descriptions should be actionable and include a benefit

Remember: Generate realistic, compelling content that sounds authentic. Write as if you're crafting copy for a real business.`;
}

// ============================================================================
// User Prompt Builder
// ============================================================================

/**
 * Options for building user prompt
 */
export interface ContentUserPromptOptions {
  businessDescription: string;
  pageSlug: string;
  sectionTypes: string[];
  existingContent?: Record<string, string>;
}

/**
 * Build the user prompt with context
 */
export function buildContentUserPrompt(options: ContentUserPromptOptions): string {
  const { businessDescription, pageSlug, sectionTypes, existingContent } = options;

  let prompt = `Generate content for the "${pageSlug}" page of the following business:

${businessDescription}

Generate content for these section types: ${sectionTypes.join(', ')}

Create unique section IDs using the format: "{type}-{number}" (e.g., "hero-1", "features-1")`;

  if (existingContent && Object.keys(existingContent).length > 0) {
    prompt += `

## Existing Content Context
Use this existing information to maintain consistency:
${Object.entries(existingContent)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  prompt += `

Respond with valid JSON only. No markdown, no explanations, just the JSON object.`;

  return prompt;
}

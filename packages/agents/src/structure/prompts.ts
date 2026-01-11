/**
 * System prompts for the Structure Agent
 *
 * These prompts guide Claude to generate coherent website structures
 * that map to block-engine patterns with layout variety.
 */

import type { SectionType } from './schemas';
import { getSectionsForGoal, type SiteGoal } from './goals';

// ============================================================================
// Section Recommendations by Business Type
// ============================================================================

/**
 * Recommended sections for different business types
 * Used to guide AI toward appropriate section selection
 */
export const SECTION_RECOMMENDATIONS: Record<string, SectionType[]> = {
  restaurant: ['hero', 'features', 'gallery', 'testimonials', 'contact', 'footer'],
  ecommerce: ['hero', 'features', 'cta', 'testimonials', 'footer'],
  portfolio: ['hero', 'gallery', 'testimonials', 'contact', 'footer'],
  saas: ['hero', 'features', 'testimonials', 'cta', 'footer'],
  agency: ['hero', 'features', 'testimonials', 'cta', 'contact', 'footer'],
  blog: ['hero', 'features', 'cta', 'footer'],
  nonprofit: ['hero', 'features', 'testimonials', 'cta', 'contact', 'footer'],
  healthcare: ['hero', 'features', 'testimonials', 'contact', 'footer'],
  education: ['hero', 'features', 'testimonials', 'cta', 'contact', 'footer'],
};

// ============================================================================
// Layout Recommendations by Business Type
// ============================================================================

/**
 * Recommended layouts for different business types
 * Used to guide AI toward appropriate layout selection for visual variety
 */
export const LAYOUT_RECOMMENDATIONS: Record<string, {
  hero: string[];
  features: string[];
  testimonials: string[];
  cta: string[];
  footer: string[];
}> = {
  restaurant: {
    hero: ['fullscreen', 'split-left'],
    features: ['cards', 'grid-3'],
    testimonials: ['quote-wall', 'cards'],
    cta: ['banner', 'centered'],
    footer: ['columns', 'minimal'],
  },
  ecommerce: {
    hero: ['split-right', 'centered'],
    features: ['grid-4', 'cards'],
    testimonials: ['cards', 'centered'],
    cta: ['split', 'card'],
    footer: ['mega', 'columns'],
  },
  portfolio: {
    hero: ['minimal', 'split-left'],
    features: ['alternating', 'icon-left'],
    testimonials: ['single-large', 'centered'],
    cta: ['card', 'centered'],
    footer: ['minimal', 'centered'],
  },
  saas: {
    hero: ['split-right', 'centered'],
    features: ['grid-3', 'alternating'],
    testimonials: ['cards', 'single-large'],
    cta: ['split', 'centered'],
    footer: ['mega', 'columns'],
  },
  agency: {
    hero: ['fullscreen', 'split-left'],
    features: ['alternating', 'cards'],
    testimonials: ['quote-wall', 'single-large'],
    cta: ['card', 'banner'],
    footer: ['columns', 'mega'],
  },
  blog: {
    hero: ['minimal', 'centered'],
    features: ['grid-2', 'icon-left'],
    testimonials: ['centered', 'cards'],
    cta: ['banner', 'card'],
    footer: ['minimal', 'columns'],
  },
  nonprofit: {
    hero: ['fullscreen', 'centered'],
    features: ['cards', 'alternating'],
    testimonials: ['single-large', 'quote-wall'],
    cta: ['centered', 'split'],
    footer: ['columns', 'centered'],
  },
  healthcare: {
    hero: ['split-left', 'centered'],
    features: ['icon-left', 'grid-3'],
    testimonials: ['cards', 'centered'],
    cta: ['card', 'centered'],
    footer: ['columns', 'minimal'],
  },
  education: {
    hero: ['split-right', 'fullscreen'],
    features: ['grid-3', 'cards'],
    testimonials: ['cards', 'quote-wall'],
    cta: ['split', 'banner'],
    footer: ['mega', 'columns'],
  },
};

// ============================================================================
// System Prompt
// ============================================================================

/**
 * Build the system prompt for structure generation
 */
export function buildSystemPrompt(): string {
  return `You are an expert web designer and information architect. Your task is to generate a complete website structure based on a business description. CREATE UNIQUE, VISUALLY DISTINCT LAYOUTS - never use the same layout combination twice.

## Output Format

You must respond with valid JSON matching this exact schema:

{
  "pages": [
    {
      "slug": "string (URL-friendly page identifier, e.g., 'home', 'about')",
      "title": "string (page title)",
      "sections": [
        {
          "type": "hero | features | cta | testimonials | gallery | contact | footer",
          "config": { /* section-specific configuration with LAYOUT */ }
        }
      ]
    }
  ],
  "theme": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "background": "#hex",
      "foreground": "#hex",
      "accent": "#hex (optional)"
    },
    "typography": {
      "headingFont": "string (Google Font name)",
      "bodyFont": "string (Google Font name)"
    }
  },
  "navigation": {
    "items": [
      { "label": "string", "url": "string", "order": number }
    ]
  }
}

## Section Types, Layouts, and Configs

IMPORTANT: Each section MUST include a "layout" field to create visual variety!

### hero
Purpose: Main banner section at the top of a page
**Layouts available:**
- "centered" - Traditional centered text over background image
- "split-left" - Content on left (50%), large image on right (50%)
- "split-right" - Large image on left (50%), content on right (50%)
- "minimal" - Clean, simple design with no background image, focus on typography
- "fullscreen" - Full viewport height, immersive experience

Config: {
  "layout": "centered | split-left | split-right | minimal | fullscreen",
  "heading": "Main headline",
  "subheading": "Supporting text",
  "buttonText": "CTA button text (optional)",
  "buttonUrl": "Button link (optional)",
  "secondaryButtonText": "Secondary button (optional)",
  "secondaryButtonUrl": "Secondary link (optional)",
  "backgroundImage": "URL (required for centered/fullscreen, optional for split)",
  "alignment": "left | center | right (default: center)"
}

Layout guidance:
- Restaurants/Hotels: fullscreen (dramatic food/venue imagery)
- SaaS/Tech: split-right (show product screenshot)
- Portfolios: minimal (let work speak for itself)
- Agencies: split-left (bold statements with supporting visuals)
- E-commerce: centered or split-right (product focus)

### features
Purpose: Highlight key features, services, or benefits
**Layouts available:**
- "grid-3" - Three equal columns
- "grid-4" - Four equal columns (good for many features)
- "grid-2" - Two columns with larger cards
- "cards" - Card-style with shadows and hover effects
- "alternating" - Zigzag pattern, content alternates sides
- "icon-left" - Icons on left, text on right (list style)

Config: {
  "layout": "grid-3 | grid-4 | grid-2 | cards | alternating | icon-left",
  "title": "Section title",
  "subtitle": "Optional section subtitle",
  "features": [
    { "title": "Feature name", "description": "Feature description", "icon": "emoji (optional)" }
  ]
}

Layout guidance:
- 3 features: grid-3 or alternating
- 4 features: grid-4 or cards
- 5-6 features: grid-3 or icon-left
- Visual products: alternating (show images alongside)
- Services: icon-left (clear, scannable)
- Tech/SaaS: cards (modern look)

### cta (Call to Action)
Purpose: Encourage user action (sign up, contact, purchase)
**Layouts available:**
- "centered" - Traditional centered CTA with background
- "split" - Text on one side, form/buttons on other
- "banner" - Full-width thin banner style
- "card" - Floating card with shadow, more subtle

Config: {
  "layout": "centered | split | banner | card",
  "heading": "Action-oriented headline",
  "description": "Supporting text",
  "buttonText": "Button text",
  "buttonUrl": "Button destination",
  "secondaryButtonText": "Optional secondary action",
  "secondaryButtonUrl": "Secondary link",
  "backgroundColor": "#hex (optional)",
  "backgroundImage": "URL (optional)"
}

Layout guidance:
- Urgent action: centered (bold, prominent)
- Newsletter signup: split (form integration)
- Subtle reminder: banner (non-intrusive)
- Premium feel: card (elegant floating design)

### testimonials
Purpose: Social proof from customers/clients
**Layouts available:**
- "cards" - Card grid with equal-sized testimonials
- "single-large" - One large featured testimonial
- "quote-wall" - Masonry-style quote grid (varying sizes)
- "centered" - Single centered testimonial (carousel-ready)

Config: {
  "layout": "cards | single-large | quote-wall | centered",
  "title": "Section title",
  "subtitle": "Optional subtitle",
  "testimonials": [
    { "quote": "Customer quote", "author": "Name", "role": "Title/Company (optional)", "image": "Avatar URL (optional)" }
  ]
}

Layout guidance:
- 1-2 testimonials: single-large or centered
- 3 testimonials: cards (balanced grid)
- 4+ testimonials: quote-wall (visual interest)
- B2B/Enterprise: single-large (feature key client)
- Consumer products: cards or quote-wall

### gallery
Purpose: Image showcase for visual businesses
Config: {
  "title": "Section title (optional)",
  "images": [
    { "url": "placeholder-url", "alt": "Description", "caption": "optional" }
  ],
  "columns": 2 | 3 | 4
}

### contact
Purpose: Contact information and optionally a form
Config: {
  "title": "Section title",
  "description": "Invitation to contact",
  "email": "email@example.com",
  "phone": "phone number (optional)",
  "address": "physical address (optional)",
  "showForm": true | false
}

### footer
Purpose: Site footer with links and copyright
**Layouts available:**
- "columns" - Multi-column with navigation links (standard)
- "minimal" - Simple single-line footer
- "centered" - Centered content, stacked
- "mega" - Large footer with multiple sections and newsletter

Config: {
  "layout": "columns | minimal | centered | mega",
  "columns": [
    {
      "title": "Column heading",
      "links": [{ "text": "Link text", "url": "/path" }]
    }
  ],
  "copyright": "Copyright text",
  "socialLinks": [{ "platform": "Twitter | Facebook | Instagram | LinkedIn", "url": "https://..." }],
  "showNewsletter": true | false
}

Layout guidance:
- Simple sites: minimal
- Corporate/Enterprise: mega (lots of links)
- Portfolios: centered (clean)
- E-commerce: columns (organized navigation)

## Guidelines

1. **Start with a home page** - Every site needs a home page with slug "home"
2. **Hero first, footer last** - Start sections with hero, end with footer
3. **VARY YOUR LAYOUTS** - Mix different layouts to create unique sites!
4. **Match business type** - Choose sections AND layouts appropriate for the business
5. **Use appropriate colors** - Select colors that match the business industry/mood
6. **Keep it focused** - 4-6 sections per page is usually enough
7. **Write compelling copy** - Headlines and descriptions should be engaging
8. **Navigation matches pages** - Navigation items should link to actual pages

## Layout Variety Examples

For a restaurant:
- hero: fullscreen (dramatic food photos)
- features: cards (menu highlights with photos)
- testimonials: quote-wall (social proof)
- cta: banner (reservation reminder)
- footer: columns

For a SaaS startup:
- hero: split-right (show app screenshot)
- features: alternating (deep-dive features)
- testimonials: single-large (key enterprise client)
- cta: split (demo request form)
- footer: mega

For a creative agency:
- hero: minimal (bold typography)
- features: alternating (case study teasers)
- testimonials: quote-wall (client logos)
- cta: card (subtle contact invitation)
- footer: minimal

## Color Psychology Guide
- Professional/Corporate: Blues, grays
- Creative/Design: Bold colors, purples
- Health/Wellness: Greens, blues
- Food/Restaurant: Warm colors, browns, oranges
- Tech/SaaS: Blues, purples, clean whites
- Eco/Sustainable: Greens, earth tones
- Luxury: Blacks, golds, deep purples

## Font Pairing Suggestions
- Modern: "Inter" + "Inter"
- Professional: "Roboto" + "Open Sans"
- Creative: "Playfair Display" + "Lato"
- Friendly: "Poppins" + "Nunito"
- Technical: "Source Code Pro" + "Roboto"

Remember: Generate realistic, usable content. Use placeholder URLs for images (e.g., "https://placehold.co/800x600") but write real, compelling copy. ALWAYS include layout fields to ensure visual variety!`;
}

// ============================================================================
// User Prompt
// ============================================================================

/**
 * Build the user prompt with business description
 */
export function buildUserPrompt(businessDescription: string): string {
  return `Generate a complete website structure for the following business:

${businessDescription}

Respond with valid JSON only. No markdown, no explanations, just the JSON object.`;
}

/**
 * Build a prompt with business type hint
 */
export function buildUserPromptWithHint(
  businessDescription: string,
  businessType?: string
): string {
  const basePrompt = buildUserPrompt(businessDescription);

  if (businessType && SECTION_RECOMMENDATIONS[businessType]) {
    const recommended = SECTION_RECOMMENDATIONS[businessType].join(', ');
    return `${basePrompt}

Hint: For this type of business, consider including these sections: ${recommended}`;
  }

  return basePrompt;
}

export function buildUserPromptWithGoal(
  businessDescription: string,
  siteGoal: SiteGoal
): string {
  const basePrompt = buildUserPrompt(businessDescription);
  const recommended = getSectionsForGoal(siteGoal).join(', ');
  
  return `${basePrompt}

Recommended sections for ${siteGoal} goal: ${recommended}

Note: Use these sections as guidance. You may adjust based on the specific business needs, but respect the maximum of 8 sections per page.`;
}


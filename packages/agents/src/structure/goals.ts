/**
 * Goal-based section selection for website structure
 *
 * Maps site goals to recommended section arrays to guide the AI
 * towards generating appropriate sections for different business objectives.
 */

// ============================================================================
// Site Goal Type
// ============================================================================

/**
 * Site goals that influence section selection
 */
export type SiteGoal =
  | 'lead-generation'
  | 'sell-products'
  | 'portfolio'
  | 'inform-educate'
  | 'community';

// ============================================================================
// Goal to Section Mapping
// ============================================================================

/**
 * Maps each site goal to recommended sections
 *
 * Each goal has 6-8 sections (respecting max 8 limit) chosen to support
 * the specific business objective. The AI can customize these but uses
 * them as strong guidance.
 *
 * Section types available:
 * - Core: hero, features, cta, testimonials, gallery, contact, footer
 * - New (Phase 3): pricing, team, stats, logos, faq
 *
 * Note: Some sections (portfolio, blog, newsletter, process) will be
 * implemented in Phase 5. Using available alternatives for now.
 */
export const GOAL_SECTION_MAP: Record<SiteGoal, string[]> = {
  'lead-generation': [
    'hero',
    'features',
    'testimonials',
    'stats',
    'cta',
    'faq',
    'footer',
  ],

  'sell-products': [
    'hero',
    'features',
    'pricing',
    'testimonials',
    'faq',
    'cta',
    'footer',
  ],

  portfolio: [
    'hero',
    'portfolio',
    'team',
    'process',
    'testimonials',
    'contact',
    'footer',
  ],

  'inform-educate': [
    'hero',
    'features',
    'stats',
    'blog',
    'faq',
    'newsletter',
    'footer',
  ],

  community: [
    'hero',
    'team',
    'logos',
    'testimonials',
    'newsletter',
    'footer',
  ],
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get recommended sections for a specific goal
 *
 * @param goal - The site goal
 * @returns Array of recommended section types
 */
export function getSectionsForGoal(goal: SiteGoal): string[] {
  return GOAL_SECTION_MAP[goal];
}

/**
 * Check if a goal is valid
 *
 * @param goal - The goal string to validate
 * @returns True if the goal is valid
 */
export function isValidGoal(goal: string): goal is SiteGoal {
  return goal in GOAL_SECTION_MAP;
}

/**
 * Get all available goals
 *
 * @returns Array of all valid site goals
 */
export function getAllGoals(): SiteGoal[] {
  return Object.keys(GOAL_SECTION_MAP) as SiteGoal[];
}

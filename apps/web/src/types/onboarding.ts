import { type PromptInputData } from '@/components/PromptInput';

export type DesignDirection =
  | 'modern-corporate'
  | 'bold-creative'
  | 'elegant-minimal'
  | 'tech-saas'
  | 'organic-lifestyle';

export const DESIGN_DIRECTIONS: { value: DesignDirection; label: string; description: string }[] = [
  {
    value: 'modern-corporate',
    label: 'Modern Corporate',
    description: 'Clean, professional look with structured layouts and muted colors',
  },
  {
    value: 'bold-creative',
    label: 'Bold Creative',
    description: 'Vibrant colors, dynamic layouts, and striking typography',
  },
  {
    value: 'elegant-minimal',
    label: 'Elegant Minimal',
    description: 'Refined simplicity with generous whitespace and subtle details',
  },
  {
    value: 'tech-saas',
    label: 'Tech / SaaS',
    description: 'Modern tech aesthetic with gradients, cards, and clear CTAs',
  },
  {
    value: 'organic-lifestyle',
    label: 'Organic Lifestyle',
    description: 'Warm, natural tones with soft shapes and approachable feel',
  },
];

export type SiteGoal =
  | 'lead-generation'
  | 'sell-products'
  | 'portfolio'
  | 'inform-educate'
  | 'community';

export const SITE_GOALS: { value: SiteGoal; label: string; description: string }[] = [
  {
    value: 'lead-generation',
    label: 'Generate Leads',
    description: 'Capture potential customers with compelling CTAs and forms',
  },
  {
    value: 'sell-products',
    label: 'Sell Products/Services',
    description: 'Showcase offerings with pricing and purchase options',
  },
  {
    value: 'portfolio',
    label: 'Showcase Work',
    description: 'Display projects, case studies, and creative work',
  },
  {
    value: 'inform-educate',
    label: 'Inform & Educate',
    description: 'Share knowledge, resources, and helpful content',
  },
  {
    value: 'community',
    label: 'Build Community',
    description: 'Connect people around shared interests or causes',
  },
];

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingStepInfo {
  step: OnboardingStep;
  title: string;
  description: string;
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  { step: 1, title: 'Business Basics', description: 'Tell us about your business' },
  { step: 2, title: 'Design Direction', description: 'Choose your visual style' },
  { step: 3, title: 'Site Goals', description: 'What do you want to achieve?' },
  { step: 4, title: 'Content Preferences', description: 'Tone and page count' },
  { step: 5, title: 'Optional Details', description: 'Add finishing touches' },
];

export interface OnboardingData extends PromptInputData {
  designDirection?: DesignDirection;
  siteGoal?: SiteGoal;
  pageCount?: number;
  tagline?: string;
  services?: string[];
  targetAudience?: string;
  uniqueSellingPoints?: string[];
}

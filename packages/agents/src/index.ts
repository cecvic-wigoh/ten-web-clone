/**
 * @ai-wp/agents
 *
 * AI agents for WordPress site generation using Claude API.
 *
 * Features:
 * - Structure generation from business descriptions
 * - Content generation with tone/voice presets
 * - SEO metadata generation
 * - Zod schema validation for structured output
 * - Integration with block-engine patterns
 */

// Client
export {
  createClaudeClient,
  ClaudeClientError,
  type ClaudeClient,
  type ClaudeClientConfig,
  type StructuredOutputRequest,
  type StructuredOutputResult,
  type TextRequest,
  type TextResult,
} from './client';

// Types
export {
  type TokenUsage,
  type AgentResult,
  type AgentConfig,
  type BusinessType,
} from './types';

// Structure Agent
export {
  createStructureAgent,
  validateSiteStructure,
  extractSectionConfigs,
  type StructureAgent,
  type GenerationInput,
  type GenerationResult,
  type GenerationSuccess,
  type GenerationError,
} from './structure/agent';

// Structure Schemas
export {
  SiteStructureSchema,
  PageSchema,
  SectionSchema,
  SectionType,
  NavigationSchema,
  ThemeConfigSchema,
  HeroConfigSchema,
  FeaturesConfigSchema,
  CtaConfigSchema,
  TestimonialsConfigSchema,
  FooterConfigSchema,
  GalleryConfigSchema,
  ContactConfigSchema,
  type SiteStructure,
  type Page,
  type Section,
  type Navigation,
  type NavigationItem,
  type ThemeConfig,
  type Colors,
  type Typography,
  type HeroConfig,
  type FeaturesConfig,
  type FeatureItem,
  type CtaConfig,
  type TestimonialsConfig,
  type TestimonialItem,
  type FooterConfig,
  type FooterColumn,
  type FooterLink,
  type SocialLink,
  type GalleryConfig,
  type GalleryItem,
  type ContactConfig,
} from './structure/schemas';

// Structure Prompts
export {
  buildSystemPrompt,
  buildUserPrompt,
  buildUserPromptWithHint,
  buildUserPromptWithGoal,
  SECTION_RECOMMENDATIONS,
} from './structure/prompts';

// Structure Goals
export {
  GOAL_SECTION_MAP,
  getSectionsForGoal,
  isValidGoal,
  getAllGoals,
  type SiteGoal,
} from './structure/goals';

// Content Agent
export {
  createContentAgent,
  validatePageContent,
  extractSectionContent,
  mergeContentIntoStructure,
  getSectionTypes,
  type ContentAgent,
  type ContentGenerationInput,
  type ContentGenerationResult,
  type ContentGenerationSuccess,
  type ContentGenerationError,
} from './content/agent';

// Content Schemas
export {
  PageContentSchema,
  SectionContentSchema,
  SeoMetadataSchema,
  ContentRequestSchema,
  TonePreset,
  HeroContentSchema,
  FeaturesContentSchema,
  CtaContentSchema,
  TestimonialsContentSchema,
  FooterContentSchema,
  type PageContent,
  type SectionContent,
  type SeoMetadata,
  type ContentRequest,
  type HeroContent,
  type FeaturesContent,
  type FeatureContentItem,
  type CtaContent,
  type TestimonialsContent,
  type TestimonialContentItem,
  type FooterContent,
  type FooterColumnContent,
} from './content/schemas';

// Content Prompts
export {
  buildContentSystemPrompt,
  buildContentUserPrompt,
  getToneInstructions,
  TONE_PRESETS,
  SECTION_CONTENT_TEMPLATES,
  type TonePresetConfig,
  type ContentUserPromptOptions,
} from './content/prompts';

// SEO Utilities
export {
  buildSeoSystemPrompt,
  buildSeoUserPrompt,
  validateMetaTitle,
  validateMetaDescription,
  validateKeywords,
  SEO_CONSTRAINTS,
  type SeoValidationResult,
  type SeoUserPromptOptions,
} from './content/seo';

// Image Agent
export {
  createImageAgent,
  getImageTypeForSection,
  getStyleForSection,
  type ImageAgent,
  type ImageAgentConfig,
  type ImageGenerationResult,
  type ImageGenerationSuccess,
  type ImageGenerationError,
  type ImageBatchGenerationResult,
  type ImageBatchGenerationSuccess,
  type ImageBatchGenerationError,
  type QueryGenerationResult,
} from './image/agent';

// Image Providers
export {
  createUnsplashProvider,
  createDalleProvider,
  type UnsplashProvider,
  type UnsplashProviderConfig,
  type UnsplashSearchOptions,
  type UnsplashSearchResult,
  type UnsplashRandomResult,
  type DalleProvider,
  type DalleProviderConfig,
  type DalleGenerateOptions,
  type DalleGenerateResult,
} from './image/providers';

// Image Schemas
export {
  ImageSchema,
  ImageRequestSchema,
  ImageResultSchema,
  ImageBatchResultSchema,
  ImageQuerySchema,
  ImageOptimizationSchema,
  UnsplashImageSchema,
  UnsplashSearchResponseSchema,
  DalleImageSchema,
  SrcsetEntrySchema,
  ImageStylePreset,
  ImageType,
  ImageSource,
  type Image,
  type ImageRequest,
  type ImageResult,
  type ImageBatchResult,
  type ImageQuery,
  type ImageOptimization,
  type UnsplashImage,
  type UnsplashSearchResponse,
  type DalleImage,
  type SrcsetEntry,
} from './image/schemas';

// Image Optimizer
export {
  generateSrcset,
  getRecommendedSizes,
  createPlaceholderDataUrl,
  getWebPUrl,
  getSizeRecommendation,
  generateOptimization,
  type ImageUsage,
  type SizeRecommendation,
  type SrcsetOptions,
} from './image/optimizer';

// Variety Engine
export {
  generateTheme,
  detectIndustry,
  getIndustryPreset,
  getLayoutWeights,
  selectLayout,
  selectPageLayouts,
  INDUSTRY_PRESETS,
  type ThemeConfig as VarietyThemeConfig,
  type ThemeColors,
  type ThemeTypography,
  type ThemeStyle,
  type ThemeGenerationInput,
  type IndustryType,
  type IndustryPreset,
  type LayoutWeights,
  type LayoutSection,
  type HeroLayoutType,
  type FeaturesLayoutType,
  type TestimonialsLayoutType,
  type CtaLayoutType,
  type FooterLayoutType,
} from './variety';

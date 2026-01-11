# Implementation Plan: AI Website Builder for WordPress

**Generated:** 2026-01-11
**Status:** Initial Plan
**Based on:** 10Web Research Report + Current Best Practices Research

---

## Executive Summary

Build an AI-powered website builder that generates WordPress-native websites from natural language prompts, with visual/chat editing capabilities and cross-platform migration support. The system will use a multi-agent AI architecture outputting to Gutenberg blocks, providing a modern alternative to 10Web's Elementor-based approach.

---

## Goal

Create an AI website builder that:
1. Generates complete WordPress websites from user prompts
2. Enables visual "select-to-edit" and chat-based editing
3. Migrates/clones existing websites from any platform into WordPress
4. Deploys directly to managed WordPress hosting

**Key Differentiator:** Native Gutenberg blocks instead of Elementor dependency, enabling lighter-weight sites with better long-term WordPress compatibility.

---

## Research Summary

### Industry Best Practices (2025-2026)

| Area | Finding | Source |
|------|---------|--------|
| **Architecture** | Multi-agent systems with specialized agents per task | OpenAI Agent Builder, Agentic Reference Architecture |
| **Communication** | Model Context Protocol (MCP) for LLM gateway standardization | agentarchitecture.net |
| **Page Builder** | Gutenberg preferred for performance/integration; Elementor for design flexibility | Kinsta, weDevs comparisons |
| **Headless WP** | React frontends via REST API, WPGraphQL, or Faust.js | Human Made, Automattic |
| **Block Generation** | @wordpress/create-block + Gutenberg data API for programmatic insertion | WordPress Developer Docs |
| **HTML Conversion** | parse_blocks(), WP_HTML_Processor, classifAI for ML classification | 10up, WordPress Core |
| **Migration** | Firecrawl, Crawl4AI, Deepcrawl for crawling + DOM parsing | firecrawl.dev, crawl4ai.com |

### 10Web Technical Insights

| Component | 10Web Approach | Our Alternative |
|-----------|----------------|-----------------|
| Page Builder | Forked Elementor (50+ widgets) | Native Gutenberg blocks |
| AI Models | GPT-4o-mini-azure, Claude 3 Sonnet, Gemini | Claude (primary), GPT-4 (fallback) |
| Widget Classification | Proprietary neural network | Hybrid: LLM + rules-based |
| Frontend (Vibe) | React + Tailwind | React + Tailwind (similar) |
| Context | Elementor DOM structure | Gutenberg block tree + custom schema |

---

## Architecture Decision: Gutenberg vs Elementor

### Decision: **Gutenberg-First with React Editing Layer**

**Rationale:**

| Factor | Gutenberg | Elementor |
|--------|-----------|-----------|
| Performance | Lighter, faster page loads | Heavier, more CSS/JS |
| WordPress Integration | Native, core-supported | Third-party plugin |
| Long-term Maintenance | Auto-updated with WP | Must track Elementor releases |
| Programmatic Generation | Clean block grammar | Complex widget serialization |
| Ecosystem Lock-in | None (WordPress native) | High (Elementor-specific) |
| Design Flexibility | Growing (block patterns) | Mature (drag-drop) |

**Hybrid Approach:**
- Backend: Generate Gutenberg block markup programmatically
- Frontend: Custom React editing layer (like 10Web's Vibe)
- Bridge: WP REST API + custom endpoints for real-time sync

---

## System Architecture

```
+------------------------------------------------------------------+
|                         USER INTERFACE                            |
|  +------------------+  +------------------+  +------------------+ |
|  |  Prompt Input    |  |  Visual Editor   |  |  Chat Editor     | |
|  |  (Initial Gen)   |  |  (Select-Edit)   |  |  (Contextual)    | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
+-----------|--------------------|--------------------|--------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                      ORCHESTRATION LAYER                          |
|  +------------------------------------------------------------+  |
|  |                    Agent Coordinator                        |  |
|  |  - Request routing    - Context assembly                   |  |
|  |  - Agent selection    - Response synthesis                 |  |
|  +------------------------------------------------------------+  |
+-----------|--------------------|--------------------|--------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                      AI AGENT LAYER                               |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | Structure   |  | Content     |  | Design      |  | Migration | |
|  | Agent       |  | Agent       |  | Agent       |  | Agent     | |
|  | (Layout)    |  | (Copy/SEO)  |  | (Styles)    |  | (Clone)   | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  +-------------+  +-------------+  +-------------+                |
|  | Image       |  | Code        |  | Edit        |                |
|  | Agent       |  | Agent       |  | Agent       |                |
|  | (DALL-E/SD) |  | (Blocks)    |  | (Modify)    |                |
|  +-------------+  +-------------+  +-------------+                |
+------------------------------------------------------------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                    WORDPRESS LAYER                                |
|  +------------------------------------------------------------+  |
|  |              Block Generation Engine                        |  |
|  |  - Gutenberg block serialization                           |  |
|  |  - Block pattern composition                               |  |
|  |  - Theme.json styling                                      |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |              WordPress REST API                             |  |
|  |  - Pages/Posts CRUD    - Media upload                      |  |
|  |  - Blocks endpoint     - Custom fields                     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                    HOSTING LAYER                                  |
|  +--------------------+  +--------------------+                   |
|  | WordPress Instance |  | CDN/Edge           |                   |
|  | (Managed WP)       |  | (Cloudflare)       |                   |
|  +--------------------+  +--------------------+                   |
+------------------------------------------------------------------+
```

---

## Implementation Phases

## Phase 1: Core AI Generation (MVP)

**Goal:** Prompt-to-WordPress website generation with basic deployment

**Duration:** 8-10 weeks

### 1.1 Block Generation Engine

**Files to create:**
- `packages/block-engine/src/serializer.ts` - Gutenberg block grammar serialization
- `packages/block-engine/src/patterns.ts` - Block pattern library
- `packages/block-engine/src/theme.ts` - Theme.json generation

**Steps:**
1. Implement Gutenberg block serializer that outputs valid block grammar
2. Create library of 20+ common block patterns (hero, features, testimonials, CTA, footer, etc.)
3. Build theme.json generator for colors, typography, spacing tokens
4. Add block validation using WordPress block grammar parser

**Block Grammar Example:**
```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading {"level":1} -->
  <h1 class="wp-block-heading">Welcome to Your Site</h1>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Your site description goes here.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

**Acceptance criteria:**
- [ ] Serialize 15+ core block types (heading, paragraph, image, group, columns, buttons, etc.)
- [ ] Generate valid block markup that WordPress accepts without errors
- [ ] Create theme.json with customizable color palette and typography

### 1.2 Structure Agent

**Files to create:**
- `packages/agents/src/structure/agent.ts` - Structure generation agent
- `packages/agents/src/structure/prompts.ts` - System prompts
- `packages/agents/src/structure/schemas.ts` - Output schemas

**Steps:**
1. Design structured output schema for site architecture (pages, sections, blocks)
2. Create system prompt optimized for WordPress site structure
3. Implement Claude API integration with structured outputs
4. Add validation layer for generated structures

**Output Schema Example:**
```typescript
interface SiteStructure {
  pages: Page[];
  globalStyles: ThemeConfig;
  navigation: NavigationMenu;
}

interface Page {
  slug: string;
  title: string;
  sections: Section[];
}

interface Section {
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'gallery' | 'contact';
  layout: 'full-width' | 'constrained' | 'wide';
  blocks: BlockSpec[];
}
```

**Acceptance criteria:**
- [ ] Generate coherent site structure from business description
- [ ] Support 5+ page types (home, about, services, contact, blog)
- [ ] Output valid structured JSON that maps to block patterns

### 1.3 Content Agent

**Files to create:**
- `packages/agents/src/content/agent.ts` - Content generation agent
- `packages/agents/src/content/prompts.ts` - Copywriting prompts
- `packages/agents/src/content/seo.ts` - SEO optimization

**Steps:**
1. Create copywriting prompts for different section types
2. Implement tone/voice customization (professional, friendly, bold, etc.)
3. Add SEO metadata generation (titles, descriptions, keywords)
4. Build content validation for length, readability

**Acceptance criteria:**
- [ ] Generate contextually appropriate copy for each section
- [ ] Support 5+ tone presets
- [ ] Generate SEO metadata for each page

### 1.4 Image Agent

**Files to create:**
- `packages/agents/src/image/agent.ts` - Image generation/selection agent
- `packages/agents/src/image/providers.ts` - DALL-E, Unsplash integrations

**Steps:**
1. Integrate DALL-E 3 for custom image generation
2. Add Unsplash API for stock photo selection
3. Implement image optimization pipeline (resize, compress, WebP)
4. Build placeholder system for fast initial render

**Acceptance criteria:**
- [ ] Generate or select relevant images for each section
- [ ] Optimize images for web (< 200KB per image)
- [ ] Support both AI-generated and stock photos

### 1.5 WordPress Deployment

**Files to create:**
- `packages/deployer/src/wordpress.ts` - WordPress REST API client
- `packages/deployer/src/media.ts` - Media upload handler
- `packages/deployer/src/sync.ts` - Content synchronization

**Steps:**
1. Implement WordPress REST API client with authentication
2. Build page/post creation with block content
3. Add media library upload and attachment
4. Create deployment status tracking

**Acceptance criteria:**
- [ ] Deploy generated site to WordPress instance
- [ ] Upload and attach media assets
- [ ] Handle errors gracefully with rollback

### 1.6 MVP Web Interface

**Files to create:**
- `apps/web/src/pages/create.tsx` - Site creation flow
- `apps/web/src/components/PromptInput.tsx` - Prompt interface
- `apps/web/src/components/Preview.tsx` - Site preview

**Steps:**
1. Build prompt input with business info collection
2. Create generation progress UI with streaming updates
3. Implement preview iframe with WordPress site
4. Add "Deploy" button to push to hosting

**Acceptance criteria:**
- [ ] User can describe business and preferences
- [ ] See real-time generation progress
- [ ] Preview generated site before deployment
- [ ] One-click deploy to WordPress

---

## Phase 2: Interactive Editing (6-8 weeks)

**Goal:** Visual select-to-edit and chat-based editing with context awareness

### 2.1 Block Tree Representation

**Files to create:**
- `packages/editor/src/tree/parser.ts` - Block tree parser
- `packages/editor/src/tree/schema.ts` - Normalized tree schema
- `packages/editor/src/tree/diff.ts` - Tree diffing for updates

**Steps:**
1. Parse Gutenberg block content into normalized tree structure
2. Create bidirectional mapping (block ID <-> tree node)
3. Implement tree diffing for efficient updates
4. Build serialization back to block grammar

**Tree Schema Example:**
```typescript
interface BlockNode {
  id: string;
  type: string;           // 'core/paragraph', 'core/heading'
  attributes: Record<string, any>;
  innerContent: string[];
  children: BlockNode[];
  path: string[];         // ['page-home', 'section-hero', 'heading-1']
}
```

**Acceptance criteria:**
- [ ] Parse any Gutenberg content to tree
- [ ] Maintain stable IDs across edits
- [ ] Diff and patch tree efficiently

### 2.2 Visual Selection System

**Files to create:**
- `apps/editor/src/components/SelectableBlock.tsx` - Selection wrapper
- `apps/editor/src/hooks/useSelection.ts` - Selection state
- `apps/editor/src/components/SelectionOverlay.tsx` - Visual indicator

**Steps:**
1. Create React component that wraps rendered blocks with selection capability
2. Implement click-to-select with visual highlighting
3. Build selection context provider for app-wide state
4. Add keyboard navigation (Tab, Shift+Tab, Escape)

**Acceptance criteria:**
- [ ] Click any element to select it
- [ ] Visual highlight shows selected element
- [ ] Selection state accessible to chat interface

### 2.3 Context-Aware Chat Interface

**Files to create:**
- `apps/editor/src/components/ChatPanel.tsx` - Chat UI
- `packages/agents/src/edit/agent.ts` - Edit agent
- `packages/agents/src/edit/context.ts` - Context assembly

**Steps:**
1. Build chat UI panel with message history
2. Create context assembly that includes:
   - Selected block(s) and their content
   - Surrounding blocks for context
   - Page structure summary
   - Site-wide style tokens
3. Implement edit agent that generates targeted modifications
4. Apply edits to block tree and sync to WordPress

**Context Assembly Example:**
```typescript
interface EditContext {
  selected: {
    block: BlockNode;
    content: string;
    styles: Record<string, string>;
  };
  surroundings: {
    parent: BlockNode;
    siblings: BlockNode[];
    section: SectionSummary;
  };
  page: PageSummary;
  site: {
    colors: ColorPalette;
    typography: TypographyConfig;
    businessInfo: BusinessProfile;
  };
}
```

**Acceptance criteria:**
- [ ] Chat input with selection context shown
- [ ] Natural language commands modify selected element
- [ ] Changes reflect immediately in preview
- [ ] Undo/redo support for AI edits

### 2.4 Real-Time Preview & Sync

**Files to create:**
- `apps/editor/src/hooks/usePreview.ts` - Preview management
- `packages/sync/src/realtime.ts` - Real-time sync engine
- `packages/sync/src/optimistic.ts` - Optimistic updates

**Steps:**
1. Implement optimistic UI updates for instant feedback
2. Build WebSocket connection for real-time WordPress sync
3. Create conflict resolution for concurrent edits
4. Add save status indicator and error recovery

**Acceptance criteria:**
- [ ] Edits appear in preview within 100ms
- [ ] Changes persist to WordPress within 2 seconds
- [ ] Handle offline/reconnection gracefully

### 2.5 Edit Agent Capabilities

**Expand edit agent to handle:**
- Text content changes ("make this shorter", "add a call to action")
- Style modifications ("make this blue", "increase font size")
- Layout changes ("make this full width", "add another column")
- Block operations ("delete this", "duplicate this section", "move up")
- Image updates ("replace with a photo of...", "make the image larger")

**Acceptance criteria:**
- [ ] Handle 10+ edit operation types
- [ ] Maintain design consistency after edits
- [ ] Provide helpful suggestions when request is ambiguous

---

## Phase 3: Migration/Cloning (6-8 weeks)

**Goal:** Clone any website into WordPress with AI-powered reconstruction

### 3.1 Website Crawler

**Files to create:**
- `packages/crawler/src/fetcher.ts` - Page fetcher with JS rendering
- `packages/crawler/src/parser.ts` - DOM parser
- `packages/crawler/src/extractor.ts` - Asset extraction

**Steps:**
1. Integrate Playwright for JavaScript-rendered page capture
2. Implement multi-page crawling with depth limits
3. Extract all assets (images, fonts, CSS)
4. Store raw HTML, computed styles, and asset URLs

**Acceptance criteria:**
- [ ] Crawl JavaScript-heavy sites (React, Vue, etc.)
- [ ] Extract full page content and styles
- [ ] Handle pagination and infinite scroll

### 3.2 Layout Analyzer

**Files to create:**
- `packages/analyzer/src/layout.ts` - Layout detection
- `packages/analyzer/src/grid.ts` - Grid/flex analysis
- `packages/analyzer/src/sections.ts` - Section segmentation

**Steps:**
1. Analyze DOM tree to identify layout structure
2. Detect grid/flexbox layouts and convert to sections/columns
3. Segment page into logical sections (header, hero, content, footer)
4. Extract responsive breakpoints

**Acceptance criteria:**
- [ ] Identify main layout structure accurately
- [ ] Segment into 5+ section types
- [ ] Handle responsive layouts

### 3.3 Element Classifier

**Files to create:**
- `packages/classifier/src/model.ts` - Classification model
- `packages/classifier/src/features.ts` - Feature extraction
- `packages/classifier/src/mapping.ts` - Block type mapping

**Steps:**
1. Build feature extractor for DOM elements:
   - Tag name, class names, IDs
   - Computed styles (dimensions, colors, typography)
   - Content analysis (text length, image presence)
   - Position/relationship to other elements
2. Create classifier using Claude with structured output:
   - Input: Element features + context
   - Output: Best matching Gutenberg block type + attributes
3. Build mapping layer from classification to block generation

**Classification Prompt Example:**
```
Analyze this HTML element and classify it as a Gutenberg block:

Element: <div class="hero-section">
  <h1>Welcome to Our Company</h1>
  <p>We provide excellent services...</p>
  <a href="/contact" class="btn">Get Started</a>
</div>

Computed Styles:
- Background: linear-gradient(...)
- Padding: 80px 20px
- Text-align: center

Output the best matching Gutenberg block structure.
```

**Acceptance criteria:**
- [ ] Classify 20+ element patterns accurately
- [ ] Map to appropriate Gutenberg blocks
- [ ] Handle edge cases gracefully

### 3.4 Style Extractor

**Files to create:**
- `packages/extractor/src/colors.ts` - Color palette extraction
- `packages/extractor/src/typography.ts` - Font analysis
- `packages/extractor/src/spacing.ts` - Spacing tokens

**Steps:**
1. Extract color palette from computed styles
2. Identify typography stack (fonts, sizes, weights)
3. Analyze spacing patterns (margins, paddings)
4. Generate theme.json from extracted tokens

**Acceptance criteria:**
- [ ] Extract primary color palette (5-10 colors)
- [ ] Identify font families and sizes
- [ ] Generate valid theme.json

### 3.5 Reconstruction Pipeline

**Files to create:**
- `packages/migration/src/pipeline.ts` - Full migration pipeline
- `packages/migration/src/reconciler.ts` - Source-to-blocks reconciliation
- `packages/migration/src/validator.ts` - Output validation

**Steps:**
1. Orchestrate full pipeline: Crawl -> Analyze -> Classify -> Generate
2. Implement reconciliation loop for iterative improvement
3. Add visual diff comparison (source vs generated)
4. Build validation checks for output quality

**Acceptance criteria:**
- [ ] End-to-end migration from URL to WordPress
- [ ] Visual similarity score > 80%
- [ ] Handle 5+ source platforms (static HTML, Wix, Squarespace, Webflow, Shopify)

### 3.6 Migration UI

**Files to create:**
- `apps/web/src/pages/migrate.tsx` - Migration interface
- `apps/web/src/components/UrlInput.tsx` - URL input
- `apps/web/src/components/ComparisonView.tsx` - Side-by-side comparison

**Steps:**
1. Build URL input with validation
2. Create progress UI showing migration stages
3. Implement side-by-side comparison view
4. Add manual adjustment tools for corrections

**Acceptance criteria:**
- [ ] Input URL, see crawl progress
- [ ] Compare source and generated side-by-side
- [ ] Make manual corrections before deployment

---

## Phase 4: Production & Scaling (8-12 weeks)

**Goal:** Production-ready platform with managed hosting and multi-tenant architecture

### 4.1 Managed WordPress Hosting

**Components:**
- WordPress container orchestration (Kubernetes)
- Per-site isolation and resource limits
- Automated SSL via Let's Encrypt
- CDN integration (Cloudflare)
- Automated backups and restore

**Technology Choices:**
- **Container:** Docker with WordPress + PHP-FPM + Nginx
- **Orchestration:** Kubernetes with custom operator for WordPress
- **Database:** Managed MySQL/MariaDB (AWS RDS or equivalent)
- **Object Storage:** S3-compatible for media
- **CDN:** Cloudflare with page rules

### 4.2 Multi-Tenant Architecture

**Components:**
- Tenant isolation (database, files, containers)
- Usage metering and billing integration
- Admin dashboard for site management
- Resource quotas and limits

### 4.3 Performance Optimization

**Components:**
- Edge caching for generated sites
- Image optimization pipeline (automatic WebP, responsive sizes)
- Lazy loading implementation
- Core Web Vitals monitoring
- AI generation caching (reuse common patterns)

### 4.4 Security Hardening

**Components:**
- WordPress security baseline (hardened wp-config, disabled XML-RPC)
- WAF rules for common attacks
- Malware scanning integration
- Automated security updates
- Rate limiting for AI endpoints

### 4.5 Observability

**Components:**
- Structured logging (JSON logs to aggregator)
- Distributed tracing for AI pipelines
- Metrics dashboards (generation times, success rates)
- Alerting for failures and performance degradation

---

## Technology Recommendations

### AI/ML Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Primary LLM | Claude 3.5 Sonnet / Opus | Best structured output, long context, reliability |
| Fallback LLM | GPT-4 Turbo | Alternative for specific tasks, good at code |
| Image Generation | DALL-E 3 | High quality, good prompt following |
| Image Selection | Unsplash API | Free tier, high-quality photos |
| Embeddings | OpenAI text-embedding-3 | For semantic search, similarity |

### Backend Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| API Framework | FastAPI (Python) or Hono (TypeScript) | Fast, type-safe, good for AI workloads |
| Database | PostgreSQL | Reliable, good JSON support |
| Cache | Redis | Fast, pub/sub for real-time |
| Queue | BullMQ or Celery | Async job processing |
| Storage | S3-compatible | Scalable object storage |

### Frontend Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Framework | Next.js 14+ | React, SSR, API routes |
| Styling | Tailwind CSS | Utility-first, matches output style |
| State | Zustand or Jotai | Lightweight, React-native |
| Real-time | Socket.io or Ably | WebSocket with fallbacks |

### WordPress Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Theme | Custom block theme | Full site editing support |
| REST Extension | Custom plugin | Block manipulation endpoints |
| Authentication | Application passwords | Simple, secure |
| Block Library | Core blocks + custom | Maintainability |

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM output inconsistency | High | Medium | Structured outputs, validation, retry logic |
| Block grammar changes | Low | High | Abstract block layer, version pinning |
| WordPress API limitations | Medium | Medium | Custom plugin for missing endpoints |
| Migration accuracy | High | Medium | Human-in-loop review, iterative improvement |
| Performance at scale | Medium | High | Caching, queue-based generation |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM API costs | High | Medium | Caching, smaller models for simple tasks |
| WordPress ecosystem changes | Low | High | Stay current with Gutenberg roadmap |
| Competition (10Web, Durable, etc.) | High | Medium | Differentiate on Gutenberg-native, open architecture |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM provider outage | Low | High | Multi-provider fallback |
| Data loss | Low | Critical | Automated backups, disaster recovery |
| Security breach | Low | Critical | Security hardening, monitoring, audits |

---

## MVP Path: Fastest Route to Value

### Week 1-4: Skeleton

1. Set up monorepo with packages structure
2. Implement basic block serializer (10 core blocks)
3. Create structure agent with Claude
4. Build content agent for copy generation
5. Deploy to local WordPress instance

### Week 5-8: Integration

6. Add image generation/selection
7. Build simple web UI for prompt input
8. Implement WordPress REST deployment
9. Add preview functionality
10. End-to-end testing

### Week 9-10: Polish

11. Improve generation quality
12. Add error handling and retry logic
13. Basic styling and UX polish
14. Documentation
15. Alpha testing

**MVP Deliverable:** User enters business description, gets WordPress site deployed with 3-5 pages, custom content, and relevant images.

---

## Success Metrics

### Phase 1 (MVP)
- Generate site in < 3 minutes
- Deploy successfully > 95% of attempts
- User satisfaction > 7/10 on generated content

### Phase 2 (Editing)
- Edit latency < 500ms for preview
- Chat comprehension accuracy > 90%
- Edit success rate > 85%

### Phase 3 (Migration)
- Visual similarity > 80% on standardized test set
- Migration success > 90% for supported platforms
- Time to migrate < 5 minutes per page

### Phase 4 (Production)
- 99.9% uptime for hosted sites
- Core Web Vitals pass > 90% of sites
- Support 1000+ concurrent generations

---

## Open Questions

1. **Block library scope:** Start with core blocks only, or build custom blocks early?
   - Recommendation: Start with 15-20 core blocks, add custom blocks in Phase 2

2. **Hosting strategy:** Build hosting or partner?
   - Recommendation: Partner initially (Cloudways, Kinsta API), build later

3. **Pricing model:** Per-site, subscription, or usage-based?
   - Recommendation: Subscription with site limits (similar to 10Web)

4. **Open source components:** What to open source?
   - Recommendation: Block serializer and classification prompts (community contribution)

---

## Next Steps

1. **Architecture Review:** Validate architecture with team
2. **Prototype Sprint:** 2-week spike on block serializer + structure agent
3. **WordPress Testing:** Set up test WordPress instances
4. **LLM Evaluation:** Test Claude vs GPT-4 for each agent type
5. **UI Mockups:** Design the generation and editing interfaces

---

*Plan created by Plan Agent. Ready for review and implementation.*

---

## Pre-Mortem Risk Assessment

**Date:** 2026-01-11
**Mode:** Deep
**Decision:** Risks Accepted - Proceed with Implementation

### Identified Tigers (Accepted)

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | No circuit breaker or cost controls for AI APIs | HIGH | Accepted |
| 2 | No partial failure recovery in generation pipeline | HIGH | Accepted |
| 3 | Prompt injection vulnerability in AI layer | HIGH | Accepted |
| 4 | Migration accuracy with no fallback UX (20% failure cases) | HIGH | Accepted |
| 5 | No local development strategy defined | MEDIUM | Accepted |
| 6 | No timeout budget breakdown for 3-min target | MEDIUM | Accepted |

### Identified Elephants (Acknowledged)

1. LLM output non-determinism - testing/QA challenge
2. Team WordPress/PHP expertise - potential skill gap
3. Scope creep risk - 4 phases is extensive

### Recommendation

Address HIGH severity tigers early in Phase 1:
- Add cost controls in orchestration layer design
- Build checkpoint system into agent pipeline
- Include input sanitization in agent architecture

### Verification

Paper tigers verified as low-risk:
- Block grammar stability ✓
- WordPress API limitations ✓
- LLM provider outage (fallback exists) ✓

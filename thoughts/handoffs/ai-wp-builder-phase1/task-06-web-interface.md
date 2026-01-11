# Task 06: MVP Web Interface

## Checkpoints
<!-- Resumable state for kraken agent -->
**Task:** Build Next.js web application for site generation
**Started:** 2025-01-11T13:51:00Z
**Last Updated:** 2025-01-11T14:02:00Z

### Phase Status
- Phase 1 (Tests Written): VALIDATED (36 tests)
- Phase 2 (Implementation): VALIDATED (all files created)
- Phase 3 (Tests Passing): VALIDATED (36/36 passing)
- Phase 4 (Documentation): VALIDATED (handoff complete)

### Validation State
```json
{
  "test_count": 36,
  "tests_passing": 36,
  "files_created": [
    "apps/web/package.json",
    "apps/web/tsconfig.json",
    "apps/web/vitest.config.ts",
    "apps/web/tailwind.config.ts",
    "apps/web/postcss.config.js",
    "apps/web/next.config.js",
    "apps/web/next-env.d.ts",
    "apps/web/src/__tests__/setup.ts",
    "apps/web/src/__tests__/generator.test.ts",
    "apps/web/src/__tests__/PromptInput.test.tsx",
    "apps/web/src/__tests__/GenerationProgress.test.tsx",
    "apps/web/src/__tests__/Preview.test.tsx",
    "apps/web/src/lib/generator.ts",
    "apps/web/src/components/PromptInput.tsx",
    "apps/web/src/components/GenerationProgress.tsx",
    "apps/web/src/components/Preview.tsx",
    "apps/web/src/app/layout.tsx",
    "apps/web/src/app/globals.css",
    "apps/web/src/app/page.tsx",
    "apps/web/src/app/api/generate/route.ts"
  ],
  "last_test_command": "pnpm test",
  "last_test_exit_code": 0,
  "build_status": "success"
}
```

---

## Summary

Built the MVP web interface for the AI WordPress site generator using Next.js 14 with App Router, Tailwind CSS, and Server-Sent Events for streaming progress.

## Dependencies

- `@ai-wp/block-engine` - Block serialization (via serializeBlock)
- `@ai-wp/agents` - Structure, Content, Image agents
- `@ai-wp/deployer` - WordPress deployment

## Files Created

### Configuration
- `apps/web/package.json` - Next.js app config with workspace dependencies
- `apps/web/tsconfig.json` - TypeScript config for Next.js
- `apps/web/vitest.config.ts` - Vitest config with React plugin and jsdom
- `apps/web/tailwind.config.ts` - Tailwind CSS configuration
- `apps/web/postcss.config.js` - PostCSS configuration
- `apps/web/next.config.js` - Next.js config with transpilePackages

### Tests
- `src/__tests__/generator.test.ts` - Generator orchestration tests (9 tests)
- `src/__tests__/PromptInput.test.tsx` - Form input component tests (11 tests)
- `src/__tests__/GenerationProgress.test.tsx` - Progress display tests (7 tests)
- `src/__tests__/Preview.test.tsx` - Preview iframe tests (9 tests)

### Core Implementation
- `src/lib/generator.ts` - Orchestrates all agents (structure, content, image, deploy)
- `src/components/PromptInput.tsx` - Business description input form
- `src/components/GenerationProgress.tsx` - Step-by-step progress display
- `src/components/Preview.tsx` - Site preview with iframe and viewport toggles
- `src/app/layout.tsx` - Root layout with header
- `src/app/page.tsx` - Main page with state management
- `src/app/api/generate/route.ts` - SSE streaming API endpoint

## Test Results

```
Test Files  4 passed (4)
     Tests  36 passed (36)
```

All tests pass including:
- Generator orchestration with mocked agents
- Form validation and submission
- Progress step indicators
- Preview iframe rendering

## Features Implemented

### 1. Prompt Input Component
- Business name input
- Business description textarea (30 char minimum)
- Industry dropdown (11 options)
- Tone radio buttons (Professional, Friendly, Casual)
- Optional color preferences (primary/secondary)
- Form validation with error messages
- Loading state

### 2. Generation Pipeline
The `generator.ts` module orchestrates:
1. Structure Agent - Creates site structure from business description
2. Content Agent - Generates copywriting for each section
3. Image Agent - Selects/generates images for sections
4. Block Engine - Converts structure + content to WordPress blocks
5. Deployer (optional) - Deploys to WordPress

Uses async generators to yield progress events for real-time streaming.

### 3. Progress Display
- Step indicators (structure -> content -> images -> blocks -> deploy)
- Current step highlighted with animation
- Completed steps marked with checkmarks
- Error state with X icon
- Optional percentage progress bar

### 4. Preview Component
- Page tabs for multi-page sites
- Responsive viewport toggles (desktop/tablet/mobile)
- Block-to-HTML conversion for preview
- Deploy button
- Loading state

### 5. API Route (`/api/generate`)
- POST endpoint with Zod validation
- Server-Sent Events (SSE) streaming
- Mock generator for development/testing
- Error handling with proper HTTP responses

## Architecture

```
apps/web/
  src/
    __tests__/           # Vitest tests
    app/
      api/generate/      # API route
      layout.tsx         # Root layout
      page.tsx           # Main page
      globals.css        # Tailwind base
    components/
      PromptInput.tsx    # Form
      GenerationProgress.tsx  # Progress UI
      Preview.tsx        # Preview iframe
    lib/
      generator.ts       # Orchestration
```

## Notes

- The API route currently uses a mock generator for testing. In production, it should use the actual agents.
- The Preview component includes a simplified block-to-HTML converter. In production, this could use the actual WordPress block renderer.
- All workspace package dependencies are properly linked via `workspace:*`.

# Task 02: Structure Agent

## Checkpoints
<!-- Resumable state for kraken agent -->
**Task:** Build Structure Agent for AI website generation
**Started:** 2025-01-11T12:55:00Z
**Last Updated:** 2025-01-11T12:59:00Z

### Phase Status
- Phase 1 (Tests Written): VALIDATED (56 tests written)
- Phase 2 (Implementation): VALIDATED (all tests passing)
- Phase 3 (Build): VALIDATED (TypeScript compiles)
- Phase 4 (Documentation): VALIDATED (complete)

### Validation State
```json
{
  "test_count": 56,
  "tests_passing": 56,
  "files_modified": [
    "packages/agents/src/__tests__/schemas.test.ts",
    "packages/agents/src/__tests__/prompts.test.ts",
    "packages/agents/src/__tests__/client.test.ts",
    "packages/agents/src/__tests__/agent.test.ts",
    "packages/agents/src/structure/schemas.ts",
    "packages/agents/src/structure/prompts.ts",
    "packages/agents/src/structure/agent.ts",
    "packages/agents/src/client.ts",
    "packages/agents/src/types.ts",
    "packages/agents/src/index.ts",
    "packages/agents/package.json"
  ],
  "last_test_command": "cd /Users/cecvic/AiMT-Projects/tenweb/packages/agents && pnpm test",
  "last_test_exit_code": 0
}
```

## Summary

Successfully implemented the Structure Agent that generates website structures from business descriptions using Claude API.

## Files Created

### Source Files

1. **`packages/agents/src/types.ts`** - Shared agent types
   - `TokenUsage` - API usage tracking
   - `AgentResult<T>` - Generic result type
   - `AgentConfig` - Configuration options
   - `BusinessType` - Business category enum

2. **`packages/agents/src/client.ts`** - Claude API client wrapper
   - `createClaudeClient()` - Factory function
   - `ClaudeClient` interface with:
     - `generateStructuredOutput<T>()` - Zod schema validation
     - `generateText()` - Plain text generation
   - `ClaudeClientError` - Custom error class
   - Handles JSON extraction from markdown code blocks
   - API key from environment or explicit config

3. **`packages/agents/src/structure/schemas.ts`** - Zod output schemas
   - `SectionType` - enum: hero, features, cta, testimonials, gallery, contact, footer
   - Config schemas for each section type matching block-engine patterns:
     - `HeroConfigSchema` -> `createHeroPattern`
     - `FeaturesConfigSchema` -> `createFeaturesPattern`
     - `CtaConfigSchema` -> `createCtaPattern`
     - `TestimonialsConfigSchema` -> `createTestimonialsPattern`
     - `FooterConfigSchema` -> `createFooterPattern`
   - `PageSchema` - Page with slug, title, sections
   - `NavigationSchema` - Site navigation items
   - `ThemeConfigSchema` - Colors and typography
   - `SiteStructureSchema` - Complete output schema

4. **`packages/agents/src/structure/prompts.ts`** - System prompts
   - `buildSystemPrompt()` - Detailed instructions for Claude
     - JSON output format specification
     - Section type documentation
     - Color psychology guide
     - Font pairing suggestions
   - `buildUserPrompt()` - User message construction
   - `buildUserPromptWithHint()` - With business type hint
   - `SECTION_RECOMMENDATIONS` - Per-business-type section suggestions

5. **`packages/agents/src/structure/agent.ts`** - Main agent
   - `createStructureAgent(client)` - Factory function
   - `StructureAgent.generate(input)` - Main generation method
   - `validateSiteStructure()` - Schema validation utility
   - `extractSectionConfigs()` - Extract configs by section type

6. **`packages/agents/src/index.ts`** - Public exports

### Test Files

1. **`packages/agents/src/__tests__/schemas.test.ts`** - 20 tests
   - Section schema validation (hero, features, cta, testimonials, footer)
   - Page schema validation
   - Navigation schema validation
   - Theme config validation
   - Site structure validation

2. **`packages/agents/src/__tests__/prompts.test.ts`** - 11 tests
   - System prompt content verification
   - User prompt construction
   - Section recommendations

3. **`packages/agents/src/__tests__/client.test.ts`** - 11 tests
   - Client creation with API key
   - Structured output generation
   - JSON parsing and validation
   - Error handling
   - Usage stats

4. **`packages/agents/src/__tests__/agent.test.ts`** - 14 tests
   - Agent creation
   - Structure generation
   - Output validation against schema
   - Block-engine pattern compatibility
   - Error handling

## Integration with Block Engine

The agent output maps directly to block-engine patterns:

```typescript
// Agent generates:
{
  type: 'hero',
  config: {
    heading: 'Welcome',
    subheading: 'Hello world',
    buttonText: 'Learn More',
    buttonUrl: '/about'
  }
}

// Maps to:
import { createHeroPattern } from '@ai-wp/block-engine';
const block = createHeroPattern(section.config);
```

## Usage Example

```typescript
import { createClaudeClient, createStructureAgent } from '@ai-wp/agents';

// Create client with API key from ANTHROPIC_API_KEY env var
const client = createClaudeClient();

// Create structure agent
const agent = createStructureAgent(client);

// Generate site structure
const result = await agent.generate({
  businessDescription: 'A local bakery specializing in artisan bread and pastries',
});

if (result.success) {
  console.log(result.structure);
  // {
  //   pages: [{ slug: 'home', title: 'Home', sections: [...] }],
  //   theme: { colors: {...}, typography: {...} },
  //   navigation: { items: [...] }
  // }
}
```

## Dependencies Added

- `zod: ^3.22.0` - Schema validation

## Test Results

```
 Test Files  4 passed (4)
      Tests  56 passed (56)
```

## Next Steps

Task 3 (Page Generator) can now use this agent to:
1. Call `agent.generate()` with business description
2. Iterate over `result.structure.pages`
3. Map section configs to block-engine patterns
4. Generate WordPress blocks for each section

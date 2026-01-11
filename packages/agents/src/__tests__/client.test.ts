/**
 * Tests for Claude API client wrapper
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { createClaudeClient, ClaudeClient, ClaudeClientError } from '../client';

// Create a mock messages object
const mockMessagesCreate = vi.fn();

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockMessagesCreate,
      },
    })),
  };
});

describe('createClaudeClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should create client with API key from environment', () => {
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    const client = createClaudeClient();
    expect(client).toBeDefined();
    expect(client).toHaveProperty('generateStructuredOutput');
    expect(client).toHaveProperty('generateText');
  });

  it('should create client with explicit API key', () => {
    const client = createClaudeClient({ apiKey: 'explicit-key' });
    expect(client).toBeDefined();
  });

  it('should throw error if no API key provided', () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => createClaudeClient()).toThrow('ANTHROPIC_API_KEY');
  });

  it('should allow custom model selection', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const client = createClaudeClient({ model: 'claude-3-haiku-20240307' });
    expect(client).toBeDefined();
  });
});

describe('ClaudeClient.generateStructuredOutput', () => {
  const originalEnv = process.env;
  let client: ClaudeClient;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    // Set default mock response
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: 'Test',
            value: 42,
          }),
        },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    client = createClaudeClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should generate output matching schema', async () => {
    const TestSchema = z.object({
      name: z.string(),
      value: z.number(),
    });

    const result = await client.generateStructuredOutput({
      systemPrompt: 'You are a test assistant',
      userPrompt: 'Generate a test object',
      schema: TestSchema,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Test');
      expect(result.data.value).toBe(42);
    }
  });

  it('should return error for invalid JSON response', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const newClient = createClaudeClient();
    const TestSchema = z.object({ name: z.string() });

    const result = await newClient.generateStructuredOutput({
      systemPrompt: 'Test',
      userPrompt: 'Test',
      schema: TestSchema,
    });

    expect(result.success).toBe(false);
  });

  it('should return error for schema validation failure', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"wrong": "shape"}' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const newClient = createClaudeClient();
    const TestSchema = z.object({ name: z.string(), required: z.number() });

    const result = await newClient.generateStructuredOutput({
      systemPrompt: 'Test',
      userPrompt: 'Test',
      schema: TestSchema,
    });

    expect(result.success).toBe(false);
  });

  it('should include usage stats on success', async () => {
    const TestSchema = z.object({ name: z.string(), value: z.number() });

    const result = await client.generateStructuredOutput({
      systemPrompt: 'Test',
      userPrompt: 'Test',
      schema: TestSchema,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.usage).toBeDefined();
      expect(result.usage?.inputTokens).toBe(100);
      expect(result.usage?.outputTokens).toBe(50);
    }
  });
});

describe('ClaudeClient.generateText', () => {
  let client: ClaudeClient;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Generated text response' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 50, output_tokens: 25 },
    });

    client = createClaudeClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return generated text', async () => {
    const result = await client.generateText({
      systemPrompt: 'You are helpful',
      userPrompt: 'Say hello',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.text).toBe('Generated text response');
    }
  });
});

describe('ClaudeClientError', () => {
  it('should be an Error instance', () => {
    const error = new ClaudeClientError('Test error', 'API_ERROR');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('API_ERROR');
  });

  it('should preserve cause', () => {
    const cause = new Error('Original error');
    const error = new ClaudeClientError('Wrapped error', 'API_ERROR', cause);
    expect(error.cause).toBe(cause);
  });
});

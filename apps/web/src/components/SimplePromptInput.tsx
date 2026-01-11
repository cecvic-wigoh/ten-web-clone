'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { type PromptInputData } from './PromptInput';

// ============================================================================
// Types
// ============================================================================

export interface SimplePromptInputProps {
  onSubmit: (data: PromptInputData) => void;
  disabled?: boolean;
  loading?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_EXAMPLES = [
  'I need a website for my Italian restaurant with online reservations...',
  'Create a portfolio for a freelance photographer...',
  'Build a landing page for my SaaS product...',
  'I want a website for my local coffee shop with menu and hours...',
  'Design a professional site for my consulting business...',
];

const SUGGESTION_CHIPS = [
  { label: 'Coffee Shop', prompt: 'I need a modern website for my cozy coffee shop. We serve specialty coffee, homemade pastries, and have a welcoming atmosphere for remote workers and coffee lovers.' },
  { label: 'Portfolio', prompt: 'Create a stunning portfolio website for a creative professional showcasing my work, skills, and experience. I want it to be visually impressive and easy to navigate.' },
  { label: 'SaaS', prompt: 'Build a professional landing page for my SaaS product. It should highlight key features, pricing plans, and include a clear call-to-action for signups.' },
  { label: 'Restaurant', prompt: 'I want a beautiful website for my restaurant featuring our menu, location, hours, and online reservation system. We serve modern American cuisine in a casual upscale setting.' },
];

const PLACEHOLDER_ROTATION_INTERVAL = 3500;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract a business name from the prompt text.
 * Falls back to a generated name if none can be extracted.
 */
function extractBusinessName(prompt: string): string {
  // Try to find patterns like "my X", "for X", "called X"
  const patterns = [
    /(?:for|called|named)\s+(?:my\s+)?["']?([A-Za-z\s&'-]+?)["']?\s*(?:with|featuring|that|,|\.|$)/i,
    /(?:my|a|an)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:website|site|page|shop|restaurant|business|company|portfolio)/i,
    /website\s+for\s+(?:my\s+)?([A-Za-z\s&'-]+?)(?:,|\.|$|\s+with|\s+featuring)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Capitalize first letter of each word
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Fallback: generate a name based on keywords
  const keywords = ['shop', 'restaurant', 'cafe', 'portfolio', 'agency', 'consulting', 'business', 'company', 'studio'];
  for (const keyword of keywords) {
    if (prompt.toLowerCase().includes(keyword)) {
      return `My ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
    }
  }

  return 'My Website';
}

// ============================================================================
// Component
// ============================================================================

export function SimplePromptInput({
  onSubmit,
  disabled = false,
  loading = false,
}: SimplePromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotate placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, PLACEHOLDER_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please describe what kind of website you need');
      return;
    }

    const data: PromptInputData = {
      businessName: extractBusinessName(trimmedPrompt),
      businessDescription: trimmedPrompt,
      industry: 'other',
      tone: 'professional',
    };

    onSubmit(data);
  };

  const handleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    setError(null);
  };

  const isDisabled = disabled || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Prompt Textarea */}
      <div>
        <label htmlFor="prompt" className="sr-only">
          Describe your website
        </label>
        <textarea
          id="prompt"
          aria-label="Describe your website"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (error) setError(null);
          }}
          disabled={isDisabled}
          rows={5}
          className="block w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 transition-colors"
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleChipClick(chip.prompt)}
            disabled={isDisabled}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Website'}
        </button>
      </div>
    </form>
  );
}

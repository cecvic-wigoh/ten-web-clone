'use client';

import { useState, type FormEvent } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface PromptInputData {
  businessName: string;
  businessDescription: string;
  industry: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal' | 'playful';
  deploy?: boolean;
  colorPreferences?: {
    primary?: string;
    secondary?: string;
  };
}

export interface PromptInputProps {
  onSubmit: (data: PromptInputData) => void;
  disabled?: boolean;
  loading?: boolean;
  showColorPreferences?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const INDUSTRIES = [
  { value: '', label: 'Select an industry...' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'creative', label: 'Creative Agency' },
  { value: 'other', label: 'Other' },
];

const TONES = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
];

const MIN_DESCRIPTION_LENGTH = 30;

// ============================================================================
// Component
// ============================================================================

export function PromptInput({
  onSubmit,
  disabled = false,
  loading = false,
  showColorPreferences = false,
}: PromptInputProps) {
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState<PromptInputData['tone']>('professional');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (businessDescription.length < MIN_DESCRIPTION_LENGTH) {
      newErrors.businessDescription = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: PromptInputData = {
      businessName: businessName.trim(),
      businessDescription: businessDescription.trim(),
      industry: industry || 'other',
      tone,
      colorPreferences: showColorPreferences && (primaryColor || secondaryColor)
        ? {
            primary: primaryColor || undefined,
            secondary: secondaryColor || undefined,
          }
        : undefined,
    };

    onSubmit(data);
  };

  const isDisabled = disabled || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700"
        >
          Business Name
        </label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={isDisabled}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Acme Corporation"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
        )}
      </div>

      {/* Business Description */}
      <div>
        <label
          htmlFor="businessDescription"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="businessDescription"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          disabled={isDisabled}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Describe your business, what you offer, and who your target audience is..."
        />
        {errors.businessDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.businessDescription}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {businessDescription.length} / {MIN_DESCRIPTION_LENGTH} minimum characters
        </p>
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          className="block text-sm font-medium text-gray-700"
        >
          Industry
        </label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={isDisabled}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tone */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">
          Tone
        </legend>
        <div className="mt-2 space-y-2">
          {TONES.map((toneOption) => (
            <label
              key={toneOption.value}
              className="flex items-start"
            >
              <input
                type="radio"
                name="tone"
                value={toneOption.value}
                checked={tone === toneOption.value}
                onChange={(e) => setTone(e.target.value as PromptInputData['tone'])}
                disabled={isDisabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-700">
                  {toneOption.label}
                </span>
                <span className="block text-xs text-gray-500">
                  {toneOption.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Color Preferences (optional) */}
      {showColorPreferences && (
        <div className="space-y-4">
          <p className="block text-sm font-medium text-gray-700">
            Color Preferences (optional)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="primaryColor"
                className="block text-xs text-gray-500"
              >
                Primary Color
              </label>
              <input
                type="color"
                id="primaryColor"
                value={primaryColor || '#007bff'}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={isDisabled}
                className="mt-1 block h-10 w-full cursor-pointer rounded-md border-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="secondaryColor"
                className="block text-xs text-gray-500"
              >
                Secondary Color
              </label>
              <input
                type="color"
                id="secondaryColor"
                value={secondaryColor || '#6c757d'}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={isDisabled}
                className="mt-1 block h-10 w-full cursor-pointer rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Website'}
        </button>
      </div>
    </form>
  );
}

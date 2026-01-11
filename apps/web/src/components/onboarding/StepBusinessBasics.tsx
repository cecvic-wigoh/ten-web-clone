'use client';

import { useOnboarding } from '@/hooks/useOnboarding';

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

const MIN_DESCRIPTION_LENGTH = 30;

export function StepBusinessBasics() {
  const { data, updateData } = useOnboarding();

  const descriptionLength = data.businessDescription?.length || 0;
  const isDescriptionValid = descriptionLength >= MIN_DESCRIPTION_LENGTH;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Tell Us About Your Business
        </h3>
        <p className="mt-2 text-gray-600">
          This information helps us create the perfect website for you
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            value={data.businessName || ''}
            onChange={(e) => updateData({ businessName: e.target.value })}
            placeholder="e.g., Acme Corporation"
            className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="businessDescription"
            value={data.businessDescription || ''}
            onChange={(e) => updateData({ businessDescription: e.target.value })}
            rows={4}
            placeholder="Describe your business, what you offer, and who your target audience is..."
            className={`
              mt-1 block w-full rounded-lg border-2 px-4 py-3 transition-colors
              focus:border-blue-500 focus:ring-blue-500
              ${!isDescriptionValid && descriptionLength > 0 ? 'border-orange-300' : 'border-gray-200'}
            `}
          />
          <p className={`mt-1 text-sm ${isDescriptionValid ? 'text-green-600' : 'text-gray-500'}`}>
            {descriptionLength} / {MIN_DESCRIPTION_LENGTH} minimum characters
            {isDescriptionValid && ' ✓'}
          </p>
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            id="industry"
            value={data.industry || ''}
            onChange={(e) => updateData({ industry: e.target.value })}
            className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 transition-colors"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

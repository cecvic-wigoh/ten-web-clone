'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import { type PromptInputData } from '@/components/PromptInput';

const TONES: { value: PromptInputData['tone']; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
];

const PAGE_COUNTS = [1, 2, 3, 4, 5];

export function StepContentPreferences() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Content Preferences
        </h3>
        <p className="mt-2 text-gray-600">
          Set the tone and scope of your website
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tone of Voice
          </label>
          <div className="space-y-2">
            {TONES.map((tone) => (
              <label
                key={tone.value}
                className={`
                  flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${data.tone === tone.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="tone"
                  value={tone.value}
                  checked={data.tone === tone.value}
                  onChange={() => updateData({ tone: tone.value })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">{tone.label}</span>
                  <span className="ml-2 text-sm text-gray-500">{tone.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Pages
          </label>
          <div className="flex gap-3">
            {PAGE_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => updateData({ pageCount: count })}
                className={`
                  flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all
                  ${data.pageCount === count
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Recommended: 1-3 pages for simple sites, 4-5 for comprehensive sites
          </p>
        </div>
      </div>
    </div>
  );
}

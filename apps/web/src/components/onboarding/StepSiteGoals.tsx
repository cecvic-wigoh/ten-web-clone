'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import { type SiteGoal, SITE_GOALS } from '@/types/onboarding';

export function StepSiteGoals() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          What's Your Primary Goal?
        </h3>
        <p className="mt-2 text-gray-600">
          This helps us choose the right sections for your website
        </p>
      </div>

      <div className="space-y-3">
        {SITE_GOALS.map((goal) => (
          <label
            key={goal.value}
            className={`
              flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all
              ${data.siteGoal === goal.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="radio"
              name="siteGoal"
              value={goal.value}
              checked={data.siteGoal === goal.value}
              onChange={() => updateData({ siteGoal: goal.value as SiteGoal })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900">{goal.label}</div>
              <div className="text-sm text-gray-600">{goal.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

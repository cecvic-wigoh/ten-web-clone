'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import {
  type DesignDirection,
  DESIGN_DIRECTIONS,
} from '@/types/onboarding';

export function StepDesignDirection() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Choose Your Design Direction
        </h3>
        <p className="mt-2 text-gray-600">
          Select a visual style that best represents your brand
        </p>
      </div>

      <div className="grid gap-4">
        {DESIGN_DIRECTIONS.map((direction) => (
          <button
            key={direction.value}
            type="button"
            onClick={() => updateData({ designDirection: direction.value as DesignDirection })}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all
              ${data.designDirection === direction.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="font-medium text-gray-900">{direction.label}</div>
            <div className="mt-1 text-sm text-gray-600">{direction.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

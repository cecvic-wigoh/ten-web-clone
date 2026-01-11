'use client';

import { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

export function StepOptionalDetails() {
  const { data, updateData } = useOnboarding();
  const [servicesInput, setServicesInput] = useState('');

  const handleAddService = () => {
    if (!servicesInput.trim()) return;
    const current = data.services || [];
    updateData({ services: [...current, servicesInput.trim()] });
    setServicesInput('');
  };

  const handleRemoveService = (index: number) => {
    const current = data.services || [];
    updateData({ services: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Optional Details
        </h3>
        <p className="mt-2 text-gray-600">
          Add extra details to personalize your website (all optional)
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
            Tagline or Slogan
          </label>
          <input
            type="text"
            id="tagline"
            value={data.tagline || ''}
            onChange={(e) => updateData({ tagline: e.target.value })}
            placeholder="e.g., Your success is our mission"
            className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services or Products
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
              placeholder="Add a service and press Enter"
              className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddService}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
          {data.services && data.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.services.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <input
            type="text"
            id="targetAudience"
            value={data.targetAudience || ''}
            onChange={(e) => updateData({ targetAudience: e.target.value })}
            placeholder="e.g., Small business owners, tech startups"
            className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Color Preferences (optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primaryColor" className="block text-xs text-gray-500 mb-1">
                Primary Color
              </label>
              <input
                type="color"
                id="primaryColor"
                value={data.colorPreferences?.primary || '#3b82f6'}
                onChange={(e) => updateData({
                  colorPreferences: { ...data.colorPreferences, primary: e.target.value }
                })}
                className="h-10 w-full cursor-pointer rounded-lg border-2 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="secondaryColor" className="block text-xs text-gray-500 mb-1">
                Secondary Color
              </label>
              <input
                type="color"
                id="secondaryColor"
                value={data.colorPreferences?.secondary || '#64748b'}
                onChange={(e) => updateData({
                  colorPreferences: { ...data.colorPreferences, secondary: e.target.value }
                })}
                className="h-10 w-full cursor-pointer rounded-lg border-2 border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

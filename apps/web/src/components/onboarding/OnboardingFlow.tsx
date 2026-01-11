'use client';

import { type FormEvent } from 'react';
import { OnboardingProvider, useOnboarding } from '@/hooks/useOnboarding';
import { type OnboardingData, ONBOARDING_STEPS } from '@/types/onboarding';
import { StepBusinessBasics } from './StepBusinessBasics';
import { StepDesignDirection } from './StepDesignDirection';
import { StepSiteGoals } from './StepSiteGoals';
import { StepContentPreferences } from './StepContentPreferences';
import { StepOptionalDetails } from './StepOptionalDetails';

interface OnboardingFlowProps {
  onSubmit: (data: OnboardingData) => void;
  disabled?: boolean;
  loading?: boolean;
}

function OnboardingContent({ onSubmit, disabled = false, loading = false }: OnboardingFlowProps) {
  const { currentStep, nextStep, prevStep, getData, canProceed, isComplete } = useOnboarding();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isComplete()) {
      const data = getData() as OnboardingData;
      onSubmit(data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepBusinessBasics />;
      case 2: return <StepDesignDirection />;
      case 3: return <StepSiteGoals />;
      case 4: return <StepContentPreferences />;
      case 5: return <StepOptionalDetails />;
      default: return null;
    }
  };

  const isLastStep = currentStep === 5;
  const isDisabled = disabled || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-center gap-2">
        {ONBOARDING_STEPS.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentStep === step.step
                  ? 'bg-blue-600 text-white'
                  : currentStep > step.step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {currentStep > step.step ? '✓' : step.step}
            </div>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${currentStep > step.step ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1 || isDisabled}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="submit"
            disabled={!isComplete() || isDisabled}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Website'}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed() || isDisabled}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
}

export function OnboardingFlow(props: OnboardingFlowProps) {
  return (
    <OnboardingProvider>
      <OnboardingContent {...props} />
    </OnboardingProvider>
  );
}

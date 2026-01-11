'use client';

import {
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { type OnboardingData, type OnboardingStep } from '@/types/onboarding';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  getData: () => Partial<OnboardingData>;
  canProceed: () => boolean;
  isComplete: () => boolean;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const DEFAULT_DATA: Partial<OnboardingData> = {
  tone: 'professional',
  industry: 'other',
  pageCount: 1,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<Partial<OnboardingData>>(DEFAULT_DATA);

  const validateStep = useCallback(
    (step: OnboardingStep): boolean => {
      switch (step) {
        case 1:
          return !!(
            data.businessName?.trim() &&
            data.businessDescription?.trim() &&
            data.businessDescription.length >= 30
          );
        case 2:
          return !!data.designDirection;
        case 3:
          return !!data.siteGoal;
        case 4:
          return !!data.tone;
        case 5:
          return true;
        default:
          return false;
      }
    },
    [data]
  );

  const canProceed = useCallback((): boolean => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  const nextStep = useCallback((): boolean => {
    if (!canProceed()) return false;
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      return true;
    }
    return false;
  }, [currentStep, canProceed]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      if (step < currentStep) {
        setCurrentStep(step);
        return;
      }
      if (step === currentStep + 1 && canProceed()) {
        setCurrentStep(step);
      }
    },
    [currentStep, canProceed]
  );

  const updateData = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const getData = useCallback((): Partial<OnboardingData> => {
    return data;
  }, [data]);

  const isComplete = useCallback((): boolean => {
    return (
      validateStep(1) &&
      validateStep(2) &&
      validateStep(3) &&
      validateStep(4)
    );
  }, [validateStep]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setData(DEFAULT_DATA);
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      data,
      nextStep,
      prevStep,
      goToStep,
      updateData,
      getData,
      canProceed,
      isComplete,
      reset,
    }),
    [
      currentStep,
      data,
      nextStep,
      prevStep,
      goToStep,
      updateData,
      getData,
      canProceed,
      isComplete,
      reset,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

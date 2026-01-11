'use client';

// ============================================================================
// Types
// ============================================================================

export type GenerationStep =
  | 'structure'
  | 'content'
  | 'images'
  | 'blocks'
  | 'deploy';

export interface GenerationProgressProps {
  currentStep: GenerationStep;
  steps: GenerationStep[];
  message?: string;
  error?: string;
  progress?: number;
}

// ============================================================================
// Constants
// ============================================================================

const STEP_LABELS: Record<GenerationStep, string> = {
  structure: 'Structure',
  content: 'Content',
  images: 'Images',
  blocks: 'Blocks',
  deploy: 'Deploy',
};

const STEP_ICONS: Record<GenerationStep, string> = {
  structure: 'layout',
  content: 'file-text',
  images: 'image',
  blocks: 'box',
  deploy: 'upload-cloud',
};

// ============================================================================
// Component
// ============================================================================

export function GenerationProgress({
  currentStep,
  steps,
  message,
  error,
  progress,
}: GenerationProgressProps) {
  const currentIndex = steps.indexOf(currentStep);

  const getStepStatus = (step: GenerationStep, index: number) => {
    if (error && step === currentStep) {
      return 'error';
    }
    if (index < currentIndex) {
      return 'completed';
    }
    if (index === currentIndex) {
      return 'active';
    }
    return 'pending';
  };

  const getStepClasses = (status: string) => {
    const base = 'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200';

    switch (status) {
      case 'completed':
        return `${base} bg-green-500 border-green-500 text-white`;
      case 'active':
        return `${base} bg-blue-500 border-blue-500 text-white animate-pulse`;
      case 'error':
        return `${base} bg-red-500 border-red-500 text-white`;
      default:
        return `${base} bg-gray-100 border-gray-300 text-gray-400`;
    }
  };

  return (
    <div className="w-full">
      {/* Progress bar (if percentage provided) */}
      {typeof progress === 'number' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  data-testid={`step-${step}`}
                  className={`${getStepClasses(status)} ${status}`}
                >
                  {status === 'completed' ? (
                    <CheckIcon />
                  ) : status === 'error' ? (
                    <XIcon />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    status === 'active' || status === 'completed'
                      ? 'text-gray-900'
                      : status === 'error'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {(message || error) && (
        <div className="mt-4 text-center">
          <p
            className={`text-sm ${
              error ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {error || message}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { PromptInput, type PromptInputData } from '@/components/PromptInput';
import { GenerationProgress, type GenerationStep } from '@/components/GenerationProgress';
import { Preview, type PreviewPage } from '@/components/Preview';

// ============================================================================
// Types
// ============================================================================

type AppState = 'input' | 'generating' | 'preview';

interface GenerationState {
  currentStep: GenerationStep;
  message: string;
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('input');
  const [generationState, setGenerationState] = useState<GenerationState>({
    currentStep: 'structure',
    message: '',
  });
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([]);
  const [inputData, setInputData] = useState<PromptInputData | null>(null);

  const handleSubmit = useCallback(async (data: PromptInputData) => {
    setInputData(data);
    setAppState('generating');
    setGenerationState({ currentStep: 'structure', message: 'Starting generation...' });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'progress':
                setGenerationState({
                  currentStep: event.step,
                  message: event.message,
                });
                break;

              case 'preview':
                setPreviewPages(event.blocks);
                setAppState('preview');
                break;

              case 'complete':
                setPreviewPages(event.result?.pages || []);
                setAppState('preview');
                break;

              case 'error':
                setGenerationState({
                  currentStep: event.step || 'structure',
                  message: event.message,
                  error: event.message,
                });
                break;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      setGenerationState({
        currentStep: 'structure',
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const handleDeploy = useCallback(async () => {
    if (!inputData) return;

    setAppState('generating');
    setGenerationState({ currentStep: 'deploy', message: 'Deploying to WordPress...' });

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: previewPages,
          businessName: inputData.businessName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deployment failed');
      }

      const result = await response.json();

      // Show success
      setGenerationState({
        currentStep: 'deploy',
        message: `Deployed successfully! View at: ${result.siteUrl}`
      });

      // Open the deployed site in a new tab
      if (result.siteUrl) {
        window.open(result.siteUrl, '_blank');
      }

      setAppState('preview');
    } catch (error) {
      setGenerationState({
        currentStep: 'deploy',
        message: error instanceof Error ? error.message : 'Deployment failed',
        error: error instanceof Error ? error.message : 'Deployment failed',
      });
    }
  }, [inputData, previewPages]);

  const handleReset = useCallback(() => {
    setAppState('input');
    setPreviewPages([]);
    setInputData(null);
    setGenerationState({ currentStep: 'structure', message: '' });
  }, []);

  // Determine which steps to show
  const steps: GenerationStep[] = inputData?.deploy !== undefined
    ? ['structure', 'content', 'images', 'blocks', 'deploy']
    : ['structure', 'content', 'images', 'blocks'];

  return (
    <div className="space-y-8">
      {appState === 'input' && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Website
            </h2>
            <p className="text-gray-600">
              Describe your business and let AI generate a professional WordPress
              website for you.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <PromptInput onSubmit={handleSubmit} showColorPreferences />
          </div>
        </div>
      )}

      {appState === 'generating' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Generating Your Website
            </h2>
            <GenerationProgress
              currentStep={generationState.currentStep}
              steps={steps}
              message={generationState.message}
              error={generationState.error}
            />
            {generationState.error && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {appState === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Website Preview
            </h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[700px]">
            <Preview pages={previewPages} onDeploy={handleDeploy} />
          </div>
        </div>
      )}
    </div>
  );
}

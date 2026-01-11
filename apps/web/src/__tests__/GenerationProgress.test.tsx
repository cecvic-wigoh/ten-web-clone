/**
 * Tests for GenerationProgress component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationProgress, type GenerationStep } from '@/components/GenerationProgress';

describe('GenerationProgress', () => {
  const allSteps: GenerationStep[] = ['structure', 'content', 'images', 'blocks', 'deploy'];

  it('should render all step indicators', () => {
    render(<GenerationProgress currentStep="structure" steps={allSteps} />);

    expect(screen.getByText(/structure/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
    expect(screen.getByText(/images/i)).toBeInTheDocument();
    expect(screen.getByText(/blocks/i)).toBeInTheDocument();
    expect(screen.getByText(/deploy/i)).toBeInTheDocument();
  });

  it('should highlight current step', () => {
    render(<GenerationProgress currentStep="content" steps={allSteps} />);

    const contentStep = screen.getByTestId('step-content');
    expect(contentStep).toHaveClass('active');
  });

  it('should mark completed steps', () => {
    render(<GenerationProgress currentStep="images" steps={allSteps} />);

    const structureStep = screen.getByTestId('step-structure');
    const contentStep = screen.getByTestId('step-content');
    const imagesStep = screen.getByTestId('step-images');

    expect(structureStep).toHaveClass('completed');
    expect(contentStep).toHaveClass('completed');
    expect(imagesStep).toHaveClass('active');
  });

  it('should display status message', () => {
    render(
      <GenerationProgress
        currentStep="content"
        steps={allSteps}
        message="Generating content for home page..."
      />
    );

    expect(screen.getByText(/generating content for home page/i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    render(
      <GenerationProgress
        currentStep="content"
        steps={allSteps}
        error="Failed to generate content"
      />
    );

    const contentStep = screen.getByTestId('step-content');
    expect(contentStep).toHaveClass('error');
    expect(screen.getByText(/failed to generate content/i)).toBeInTheDocument();
  });

  it('should not render deploy step when showDeploy is false', () => {
    const stepsNoDeploy: GenerationStep[] = ['structure', 'content', 'images', 'blocks'];
    render(<GenerationProgress currentStep="structure" steps={stepsNoDeploy} />);

    expect(screen.queryByTestId('step-deploy')).not.toBeInTheDocument();
  });

  it('should show percentage progress when provided', () => {
    render(<GenerationProgress currentStep="content" steps={allSteps} progress={45} />);

    expect(screen.getByText('45%')).toBeInTheDocument();
  });
});

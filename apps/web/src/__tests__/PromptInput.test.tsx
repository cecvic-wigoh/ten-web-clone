/**
 * Tests for PromptInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from '@/components/PromptInput';

describe('PromptInput', () => {
  it('should render business name input', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
  });

  it('should render business description textarea', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should render industry dropdown', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
  });

  it('should render tone radio buttons', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/professional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/friendly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/casual/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<PromptInput onSubmit={handleSubmit} />);

    const validDescription = 'A great business that provides excellent services to customers worldwide';
    await user.type(screen.getByLabelText(/business name/i), 'My Business');
    await user.type(screen.getByLabelText(/description/i), validDescription);
    await user.selectOptions(screen.getByLabelText(/industry/i), 'technology');
    await user.click(screen.getByLabelText(/professional/i));
    await user.click(screen.getByRole('button', { name: /generate/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      businessName: 'My Business',
      businessDescription: validDescription,
      industry: 'technology',
      tone: 'professional',
      colorPreferences: undefined,
    });
  });

  it('should show validation error when business name is empty', async () => {
    const user = userEvent.setup();
    render(<PromptInput onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /generate/i }));

    expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
  });

  it('should show validation error when description is too short', async () => {
    const user = userEvent.setup();
    render(<PromptInput onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/business name/i), 'My Business');
    await user.type(screen.getByLabelText(/description/i), 'Too short');
    await user.click(screen.getByRole('button', { name: /generate/i }));

    expect(screen.getByText(/description must be at least/i)).toBeInTheDocument();
  });

  it('should disable submit button when disabled prop is true', () => {
    render(<PromptInput onSubmit={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled();
  });

  it('should show loading state when loading prop is true', () => {
    render(<PromptInput onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole('button')).toHaveTextContent(/generating/i);
  });

  it('should render optional color preference inputs', () => {
    render(<PromptInput onSubmit={vi.fn()} showColorPreferences={true} />);
    expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/secondary color/i)).toBeInTheDocument();
  });
});

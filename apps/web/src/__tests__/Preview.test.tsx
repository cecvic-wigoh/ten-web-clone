/**
 * Tests for Preview component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Preview, type PreviewPage } from '@/components/Preview';

describe('Preview', () => {
  const mockPages: PreviewPage[] = [
    { slug: 'home', title: 'Home', blocks: '<!-- wp:paragraph --><p>Welcome</p><!-- /wp:paragraph -->' },
    { slug: 'about', title: 'About', blocks: '<!-- wp:paragraph --><p>About us</p><!-- /wp:paragraph -->' },
    { slug: 'contact', title: 'Contact', blocks: '<!-- wp:paragraph --><p>Contact us</p><!-- /wp:paragraph -->' },
  ];

  it('should render page tabs for multi-page sites', () => {
    render(<Preview pages={mockPages} />);

    expect(screen.getByRole('tab', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /contact/i })).toBeInTheDocument();
  });

  it('should show first page by default', () => {
    render(<Preview pages={mockPages} />);

    const homeTab = screen.getByRole('tab', { name: /home/i });
    expect(homeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to selected page when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<Preview pages={mockPages} />);

    await user.click(screen.getByRole('tab', { name: /about/i }));

    const aboutTab = screen.getByRole('tab', { name: /about/i });
    expect(aboutTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should render iframe with page content', () => {
    render(<Preview pages={mockPages} />);

    const iframe = screen.getByTestId('preview-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('srcDoc');
  });

  it('should not render tabs for single-page sites', () => {
    render(<Preview pages={[mockPages[0]]} />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('should display loading state when loading prop is true', () => {
    render(<Preview pages={mockPages} loading={true} />);

    expect(screen.getByTestId('preview-loading')).toBeInTheDocument();
  });

  it('should display empty state when no pages', () => {
    render(<Preview pages={[]} />);

    expect(screen.getByText(/no preview available/i)).toBeInTheDocument();
  });

  it('should call onDeploy when deploy button is clicked', async () => {
    const user = userEvent.setup();
    const handleDeploy = vi.fn();
    render(<Preview pages={mockPages} onDeploy={handleDeploy} />);

    await user.click(screen.getByRole('button', { name: /deploy/i }));

    expect(handleDeploy).toHaveBeenCalled();
  });

  it('should support device viewport toggle', async () => {
    const user = userEvent.setup();
    render(<Preview pages={mockPages} />);

    const mobileButton = screen.getByRole('button', { name: /mobile/i });
    await user.click(mobileButton);

    const iframe = screen.getByTestId('preview-iframe');
    expect(iframe).toHaveClass('mobile-view');
  });
});

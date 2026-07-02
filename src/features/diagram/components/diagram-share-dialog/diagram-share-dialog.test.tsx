import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/test/render';

import { DiagramShareDialog } from './diagram-share-dialog';

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  isPublic: true,
  pending: false,
  shareUrl: 'http://localhost:3000/share/d1',
  onToggle: vi.fn(),
  onCopy: vi.fn(),
};

describe('DiagramShareDialog', () => {
  it('renders the title', () => {
    render(<DiagramShareDialog {...baseProps} />);
    expect(screen.getByText('Share diagram')).toBeInTheDocument();
  });

  it('shows the switch checked and the share link enabled when public', () => {
    render(<DiagramShareDialog {...baseProps} />);
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByLabelText('Share link')).toHaveValue('http://localhost:3000/share/d1');
    expect(screen.getByLabelText('Share link')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Copy share link' })).toBeEnabled();
  });

  it('disables the link and copy button when private', () => {
    render(<DiagramShareDialog {...baseProps} isPublic={false} />);
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByLabelText('Share link')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy share link' })).toBeDisabled();
  });

  it('calls onToggle when the switch is clicked', async () => {
    const onToggle = vi.fn();
    render(<DiagramShareDialog {...baseProps} isPublic={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onCopy when the copy button is clicked', async () => {
    const onCopy = vi.fn();
    render(<DiagramShareDialog {...baseProps} onCopy={onCopy} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy share link' }));
    expect(onCopy).toHaveBeenCalled();
  });

  it('disables the switch while pending', () => {
    render(<DiagramShareDialog {...baseProps} pending={true} />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});

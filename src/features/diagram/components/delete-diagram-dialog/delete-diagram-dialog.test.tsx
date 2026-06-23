import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { type DiagramCardData } from '@/features/diagram/types';

import { DeleteDiagramDialog } from './delete-diagram-dialog';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: null,
  tags: [],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
};

describe('DeleteDiagramDialog', () => {
  test('shows title in the confirmation message', () => {
    render(<DeleteDiagramDialog diagram={diagram} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(/Login Flow/)).toBeInTheDocument();
  });

  test('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteDiagramDialog diagram={diagram} onCancel={onCancel} onConfirm={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  test('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteDiagramDialog diagram={diagram} onCancel={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('does not render when diagram is null', () => {
    render(<DeleteDiagramDialog diagram={null} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

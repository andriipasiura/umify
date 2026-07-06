import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  updateDiagramMeta: vi.fn().mockResolvedValue({ ok: true, data: { id: 'd1' } }),
}));

import { type DiagramCardData } from '@/features/diagram/types';

import { EditDiagramModal } from './edit-diagram-modal';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: 'web app',
  tags: ['auth'],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  thumbnail: null,
};

describe('EditDiagramModal', () => {
  test('renders dialog with pre-filled title when diagram is provided', () => {
    render(<EditDiagramModal diagram={diagram} onOpenChange={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Login Flow')).toBeInTheDocument();
  });

  test('does not render when diagram is null', () => {
    render(<EditDiagramModal diagram={null} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

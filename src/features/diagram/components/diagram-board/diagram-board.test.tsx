import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from '@/test/render';

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  createDiagram: vi.fn().mockResolvedValue({ ok: true, data: { id: 'new_id' } }),
  updateDiagramMeta: vi.fn().mockResolvedValue({ ok: true, data: { id: 'd1' } }),
  deleteDiagram: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
  toggleFavorite: vi.fn().mockResolvedValue({ ok: true, data: { isFavorite: true } }),
}));

import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramBoard } from './diagram-board';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: null,
  tags: [],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
};

describe('DiagramBoard', () => {
  test('renders diagrams', () => {
    render(<DiagramBoard diagrams={[diagram]} />);
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
  });

  test('create card opens the create modal', async () => {
    const user = userEvent.setup();
    render(<DiagramBoard diagrams={[]} />);

    await user.click(screen.getByRole('button', { name: 'Create Diagram' }));
    expect(screen.getByRole('dialog', { name: 'Create Diagram' })).toBeInTheDocument();
  });

  test('create card is always enabled', () => {
    render(<DiagramBoard diagrams={[]} />);
    expect(screen.getByRole('button', { name: 'Create Diagram' })).not.toBeDisabled();
  });
});

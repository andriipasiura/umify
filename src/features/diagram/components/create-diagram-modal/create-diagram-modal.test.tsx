import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  createDiagram: vi.fn().mockResolvedValue({ ok: true, data: { id: 'new_id' } }),
}));

import { CreateDiagramModal } from './create-diagram-modal';

describe('CreateDiagramModal', () => {
  test('renders the dialog when open', () => {
    render(<CreateDiagramModal open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Diagram')).toBeInTheDocument();
  });

  test('does not render the dialog when closed', () => {
    render(<CreateDiagramModal open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramGrid } from './diagram-grid';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: 'web app',
  tags: ['auth'],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  thumbnailLight: null,
  thumbnailDark: null,
};

describe('DiagramGrid', () => {
  test('always renders the create card first', () => {
    render(<DiagramGrid diagrams={[diagram]} />);
    expect(screen.getByRole('button', { name: 'Create Diagram' })).toBeInTheDocument();
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
  });

  test('shows the empty state when there are no diagrams', () => {
    render(<DiagramGrid diagrams={[]} />);
    expect(screen.getByText('No diagrams match your filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Diagram' })).toBeInTheDocument();
  });

  test('renders a custom createCard slot', () => {
    render(<DiagramGrid diagrams={[]} createCard={<button>Custom Create</button>} />);
    expect(screen.getByText('Custom Create')).toBeInTheDocument();
  });
});

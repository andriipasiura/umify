import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramCard } from './diagram-card';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: 'web app',
  tags: ['auth', 'login'],
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
};

describe('DiagramCard', () => {
  test('renders the title, visibility, category, and tags', () => {
    render(<DiagramCard diagram={diagram} />);

    expect(screen.getByText('Login Flow')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('web app')).toBeInTheDocument();
    expect(screen.getByText('#auth')).toBeInTheDocument();
    expect(screen.getByText('#login')).toBeInTheDocument();
  });

  test('omits the category badge when category is null', () => {
    render(<DiagramCard diagram={{ ...diagram, category: null }} />);
    expect(screen.queryByText('web app')).not.toBeInTheDocument();
  });

  test('exposes an actions trigger labelled by the diagram title', () => {
    render(<DiagramCard diagram={diagram} />);
    expect(screen.getByRole('button', { name: 'Actions for Login Flow' })).toBeInTheDocument();
  });
});

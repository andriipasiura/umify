import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramCard } from './diagram-card';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: 'web app',
  tags: ['auth', 'login'],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  thumbnail: null,
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

  test('calls onEdit when provided via the actions menu', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<DiagramCard diagram={diagram} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Login Flow' }));
    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
  });

  test('shows filled star when isFavorite is true', () => {
    render(<DiagramCard diagram={{ ...diagram, isFavorite: true }} />);
    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument();
  });

  test('shows the decorative mark and no image when thumbnail is null', () => {
    render(<DiagramCard diagram={diagram} />);
    const openLink = screen.getByRole('link', { name: 'Open Login Flow' });

    expect(openLink.querySelector('img')).not.toBeInTheDocument();
    expect(openLink.querySelector('svg')).toBeInTheDocument();
  });

  test('renders the thumbnail image when present', () => {
    const thumbnail = 'data:image/png;base64,abc';
    render(<DiagramCard diagram={{ ...diagram, thumbnail }} />);
    const openLink = screen.getByRole('link', { name: 'Open Login Flow' });

    expect(openLink.querySelector('img')).toHaveAttribute('src', thumbnail);
    expect(openLink.querySelector('svg')).not.toBeInTheDocument();
  });

  test('calls onToggleFavorite when the star button is clicked', async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    render(
      <DiagramCard
        diagram={{ ...diagram, isFavorite: true }}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }));
    expect(onToggleFavorite).toHaveBeenCalled();
  });
});

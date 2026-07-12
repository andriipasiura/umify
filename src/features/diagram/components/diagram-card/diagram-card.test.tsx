import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramCard } from './diagram-card';

const { useThemeModeMock } = vi.hoisted(() => ({
  useThemeModeMock: vi.fn(),
}));

vi.mock('@/hooks/use-theme-mode', () => ({ useThemeMode: useThemeModeMock }));

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: 'web app',
  tags: ['auth', 'login'],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  thumbnailLight: null,
  thumbnailDark: null,
};

describe('DiagramCard', () => {
  beforeEach(() => {
    useThemeModeMock.mockReset().mockReturnValue({ isDark: false, mounted: true, toggle: vi.fn() });
  });

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

  test('renders the light thumbnail in light mode', () => {
    const thumbnailLight = 'data:image/png;base64,light';
    render(
      <DiagramCard
        diagram={{ ...diagram, thumbnailLight, thumbnailDark: 'data:image/png;base64,dark' }}
      />,
    );
    const openLink = screen.getByRole('link', { name: 'Open Login Flow' });

    expect(openLink.querySelector('img')).toHaveAttribute('src', thumbnailLight);
    expect(openLink.querySelector('svg')).not.toBeInTheDocument();
  });

  test('renders the dark thumbnail in dark mode', () => {
    useThemeModeMock.mockReturnValue({ isDark: true, mounted: true, toggle: vi.fn() });
    const thumbnailDark = 'data:image/png;base64,dark';
    render(
      <DiagramCard
        diagram={{ ...diagram, thumbnailLight: 'data:image/png;base64,light', thumbnailDark }}
      />,
    );
    const openLink = screen.getByRole('link', { name: 'Open Login Flow' });

    expect(openLink.querySelector('img')).toHaveAttribute('src', thumbnailDark);
  });

  test('falls back to the other scheme thumbnail when the matching one is missing', () => {
    useThemeModeMock.mockReturnValue({ isDark: true, mounted: true, toggle: vi.fn() });
    const thumbnailLight = 'data:image/png;base64,light';
    render(<DiagramCard diagram={{ ...diagram, thumbnailLight, thumbnailDark: null }} />);
    const openLink = screen.getByRole('link', { name: 'Open Login Flow' });

    expect(openLink.querySelector('img')).toHaveAttribute('src', thumbnailLight);
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

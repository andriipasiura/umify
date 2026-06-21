import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './app-sidebar';

const usePathnameMock = vi.fn(() => '/diagrams');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

const USER = { name: 'User', email: 'user@example.com', image: null };

const renderSidebar = () =>
  render(
    <SidebarProvider>
      <AppSidebar user={USER} signOutAction={vi.fn()} />
    </SidebarProvider>,
  );

describe('AppSidebar', () => {
  test('renders the brand header and all nav links', () => {
    renderSidebar();

    expect(screen.getByText('UmiFy')).toBeInTheDocument();
    expect(screen.getByText('Free UML-tool')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /diagrams/i })).toHaveAttribute('href', '/diagrams');
    expect(screen.getByRole('link', { name: /favorites/i })).toHaveAttribute('href', '/favorites');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  test('marks the active route based on the current pathname', () => {
    usePathnameMock.mockReturnValue('/favorites');
    renderSidebar();

    expect(screen.getByRole('link', { name: /favorites/i })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: /diagrams/i })).toHaveAttribute('data-active', 'false');
  });
});

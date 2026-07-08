import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { DashboardShell } from './dashboard-shell';

const usePathnameMock = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

const USER = { name: 'User', email: 'user@example.com', image: null };

describe('DashboardShell', () => {
  test('renders the sidebar, header, and children', () => {
    render(
      <DashboardShell user={USER} signOutAction={vi.fn()} defaultOpen>
        <p>Dashboard content</p>
      </DashboardShell>,
    );

    expect(screen.getByText('UmiFy')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});

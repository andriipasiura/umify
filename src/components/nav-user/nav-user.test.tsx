import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';

import { NavUser } from './nav-user';

const USER = { name: 'User', email: 'user@example.com', image: null };

const renderInSidebar = (node: ReactNode) => render(<SidebarProvider>{node}</SidebarProvider>);

describe('NavUser', () => {
  test('renders the user name and email', () => {
    renderInSidebar(<NavUser user={USER} onSignOut={vi.fn()} />);

    expect(screen.getAllByText('User').length).toBeGreaterThan(0);
    expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
  });

  test('opens the menu with Account, Settings and Log out', async () => {
    const user = userEvent.setup();
    renderInSidebar(<NavUser user={USER} onSignOut={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /user/i }));

    expect(screen.getByRole('menuitem', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toHaveAttribute(
      'href',
      '/settings',
    );
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });

  test('Account item is disabled', async () => {
    const user = userEvent.setup();
    renderInSidebar(<NavUser user={USER} onSignOut={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /user/i }));

    expect(screen.getByRole('menuitem', { name: /account/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});

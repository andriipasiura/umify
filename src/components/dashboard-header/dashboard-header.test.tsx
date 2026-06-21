import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, test } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';

import { DashboardHeader } from './dashboard-header';

const renderInShell = (ui: ReactNode) => render(<SidebarProvider>{ui}</SidebarProvider>);

describe('DashboardHeader', () => {
  test('renders the sidebar toggle', () => {
    renderInShell(<DashboardHeader />);
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  test('renders children in the actions slot', () => {
    renderInShell(
      <DashboardHeader>
        <span>Action</span>
      </DashboardHeader>,
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

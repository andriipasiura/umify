import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/test/render';

import { GuestSignInDialog } from './guest-sign-in-dialog';

describe('GuestSignInDialog', () => {
  it('renders the title, description, and children when open', () => {
    render(
      <GuestSignInDialog open onOpenChange={vi.fn()}>
        <button type="button">Continue with Google</button>
      </GuestSignInDialog>,
    );

    expect(screen.getByText('Sign in to save your work')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <GuestSignInDialog open={false} onOpenChange={vi.fn()}>
        <button type="button">Continue with Google</button>
      </GuestSignInDialog>,
    );

    expect(screen.queryByText('Sign in to save your work')).not.toBeInTheDocument();
  });
});

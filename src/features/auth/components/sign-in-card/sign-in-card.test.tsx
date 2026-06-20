import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { SignInCard } from './sign-in-card';

describe('SignInCard', () => {
  test('renders the default welcome heading', () => {
    render(
      <SignInCard>
        <button type="submit">Continue with Google</button>
      </SignInCard>,
    );
    expect(screen.getByText('Welcome to UmiFy')).toBeInTheDocument();
  });

  test('renders the provider controls passed as children', () => {
    render(
      <SignInCard>
        <button type="submit">Continue with GitHub</button>
      </SignInCard>,
    );
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
  });
});

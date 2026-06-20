import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { OAuthButton } from './oauth-button';

describe('OAuthButton', () => {
  test('renders the Google provider label', () => {
    render(<OAuthButton provider="google" />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  test('renders the GitHub provider label', () => {
    render(<OAuthButton provider="github" />);
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
  });

  test('is a submit button so the enclosing form action fires', () => {
    render(<OAuthButton provider="google" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  test('renders the title as a level-1 heading', () => {
    render(<PageHeader title="My Diagrams" />);
    expect(screen.getByRole('heading', { level: 1, name: 'My Diagrams' })).toBeInTheDocument();
  });

  test('renders the subtitle when provided', () => {
    render(<PageHeader title="My Diagrams" subtitle="Build and manage your diagrams." />);
    expect(screen.getByText('Build and manage your diagrams.')).toBeInTheDocument();
  });

  test('omits the subtitle when not provided', () => {
    const { container } = render(<PageHeader title="Settings" />);
    expect(container.querySelector('header p')).toBeNull();
  });
});

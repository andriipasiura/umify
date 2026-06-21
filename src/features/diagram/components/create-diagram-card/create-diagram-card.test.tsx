import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { CreateDiagramCard } from './create-diagram-card';

describe('CreateDiagramCard', () => {
  test('renders a disabled create placeholder this MR', () => {
    render(<CreateDiagramCard />);

    const trigger = screen.getByRole('button', { name: 'Create Diagram' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeDisabled();
  });
});

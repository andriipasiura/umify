import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { CreateDiagramCard } from './create-diagram-card';

describe('CreateDiagramCard', () => {
  test('renders a disabled create placeholder when no onClick is provided', () => {
    render(<CreateDiagramCard />);

    const trigger = screen.getByRole('button', { name: 'Create Diagram' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeDisabled();
  });

  test('is enabled and calls onClick when provided', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<CreateDiagramCard onClick={onClick} />);

    const trigger = screen.getByRole('button', { name: 'Create Diagram' });
    expect(trigger).not.toBeDisabled();

    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

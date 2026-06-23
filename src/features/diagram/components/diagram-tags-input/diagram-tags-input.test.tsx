import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { DiagramTagsInput } from './diagram-tags-input';

describe('DiagramTagsInput', () => {
  test('renders existing tags as badges', () => {
    render(<DiagramTagsInput value={['auth', 'login']} onChange={vi.fn()} />);
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  test('adds a tag on Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DiagramTagsInput value={[]} onChange={onChange} />);

    await user.click(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'newTag{Enter}');

    expect(onChange).toHaveBeenCalledWith(['newTag']);
  });

  test('removes a tag on remove button click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DiagramTagsInput value={['auth']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Remove auth' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { SearchInput } from './search-input';

describe('SearchInput', () => {
  test('renders the value and is labelled', () => {
    render(<SearchInput value="login" onValueChange={vi.fn()} label="Search diagrams" />);
    expect(screen.getByRole('searchbox', { name: 'Search diagrams' })).toHaveValue('login');
  });

  test('calls onValueChange as the user types', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onValueChange={onValueChange} label="Search diagrams" />);

    await user.type(screen.getByRole('searchbox', { name: 'Search diagrams' }), 'a');

    expect(onValueChange).toHaveBeenCalledWith('a');
  });
});

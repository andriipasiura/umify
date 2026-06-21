import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from '@/test/render';

import { DiagramFilters } from './diagram-filters';

describe('DiagramFilters', () => {
  test('reflects the active visibility tab and search from the URL', () => {
    render(<DiagramFilters availableTags={['auth']} />, {
      nuqs: { searchParams: '?visibility=public&search=login' },
    });

    expect(screen.getByRole('tab', { name: 'Public' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('searchbox', { name: 'Search diagrams' })).toHaveValue('login');
  });

  test('toggling a tag chip writes it to the URL', async () => {
    const onUrlUpdate = vi.fn();
    const user = userEvent.setup();
    render(<DiagramFilters availableTags={['auth']} />, { nuqs: { onUrlUpdate } });

    await user.click(screen.getByRole('button', { name: '#auth' }));

    expect(onUrlUpdate).toHaveBeenCalled();
    const lastCall = onUrlUpdate.mock.calls.at(-1)?.[0];
    expect(lastCall?.queryString).toContain('tags=auth');
  });
});

import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { readGeneratedDiagram } from '@/features/diagram/lib/generated-diagram-storage';
import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';
import { render, screen } from '@/test/render';

import { GenerateDiagramDialog } from './generate-diagram-dialog';

const DESCRIPTION = 'An online bookstore where customers buy books';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setup = () => {
  const onOpenChange = vi.fn();
  render(<GenerateDiagramDialog open onOpenChange={onOpenChange} />);
  return { onOpenChange, user: userEvent.setup() };
};

describe('GenerateDiagramDialog', () => {
  test('disables Generate while the description is empty', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });

  test('validates the minimum length before calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { user } = setup();

    await user.type(screen.getByLabelText('System description'), 'Too short');
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    expect(await screen.findByText('Description must be at least 20 characters.')).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('stores the result and opens the unsaved editor on success', async () => {
    const success = { title: 'Bookstore', content: EMPTY_DIAGRAM_CONTENT };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, success)));
    const { user, onOpenChange } = setup();

    await user.type(screen.getByLabelText('System description'), DESCRIPTION);
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/diagrams/new'));
    expect(readGeneratedDiagram()).toEqual(success);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('shows the error message and every validation detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(422, {
          error: 'invalid_diagram',
          message: 'The AI could not produce a valid diagram. Try rephrasing or adding detail.',
          details: ['First problem.', 'Second problem.'],
        }),
      ),
    );
    const { user } = setup();

    await user.type(screen.getByLabelText('System description'), DESCRIPTION);
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not build a diagram');
    expect(alert).toHaveTextContent('Try rephrasing or adding detail.');
    expect(alert).toHaveTextContent('First problem.');
    expect(alert).toHaveTextContent('Second problem.');
    expect(push).not.toHaveBeenCalled();
  });
});

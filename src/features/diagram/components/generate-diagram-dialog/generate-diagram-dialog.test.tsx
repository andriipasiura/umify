import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { readGeneratedDiagram } from '@/features/diagram/lib/generated-diagram-storage';
import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';
import { useGenerateDraftStore } from '@/features/diagram/store/generate-draft-store';
import { render, screen } from '@/test/render';

import { GenerateDiagramDialog } from './generate-diagram-dialog';

const DESCRIPTION = 'An online bookstore where customers buy books';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  window.sessionStorage.clear();
  useGenerateDraftStore.setState({ description: '' });
  push.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setup = () => {
  const onOpenChange = vi.fn();
  const view = render(<GenerateDiagramDialog open onOpenChange={onOpenChange} />);
  return { onOpenChange, user: userEvent.setup(), ...view };
};

const neverResolvingFetch = () =>
  vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );

const submitWithError = async (status: number, body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(status, body));
  vi.stubGlobal('fetch', fetchMock);
  const view = setup();
  await view.user.type(screen.getByLabelText('System description'), DESCRIPTION);
  await view.user.click(screen.getByRole('button', { name: 'Generate' }));
  return { ...view, fetchMock };
};

describe('GenerateDiagramDialog', () => {
  test('disables Generate while the description is empty', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });

  test('keeps Generate disabled below the minimum length and hints the limit', async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText('System description'), 'Too short');

    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
    expect(screen.getByText(/min 20/)).toBeVisible();
  });

  test('fills the textarea from an example', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'ATM' }));

    expect((screen.getByLabelText('System description') as HTMLTextAreaElement).value).toMatch(
      /^An ATM\./,
    );
    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled();
  });

  test('submits with Cmd/Ctrl+Enter', async () => {
    const fetchMock = neverResolvingFetch();
    vi.stubGlobal('fetch', fetchMock);
    const { user } = setup();

    await user.type(screen.getByLabelText('System description'), DESCRIPTION);
    await user.keyboard('{Control>}{Enter}{/Control}');

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  test('sends only one request on a double click', async () => {
    const fetchMock = neverResolvingFetch();
    vi.stubGlobal('fetch', fetchMock);
    const { user } = setup();

    await user.type(screen.getByLabelText('System description'), DESCRIPTION);
    await user.dblClick(screen.getByRole('button', { name: 'Generate' }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  test('closing while generating aborts the request and keeps the draft', async () => {
    const fetchMock = neverResolvingFetch();
    vi.stubGlobal('fetch', fetchMock);
    const { user, onOpenChange, unmount } = setup();

    await user.type(screen.getByLabelText('System description'), DESCRIPTION);
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    await screen.findByText('Generating your diagram');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
    const signal = (fetchMock.mock.calls[0][1] as RequestInit).signal;
    expect(signal?.aborted).toBe(true);

    unmount();
    setup();
    expect(screen.getByLabelText('System description')).toHaveValue(DESCRIPTION);
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

  test('shows the invalid_diagram card with every validation detail', async () => {
    await submitWithError(422, {
      error: 'invalid_diagram',
      message: 'The AI could not produce a valid diagram. Try rephrasing or adding detail.',
      details: ['First problem.', 'Second problem.'],
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The AI could not build a valid diagram');
    expect(alert).toHaveTextContent('Show 2 issues');
    expect(alert).toHaveTextContent('First problem.');
    expect(alert).toHaveTextContent('Second problem.');
    expect(screen.getByLabelText('System description')).toHaveValue(DESCRIPTION);
    expect(push).not.toHaveBeenCalled();
  });

  test('suggests examples when the input is not a system description', async () => {
    await submitWithError(422, { error: 'not_a_system', message: 'This reads like a poem.' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('That does not read like a system description');
    expect(alert).toHaveTextContent('This reads like a poem.');
    expect(screen.getByRole('button', { name: 'Library' })).toBeVisible();
  });

  test('shows a 400 inline under the textarea', async () => {
    await submitWithError(400, { error: 'invalid_input', message: 'Description is too vague.' });

    expect(await screen.findByText('Description is too vague.')).toBeVisible();
    expect(screen.queryByRole('alert', { name: /went wrong/ })).toBeNull();
  });

  test('prompts to sign in on 401', async () => {
    await submitWithError(401, { error: 'unauthorized', message: 'Sign in.' });

    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
  });

  test('tells when to retry on 429 and blocks Generate until then', async () => {
    await submitWithError(429, {
      error: 'rate_limited',
      message: 'Limit.',
      retryAfterSeconds: 1500,
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Generation limit reached');
    expect(alert).toHaveTextContent(/try again at .+ \(in 25 min\)/);
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });

  test('retries the same description on 502', async () => {
    const { user, fetchMock } = await submitWithError(502, {
      error: 'provider_error',
      message: 'The AI service is unavailable right now.',
    });

    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(retry).toHaveFocus();
    await user.click(retry);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      body: JSON.stringify({ description: DESCRIPTION }),
    });
  });
});

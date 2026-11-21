import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';

import { GENERATE_ENDPOINT, toGenerateError, useGenerateDiagram } from './use-generate-diagram';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toGenerateError', () => {
  test('uses the server message and details for 422', () => {
    expect(
      toGenerateError(422, {
        error: 'invalid_diagram',
        message: 'The AI could not produce a valid diagram.',
        details: ['Relation include "A" → "B": "A" is an actor.'],
      }),
    ).toEqual({
      title: 'Could not build a diagram',
      message: 'The AI could not produce a valid diagram.',
      details: ['Relation include "A" → "B": "A" is an actor.'],
    });
  });

  test.each([
    [400, 'Check your description'],
    [429, 'Limit reached'],
    [502, 'AI service unavailable'],
  ])('titles status %i as "%s"', (status, title) => {
    expect(toGenerateError(status, { error: 'x', message: 'Server says no.' })).toEqual({
      title,
      message: 'Server says no.',
      details: [],
    });
  });

  test('asks the user to sign in again on 401', () => {
    expect(toGenerateError(401, null).message).toBe('Sign in again to generate diagrams.');
  });

  test('falls back to a generic message for unexpected bodies', () => {
    expect(toGenerateError(500, '<html>')).toEqual({
      title: 'Something went wrong',
      message: 'Generation failed. Try again.',
      details: [],
    });
  });
});

describe('useGenerateDiagram', () => {
  test('posts the description and returns the parsed diagram', async () => {
    const success = { title: 'Bookstore', content: EMPTY_DIAGRAM_CONTENT };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, success));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useGenerateDiagram());
    let value: unknown;
    await act(async () => {
      value = await result.current.generate('An online bookstore for customers');
    });

    expect(value).toEqual(success);
    expect(fetchMock).toHaveBeenCalledWith(
      GENERATE_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ description: 'An online bookstore for customers' }),
      }),
    );
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('exposes a readable error for a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(422, { error: 'not_a_system', message: 'This is a poem.' }),
        ),
    );

    const { result } = renderHook(() => useGenerateDiagram());
    await act(async () => {
      await result.current.generate('Roses are red, violets are blue');
    });

    expect(result.current.error).toEqual({
      title: 'Could not build a diagram',
      message: 'This is a poem.',
      details: [],
    });
  });

  test('reports a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { result } = renderHook(() => useGenerateDiagram());
    await act(async () => {
      await result.current.generate('An online bookstore for customers');
    });

    expect(result.current.error?.title).toBe('Network error');
  });

  test('cancel aborts the request without showing an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );

    const { result } = renderHook(() => useGenerateDiagram());
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.generate('An online bookstore for customers');
    });
    expect(result.current.pending).toBe(true);

    await act(async () => {
      result.current.cancel();
      await pending;
    });

    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

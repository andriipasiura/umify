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
  test('keeps the message and every detail for invalid_diagram', () => {
    expect(
      toGenerateError(422, {
        error: 'invalid_diagram',
        message: 'The AI could not produce a valid diagram.',
        details: ['Relation include "A" → "B": "A" is an actor.'],
      }),
    ).toEqual({
      kind: 'invalid_diagram',
      message: 'The AI could not produce a valid diagram.',
      details: ['Relation include "A" → "B": "A" is an actor.'],
      retryAt: null,
    });
  });

  test.each([
    [400, 'invalid_input', 'invalid_input'],
    [422, 'not_a_system', 'not_a_system'],
    [502, 'provider_error', 'provider_error'],
    [500, 'internal_error', 'unknown'],
  ])('maps status %i with code %s to kind %s', (status, code, kind) => {
    expect(toGenerateError(status, { error: code, message: 'Server says no.' })).toMatchObject({
      kind,
      message: 'Server says no.',
    });
  });

  test('computes the retry time for 429 from the body', () => {
    const error = toGenerateError(
      429,
      { error: 'rate_limited', message: 'Limit.', retryAfterSeconds: 120 },
      { now: 1_000 },
    );
    expect(error).toMatchObject({ kind: 'rate_limited', retryAt: 121_000 });
  });

  test('falls back to the Retry-After header for 429', () => {
    const error = toGenerateError(429, null, { retryAfterHeader: '60', now: 0 });
    expect(error.retryAt).toBe(60_000);
  });

  test('asks the user to sign in again on 401', () => {
    expect(toGenerateError(401, null)).toMatchObject({
      kind: 'unauthorized',
      message: 'Sign in again to generate diagrams.',
    });
  });

  test('falls back to a generic message for unexpected bodies', () => {
    expect(toGenerateError(500, '<html>')).toEqual({
      kind: 'unknown',
      message: 'Generation failed. Try again.',
      details: [],
      retryAt: null,
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
      kind: 'not_a_system',
      message: 'This is a poem.',
      details: [],
      retryAt: null,
    });
  });

  test('reports a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { result } = renderHook(() => useGenerateDiagram());
    await act(async () => {
      await result.current.generate('An online bookstore for customers');
    });

    expect(result.current.error?.kind).toBe('network');
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

  test('ignores a second call while a request is in flight', async () => {
    let resolveFetch!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useGenerateDiagram());
    let first: Promise<unknown> = Promise.resolve();
    let second: unknown;
    act(() => {
      first = result.current.generate('An online bookstore for customers');
    });
    await act(async () => {
      second = await result.current.generate('An online bookstore for customers');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBeNull();

    await act(async () => {
      resolveFetch(jsonResponse(200, { title: 'Bookstore', content: EMPTY_DIAGRAM_CONTENT }));
      await first;
    });
    expect(result.current.pending).toBe(false);
  });
});

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useHasHover } from './use-has-hover';

type Listener = (e: MediaQueryListEvent) => void;

let matches = true;
let listeners: Listener[] = [];

beforeEach(() => {
  matches = true;
  listeners = [];
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: Listener) => listeners.push(cb),
    removeEventListener: (_: string, cb: Listener) => {
      listeners = listeners.filter((l) => l !== cb);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useHasHover', () => {
  test('reflects matchMedia result on mount', () => {
    matches = false;
    const { result } = renderHook(() => useHasHover());
    expect(result.current).toBe(false);
  });

  test('returns true when a hover-capable pointer is present', () => {
    matches = true;
    const { result } = renderHook(() => useHasHover());
    expect(result.current).toBe(true);
  });

  test('updates when the media query changes', () => {
    matches = true;
    const { result } = renderHook(() => useHasHover());

    act(() => {
      matches = false;
      listeners.forEach((l) => l({ matches: false } as MediaQueryListEvent));
    });

    expect(result.current).toBe(false);
  });

  test('removes its listener on unmount', () => {
    const { unmount } = renderHook(() => useHasHover());
    expect(listeners).toHaveLength(1);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});

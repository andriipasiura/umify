import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';
import { type GuestDiagram } from '@/features/diagram/schema/guest-diagram';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import type { UmlNode } from '@/features/diagram/types';

import { GUEST_DIAGRAM_STORAGE_KEY, readGuestDiagram } from '../lib/guest-diagram-storage';
import { useGuestDiagram } from './use-guest-diagram';

const makeNode = (id: string): UmlNode =>
  ({
    id,
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: id },
  }) as UmlNode;

const makeGuestDiagram = (overrides: Partial<GuestDiagram> = {}): GuestDiagram => ({
  version: 1,
  title: 'Untitled diagram',
  content: EMPTY_DIAGRAM_CONTENT,
  updatedAt: Date.now(),
  ...overrides,
});

beforeEach(() => {
  window.localStorage.clear();
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useGuestDiagram', () => {
  test('seeds the store and title from a stored guest diagram on mount', () => {
    window.localStorage.setItem(
      GUEST_DIAGRAM_STORAGE_KEY,
      JSON.stringify(
        makeGuestDiagram({
          title: 'My guest diagram',
          content: { version: 1, nodes: [makeNode('n1')], edges: [] },
        }),
      ),
    );

    const { result } = renderHook(() => useGuestDiagram());

    expect(result.current.titleControl.value).toBe('My guest diagram');
    expect(useDiagramStore.getState().nodes).toHaveLength(1);
  });

  test('debounce-writes nodes/edges/title changes to localStorage', () => {
    renderHook(() => useGuestDiagram());

    act(() => {
      useDiagramStore.getState().addNode(makeNode('n1'));
    });

    expect(readGuestDiagram()).toBeNull();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const stored = readGuestDiagram();
    expect(stored?.content.nodes).toHaveLength(1);
  });

  test('flush writes synchronously without waiting for the debounce', () => {
    const { result } = renderHook(() => useGuestDiagram());

    act(() => {
      useDiagramStore.getState().addNode(makeNode('n1'));
    });

    act(() => {
      result.current.flush();
    });

    const stored = readGuestDiagram();
    expect(stored?.content.nodes).toHaveLength(1);
  });
});

import { act, renderHook } from '@testing-library/react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import type { UmlNode } from '@/features/diagram/types';

import { useLeaveGuard } from './use-leave-guard';

const makeNode = (id: string): UmlNode =>
  ({
    id,
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: id },
  }) as UmlNode;

const makeClickEvent = (overrides: Partial<ReactMouseEvent<HTMLAnchorElement>> = {}) =>
  ({
    preventDefault: vi.fn(),
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    button: 0,
    ...overrides,
  }) as unknown as ReactMouseEvent<HTMLAnchorElement>;

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  pushMock.mockReset();
});

describe('useLeaveGuard', () => {
  test('onBackClick does nothing when the store is clean', () => {
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));
    const event = makeClickEvent();

    act(() => result.current.onBackClick(event));

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);
  });

  test('onBackClick opens the dialog when the store is dirty', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));
    const event = makeClickEvent();

    act(() => result.current.onBackClick(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });

  test.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['non-primary button', { button: 1 }],
  ])('onBackClick lets the browser handle it when %s is set', (_label, overrides) => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));
    const event = makeClickEvent(overrides);

    act(() => result.current.onBackClick(event));

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);
  });

  test('onCancel closes the dialog without navigating', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    act(() => result.current.onBackClick(makeClickEvent()));
    act(() => result.current.onCancel());

    expect(result.current.open).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('onLeave navigates even though the store is still dirty', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    act(() => result.current.onLeave());

    expect(pushMock).toHaveBeenCalledWith('/');
    expect(useDiagramStore.getState().dirty).toBe(true);
  });

  test('onSaveAndLeave navigates after a successful save', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockImplementation(async () => {
      useDiagramStore.getState().markSaved();
    });
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    await act(async () => {
      await result.current.onSaveAndLeave();
    });

    expect(saveNow).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/');
    expect(result.current.saving).toBe(false);
  });

  test('onSaveAndLeave does not navigate when the save fails to clear dirty', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    act(() => result.current.onBackClick(makeClickEvent()));

    await act(async () => {
      await result.current.onSaveAndLeave();
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.saving).toBe(false);
  });

  test('saving is true while the save is in flight', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    let resolveSave!: () => void;
    const saveNow = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = () => {
            useDiagramStore.getState().markSaved();
            resolve();
          };
        }),
    );
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    act(() => {
      void result.current.onSaveAndLeave();
    });

    expect(result.current.saving).toBe(true);

    await act(async () => {
      resolveSave();
    });

    expect(result.current.saving).toBe(false);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  test('warns on beforeunload while dirty', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  test('does not warn on beforeunload when the store is clean', () => {
    renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

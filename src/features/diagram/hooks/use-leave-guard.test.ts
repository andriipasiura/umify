import { act, renderHook } from '@testing-library/react';
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

const clickLink = (href: string, init: MouseEventInit = {}, attrs: Record<string, string> = {}) => {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = 'link';
  for (const [name, value] of Object.entries(attrs)) anchor.setAttribute(name, value);
  document.body.append(anchor);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  let reachedPage: boolean | null = null;
  const settle = (e: Event) => {
    reachedPage = !e.defaultPrevented;
    e.preventDefault();
  };
  window.addEventListener('click', settle);
  act(() => {
    anchor.dispatchEvent(event);
  });
  window.removeEventListener('click', settle);
  anchor.remove();
  return { defaultPrevented: reachedPage === null ? event.defaultPrevented : !reachedPage };
};

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  pushMock.mockReset();
});

describe('useLeaveGuard', () => {
  test('lets links through when the store is clean', () => {
    renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    expect(clickLink('/favorites').defaultPrevented).toBe(false);
  });

  test('intercepts an internal link and opens the dialog when the store is dirty', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    expect(clickLink('/favorites').defaultPrevented).toBe(true);
    expect(result.current.open).toBe(true);
  });

  test('onLeave goes to the intercepted link target', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    clickLink('/settings?tab=profile');
    act(() => result.current.onLeave());

    expect(pushMock).toHaveBeenCalledWith('/settings?tab=profile');
  });

  test.each([
    ['metaKey', { metaKey: true }, {}],
    ['ctrlKey', { ctrlKey: true }, {}],
    ['shiftKey', { shiftKey: true }, {}],
    ['altKey', { altKey: true }, {}],
    ['non-primary button', { button: 1 }, {}],
    ['target="_blank"', {}, { target: '_blank' }],
    ['download', {}, { download: '' }],
  ])('lets the browser handle a link when %s is set', (_label, init, attrs) => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    expect(clickLink('/favorites', init, attrs).defaultPrevented).toBe(false);
    expect(result.current.open).toBe(false);
  });

  test('ignores external links', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useLeaveGuard(vi.fn().mockResolvedValue(undefined)));

    clickLink('https://example.com/docs');
    expect(result.current.open).toBe(false);
  });

  test('onCancel closes the dialog without navigating', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const saveNow = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLeaveGuard(saveNow));

    clickLink('/favorites');
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

    clickLink('/favorites');

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

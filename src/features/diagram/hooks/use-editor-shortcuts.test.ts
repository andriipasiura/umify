import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useDiagramStore } from '../store/diagram-store';
import { useEditorStore } from '../store/editor-store';
import { useEditorShortcuts } from './use-editor-shortcuts';

const toCode = (key: string): string => {
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  if (/^[a-zA-Z]$/.test(key)) return `Key${key.toUpperCase()}`;
  return key;
};

const fire = (key: string, opts: Partial<KeyboardEventInit> = {}) => {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, code: toCode(key), bubbles: true, ...opts }),
  );
};

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  useEditorStore.setState({ tool: 'select' });
});

describe('useEditorShortcuts', () => {
  test('numeric keys 1-7 switch tools', () => {
    renderHook(() => useEditorShortcuts());

    const mapping = [
      ['1', 'select'],
      ['2', 'pan'],
      ['3', 'eraser'],
      ['4', 'actor'],
      ['5', 'boundary'],
      ['6', 'usecase'],
      ['7', 'note'],
    ] as const;

    for (const [key, expected] of mapping) {
      fire(key);
      expect(useEditorStore.getState().tool).toBe(expected);
    }
  });

  test('Ctrl+Z triggers undo (pops past)', () => {
    const node = {
      id: 'n1',
      type: 'actor' as const,
      position: { x: 0, y: 0 },
      data: { kind: 'actor' as const, label: 'A' },
    };
    useDiagramStore.getState().addNode(node);
    expect(useDiagramStore.getState().past.length).toBeGreaterThan(0);

    renderHook(() => useEditorShortcuts());
    fire('z', { ctrlKey: true });
    expect(useDiagramStore.getState().nodes).toHaveLength(0);
  });

  test('Ctrl+Shift+Z triggers redo (pops future)', () => {
    const node = {
      id: 'n1',
      type: 'actor' as const,
      position: { x: 0, y: 0 },
      data: { kind: 'actor' as const, label: 'A' },
    };
    useDiagramStore.getState().addNode(node);
    useDiagramStore.getState().undo();
    expect(useDiagramStore.getState().future.length).toBeGreaterThan(0);

    renderHook(() => useEditorShortcuts());
    fire('z', { ctrlKey: true, shiftKey: true });
    expect(useDiagramStore.getState().nodes).toHaveLength(1);
  });

  test('Ctrl+Y triggers redo', () => {
    const node = {
      id: 'n1',
      type: 'actor' as const,
      position: { x: 0, y: 0 },
      data: { kind: 'actor' as const, label: 'A' },
    };
    useDiagramStore.getState().addNode(node);
    useDiagramStore.getState().undo();

    renderHook(() => useEditorShortcuts());
    fire('y', { ctrlKey: true });
    expect(useDiagramStore.getState().nodes).toHaveLength(1);
  });

  test('shortcuts are ignored when target is an input', () => {
    renderHook(() => useEditorShortcuts());
    useEditorStore.setState({ tool: 'pan' });

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    document.body.removeChild(input);

    expect(useEditorStore.getState().tool).toBe('pan');
  });

  test('shortcuts are ignored when target is a textarea', () => {
    renderHook(() => useEditorShortcuts());
    useEditorStore.setState({ tool: 'pan' });

    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    ta.focus();
    ta.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    document.body.removeChild(ta);

    expect(useEditorStore.getState().tool).toBe('pan');
  });

  test('listener is removed on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useEditorShortcuts());
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

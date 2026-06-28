import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useDiagramStore } from '../store/diagram-store';
import { useInlineLabel } from './use-inline-label';

const NODE = {
  id: 'n1',
  type: 'actor' as const,
  position: { x: 0, y: 0 },
  data: { kind: 'actor' as const, label: 'Hello' },
};

const makeKeyEvent = (key: string) =>
  ({
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as React.KeyboardEvent<HTMLInputElement>;

const makeChangeEvent = (value: string) =>
  ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [NODE], edges: [] });
});

describe('useInlineLabel', () => {
  test('starts in non-editing state', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));
    expect(result.current.isEditing).toBe(false);
  });

  test('onDoubleClick enters editing mode with current label', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));
    act(() => result.current.onDoubleClick());
    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe('Hello');
  });

  test('Enter commits the label and updates the store', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));

    act(() => result.current.onDoubleClick());
    act(() => result.current.inputProps.onChange(makeChangeEvent('World')));
    act(() => result.current.inputProps.onKeyDown(makeKeyEvent('Enter')));

    expect(useDiagramStore.getState().nodes[0].data.label).toBe('World');
    expect(result.current.isEditing).toBe(false);
  });

  test('Escape cancels without committing', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));

    act(() => result.current.onDoubleClick());
    act(() => result.current.inputProps.onChange(makeChangeEvent('World')));
    act(() => result.current.inputProps.onKeyDown(makeKeyEvent('Escape')));

    expect(useDiagramStore.getState().nodes[0].data.label).toBe('Hello');
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draft).toBe('Hello');
  });

  test('onBlur commits the label', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));

    act(() => result.current.onDoubleClick());
    act(() => result.current.inputProps.onChange(makeChangeEvent('Blurred')));
    act(() => result.current.inputProps.onBlur());

    expect(useDiagramStore.getState().nodes[0].data.label).toBe('Blurred');
    expect(result.current.isEditing).toBe(false);
  });

  test('inputProps has nodrag nopan class', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));
    expect(result.current.inputProps.className).toContain('nodrag');
    expect(result.current.inputProps.className).toContain('nopan');
  });

  test('stopPropagation is called on keydown', () => {
    const { result } = renderHook(() => useInlineLabel('n1', 'Hello'));
    act(() => result.current.onDoubleClick());
    const e = makeKeyEvent('a');
    act(() => result.current.inputProps.onKeyDown(e));
    expect(e.stopPropagation).toHaveBeenCalled();
  });
});

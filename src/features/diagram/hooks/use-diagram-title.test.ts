import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { renameDiagramMock, toastErrorMock } = vi.hoisted(() => ({
  renameDiagramMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/features/diagram/server/diagram.actions', () => ({ renameDiagram: renameDiagramMock }));
vi.mock('sonner', () => ({ toast: { error: toastErrorMock } }));

import { useDiagramTitle } from './use-diagram-title';

beforeEach(() => {
  renameDiagramMock.mockReset().mockResolvedValue({ ok: true, data: { title: 'New Title' } });
  toastErrorMock.mockReset();
});

describe('useDiagramTitle', () => {
  test('initial value matches initialTitle', () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'My Diagram'));
    expect(result.current.value).toBe('My Diagram');
    expect(result.current.isEditing).toBe(false);
  });

  test('onDoubleClick enters editing mode', () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'My Diagram'));
    act(() => result.current.onDoubleClick());
    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe('My Diagram');
  });

  test('optimistically updates value on commit via blur', async () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'Old Title'));

    act(() => result.current.onDoubleClick());
    act(() =>
      result.current.inputProps.onChange({
        target: { value: 'New Title' },
      } as React.ChangeEvent<HTMLInputElement>),
    );

    await act(async () => {
      result.current.inputProps.onBlur();
    });

    expect(result.current.value).toBe('New Title');
    expect(result.current.isEditing).toBe(false);
    expect(renameDiagramMock).toHaveBeenCalledWith('d1', 'New Title');
  });

  test('optimistically updates value on Enter key', async () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'Old'));

    act(() => result.current.onDoubleClick());
    act(() =>
      result.current.inputProps.onChange({
        target: { value: 'New' },
      } as React.ChangeEvent<HTMLInputElement>),
    );

    await act(async () => {
      result.current.inputProps.onKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('New');
  });

  test('reverts and shows toast on rename failure', async () => {
    renameDiagramMock.mockResolvedValue({ ok: false, error: 'Forbidden' });

    const { result } = renderHook(() => useDiagramTitle('d1', 'Old Title'));

    act(() => result.current.onDoubleClick());
    act(() =>
      result.current.inputProps.onChange({
        target: { value: 'New Title' },
      } as React.ChangeEvent<HTMLInputElement>),
    );

    await act(async () => {
      result.current.inputProps.onBlur();
    });

    expect(result.current.value).toBe('Old Title');
    expect(toastErrorMock).toHaveBeenCalledWith('Forbidden');
  });

  test('Escape cancels without calling the action', () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'Original'));

    act(() => result.current.onDoubleClick());
    act(() =>
      result.current.inputProps.onChange({
        target: { value: 'Changed' },
      } as React.ChangeEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );

    expect(result.current.isEditing).toBe(false);
    expect(result.current.value).toBe('Original');
    expect(renameDiagramMock).not.toHaveBeenCalled();
  });

  test('empty commit reverts without calling the action', async () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'Title'));

    act(() => result.current.onDoubleClick());
    act(() =>
      result.current.inputProps.onChange({
        target: { value: '   ' },
      } as React.ChangeEvent<HTMLInputElement>),
    );

    await act(async () => {
      result.current.inputProps.onBlur();
    });

    expect(renameDiagramMock).not.toHaveBeenCalled();
    expect(result.current.value).toBe('Title');
  });

  test('unchanged commit does not call the action', async () => {
    const { result } = renderHook(() => useDiagramTitle('d1', 'Same'));

    act(() => result.current.onDoubleClick());

    await act(async () => {
      result.current.inputProps.onBlur();
    });

    expect(renameDiagramMock).not.toHaveBeenCalled();
  });
});

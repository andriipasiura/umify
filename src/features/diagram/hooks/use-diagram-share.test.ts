import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { setDiagramVisibilityMock, toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  setDiagramVisibilityMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  setDiagramVisibility: setDiagramVisibilityMock,
}));
vi.mock('sonner', () => ({ toast: { error: toastErrorMock, success: toastSuccessMock } }));

import { useDiagramShare } from './use-diagram-share';

const writeTextMock = vi.fn();

beforeEach(() => {
  setDiagramVisibilityMock.mockReset().mockResolvedValue({
    ok: true,
    data: { visibility: 'public' },
  });
  toastErrorMock.mockReset();
  toastSuccessMock.mockReset();
  writeTextMock.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
});

describe('useDiagramShare', () => {
  test('initial state reflects initialVisibility', () => {
    const { result } = renderHook(() => useDiagramShare('d1', 'private'));
    expect(result.current.isPublic).toBe(false);
    expect(result.current.shareUrl).toContain('/share/d1');
  });

  test('optimistically flips isPublic and calls the action', async () => {
    const { result } = renderHook(() => useDiagramShare('d1', 'private'));

    await act(async () => {
      result.current.onToggle(true);
    });

    expect(result.current.isPublic).toBe(true);
    expect(setDiagramVisibilityMock).toHaveBeenCalledWith('d1', 'public');
  });

  test('reverts and shows an error toast when the action fails', async () => {
    setDiagramVisibilityMock.mockResolvedValue({ ok: false, error: 'Forbidden' });

    const { result } = renderHook(() => useDiagramShare('d1', 'private'));

    await act(async () => {
      result.current.onToggle(true);
    });

    expect(result.current.isPublic).toBe(false);
    expect(toastErrorMock).toHaveBeenCalledWith('Forbidden');
  });

  test('toggling off sends private', async () => {
    setDiagramVisibilityMock.mockResolvedValue({ ok: true, data: { visibility: 'private' } });

    const { result } = renderHook(() => useDiagramShare('d1', 'public'));

    await act(async () => {
      result.current.onToggle(false);
    });

    expect(result.current.isPublic).toBe(false);
    expect(setDiagramVisibilityMock).toHaveBeenCalledWith('d1', 'private');
  });

  test('onCopy writes the share URL to the clipboard and toasts success', async () => {
    const { result } = renderHook(() => useDiagramShare('d1', 'public'));

    await act(async () => {
      result.current.onCopy();
    });

    expect(writeTextMock).toHaveBeenCalledWith(result.current.shareUrl);
    expect(toastSuccessMock).toHaveBeenCalledWith('Link copied to clipboard');
  });

  test('onCopy toasts an error when the clipboard write fails', async () => {
    writeTextMock.mockRejectedValue(new Error('denied'));

    const { result } = renderHook(() => useDiagramShare('d1', 'public'));

    await act(async () => {
      result.current.onCopy();
    });

    expect(toastErrorMock).toHaveBeenCalledWith('Failed to copy link');
  });
});

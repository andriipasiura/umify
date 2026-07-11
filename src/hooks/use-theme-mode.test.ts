import { act, renderHook } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useThemeMode } from './use-theme-mode';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

const mockSetTheme = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useTheme).mockReturnValue({
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
});

describe('useThemeMode', () => {
  test('reports isDark false once mounted when resolvedTheme is light', () => {
    const { result } = renderHook(() => useThemeMode());
    expect(result.current.mounted).toBe(true);
    expect(result.current.isDark).toBe(false);
  });

  test('reports isDark true once mounted when resolvedTheme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const { result } = renderHook(() => useThemeMode());
    expect(result.current.isDark).toBe(true);
  });

  test('toggle(true) sets theme to dark and toggle(false) sets theme to light', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current.toggle(true));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    act(() => result.current.toggle(false));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});

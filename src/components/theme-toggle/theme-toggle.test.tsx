import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ThemeToggle } from './theme-toggle';

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

describe('ThemeToggle', () => {
  test('renders unchecked and labelled for switching to dark mode when light', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('switch', { name: 'Switch to dark mode' })).not.toBeChecked();
  });

  test('renders checked and labelled for switching to light mode when dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    render(<ThemeToggle />);
    expect(screen.getByRole('switch', { name: 'Switch to light mode' })).toBeChecked();
  });

  test('calls setTheme with dark when clicked from light mode', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('switch'));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

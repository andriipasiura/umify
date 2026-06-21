import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { formatUpdatedAt } from './formatUpdatedAt';

const NOW = new Date('2026-06-21T12:00:00.000Z');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

describe('formatUpdatedAt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('formats today as "today"', () => {
    expect(formatUpdatedAt(NOW)).toBe('today');
  });

  test('formats a past date in days ago', () => {
    expect(formatUpdatedAt(new Date(NOW.getTime() - 3 * MS_PER_DAY))).toBe('3 days ago');
  });

  test('formats yesterday', () => {
    expect(formatUpdatedAt(new Date(NOW.getTime() - MS_PER_DAY))).toBe('yesterday');
  });
});

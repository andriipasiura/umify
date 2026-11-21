import { describe, expect, test, vi } from 'vitest';

import { consumeRateLimit } from './rate-limit';

vi.mock('@/lib/db', async () => {
  const { createTestDb } = await import('@/test/create-test-db');
  return { db: await createTestDb() };
});

const HOUR = 60 * 60 * 1000;
const at = (iso: string) => new Date(iso);

describe('consumeRateLimit', () => {
  test('allows up to the limit within a window, then rejects with Retry-After', async () => {
    const opts = { key: 'user-a', limit: 2, windowMs: HOUR };

    expect(await consumeRateLimit({ ...opts, now: at('2026-01-01T10:00:00Z') })).toEqual({
      ok: true,
      remaining: 1,
    });
    expect(await consumeRateLimit({ ...opts, now: at('2026-01-01T10:10:00Z') })).toEqual({
      ok: true,
      remaining: 0,
    });
    expect(await consumeRateLimit({ ...opts, now: at('2026-01-01T10:45:00Z') })).toEqual({
      ok: false,
      retryAfterSeconds: 15 * 60,
    });
  });

  test('starts a fresh count in the next window', async () => {
    const opts = { key: 'user-b', limit: 1, windowMs: HOUR };

    await consumeRateLimit({ ...opts, now: at('2026-01-01T10:00:00Z') });
    expect((await consumeRateLimit({ ...opts, now: at('2026-01-01T10:30:00Z') })).ok).toBe(false);
    expect((await consumeRateLimit({ ...opts, now: at('2026-01-01T11:00:00Z') })).ok).toBe(true);
  });

  test('keys are independent', async () => {
    const now = at('2026-01-01T10:00:00Z');
    await consumeRateLimit({ key: 'user-c', limit: 1, windowMs: HOUR, now });
    expect((await consumeRateLimit({ key: 'user-d', limit: 1, windowMs: HOUR, now })).ok).toBe(
      true,
    );
  });
});

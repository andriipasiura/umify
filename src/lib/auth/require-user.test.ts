import { beforeEach, describe, expect, test, vi } from 'vitest';

import { requireUser } from './require-user';

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock('@/auth', () => ({ auth: authMock }));

describe('requireUser', () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  test('throws when there is no session', async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow('Unauthorized');
  });

  test('throws when the session has no user id', async () => {
    authMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    await expect(requireUser()).rejects.toThrow('Unauthorized');
  });

  test('returns the user when authenticated', async () => {
    const user = { id: 'user_1', email: 'a@b.com' };
    authMock.mockResolvedValue({ user });
    await expect(requireUser()).resolves.toEqual(user);
  });
});

import { beforeEach, describe, expect, test, vi } from 'vitest';

const { requireUserMock, deleteUser, signOutMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  deleteUser: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({ requireUser: requireUserMock }));
vi.mock('@/lib/db', () => ({ db: { user: { delete: deleteUser } } }));
vi.mock('@/auth', () => ({ signOut: signOutMock }));

import { deleteAccount } from './account.actions';

describe('deleteAccount', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1', email: 'test@example.com' });
    deleteUser.mockReset().mockResolvedValue(undefined);
    signOutMock.mockReset().mockResolvedValue(undefined);
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    await expect(deleteAccount()).rejects.toThrow('Unauthorized');
  });

  test('deletes the authenticated user by id', async () => {
    await deleteAccount();
    expect(deleteUser).toHaveBeenCalledWith({ where: { id: 'user_1' } });
  });

  test('signs out after deletion', async () => {
    await deleteAccount();
    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: '/sign-in' });
  });

  test('signs out only after the delete resolves', async () => {
    const order: string[] = [];
    deleteUser.mockImplementation(async () => {
      order.push('delete');
    });
    signOutMock.mockImplementation(async () => {
      order.push('signOut');
    });

    await deleteAccount();
    expect(order).toEqual(['delete', 'signOut']);
  });

  test('returns ok result', async () => {
    const result = await deleteAccount();
    expect(result).toEqual({ ok: true, data: undefined });
  });
});

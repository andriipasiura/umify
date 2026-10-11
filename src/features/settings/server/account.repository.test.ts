import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db } from '@/lib/db';
import { diagrams, users } from '@/lib/db/schema';

import { accountRepository } from './account.repository';

vi.mock('@/lib/db', async () => {
  const { createTestDb } = await import('@/test/create-test-db');
  return { db: await createTestDb() };
});

describe('accountRepository.remove', () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.insert(users).values([{ id: 'user_1' }, { id: 'user_2' }]);
    await db.insert(diagrams).values([
      { title: 'Mine', ownerId: 'user_1', nodes: [], edges: [] },
      { title: 'Theirs', ownerId: 'user_2', nodes: [], edges: [] },
    ]);
  });

  test('deletes the user and cascades to their diagrams only', async () => {
    await accountRepository.remove('user_1');

    const remainingUsers = await db.select({ id: users.id }).from(users);
    const remainingDiagrams = await db.select({ title: diagrams.title }).from(diagrams);

    expect(remainingUsers).toEqual([{ id: 'user_2' }]);
    expect(remainingDiagrams).toEqual([{ title: 'Theirs' }]);
  });
});

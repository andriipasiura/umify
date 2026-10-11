import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const accountRepository = {
  remove: async (userId: string): Promise<void> => {
    await db.delete(users).where(eq(users.id, userId));
  },
};

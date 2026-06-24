'use server';

import { signOut } from '@/auth';
import { type ActionResult } from '@/features/diagram/server/types';
import { requireUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import { routes } from '@/lib/routes';

export const deleteAccount = async (): Promise<ActionResult> => {
  const user = await requireUser();

  await db.user.delete({ where: { id: user.id } });

  await signOut({ redirectTo: routes.signIn });

  return { ok: true, data: undefined };
};

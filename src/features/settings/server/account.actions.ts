'use server';

import { signOut } from '@/auth';
import { type ActionResult } from '@/features/diagram/server/types';
import { requireUser } from '@/lib/auth/require-user';
import { routes } from '@/lib/routes';

import { accountRepository } from './account.repository';

export const deleteAccount = async (): Promise<ActionResult> => {
  const user = await requireUser();

  await accountRepository.remove(user.id);

  await signOut({ redirectTo: routes.signIn });

  return { ok: true, data: undefined };
};

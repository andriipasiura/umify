import 'server-only';

import { auth } from '@/auth';

export const requireUser = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
};

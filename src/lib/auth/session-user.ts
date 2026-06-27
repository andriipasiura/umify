import { type Session } from 'next-auth';

const FALLBACK_USER_NAME = 'User';

export type SessionUser = {
  name: string;
  email: string;
  image: string | null;
};

export const toSessionUser = (user: NonNullable<Session['user']>): SessionUser => ({
  name: user.name ?? user.email ?? FALLBACK_USER_NAME,
  email: user.email ?? '',
  image: user.image ?? null,
});

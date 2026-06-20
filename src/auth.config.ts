import { type NextAuthConfig } from 'next-auth';

import { routes } from '@/lib/routes';

export const authConfig = {
  pages: { signIn: routes.signIn },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
  },
} satisfies NextAuthConfig;

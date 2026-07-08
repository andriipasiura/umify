'use server';

import { signIn, signOut } from '@/auth';
import { routes } from '@/lib/routes';

export const signInWithGoogle = async () => {
  await signIn('google', { redirectTo: routes.home });
};

export const signInWithGithub = async () => {
  await signIn('github', { redirectTo: routes.home });
};

export const signOutAction = async () => {
  await signOut({ redirectTo: routes.signIn });
};

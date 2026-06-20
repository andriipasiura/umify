'use server';

import { signIn, signOut } from '@/auth';
import { routes } from '@/lib/routes';

export const signInWithGoogle = async () => {
  await signIn('google', { redirectTo: routes.diagrams });
};

export const signInWithGithub = async () => {
  await signIn('github', { redirectTo: routes.diagrams });
};

export const signOutAction = async () => {
  await signOut({ redirectTo: routes.signIn });
};

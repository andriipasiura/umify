import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { OAuthButton, SignInCard } from '@/features/auth/client';
import { signInWithGithub, signInWithGoogle } from '@/features/auth/server';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to UmiFy with Google or GitHub to save and share your UML use-case diagrams.',
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect(routes.home);
  }

  return (
    <SignInCard className="w-full max-w-sm">
      <form action={signInWithGoogle}>
        <OAuthButton provider="google" />
      </form>
      <form action={signInWithGithub}>
        <OAuthButton provider="github" />
      </form>
    </SignInCard>
  );
}

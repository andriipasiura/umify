import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { OAuthButton, SignInCard } from '@/features/auth/client';
import { signInWithGithub, signInWithGoogle } from '@/features/auth/server';
import { routes } from '@/lib/routes';

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect(routes.diagrams);
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

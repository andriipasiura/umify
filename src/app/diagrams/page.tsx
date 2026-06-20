import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { SignOutButton } from '@/features/auth/client';
import { signOutAction } from '@/features/auth/server';
import { routes } from '@/lib/routes';

export default async function DiagramsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.signIn);
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">Your diagrams</h1>
        <SignOutButton action={signOutAction} />
      </header>
      <p className="text-muted-foreground text-sm">
        Signed in as <span className="text-foreground font-medium">{session.user.email}</span>.
      </p>
    </main>
  );
}

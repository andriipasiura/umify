import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { signOutAction } from '@/features/auth/server';
import { toSessionUser } from '@/lib/auth/session-user';
import { routes } from '@/lib/routes';

const SIDEBAR_STATE_COOKIE = 'sidebar_state';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.signIn);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== 'false';

  const user = toSessionUser(session.user);

  return (
    <DashboardShell user={user} signOutAction={signOutAction} defaultOpen={defaultOpen}>
      {children}
    </DashboardShell>
  );
}

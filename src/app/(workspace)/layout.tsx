import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { signOutAction } from '@/features/auth/server';
import { toSessionUser } from '@/lib/auth/session-user';
import { routes } from '@/lib/routes';

const SIDEBAR_STATE_COOKIE = 'sidebar_state';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.signIn);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={toSessionUser(session.user)} signOutAction={signOutAction} />
      {children}
    </SidebarProvider>
  );
}

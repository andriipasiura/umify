import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { ContentLayout } from '@/components/content-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { signOutAction } from '@/features/auth/server';
import { toSessionUser } from '@/lib/auth/session-user';
import { routes } from '@/lib/routes';

const SIDEBAR_STATE_COOKIE = 'sidebar_state';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.signIn);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== 'false';

  const user = toSessionUser(session.user);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} signOutAction={signOutAction} />
      <ContentLayout>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </ContentLayout>
    </SidebarProvider>
  );
}

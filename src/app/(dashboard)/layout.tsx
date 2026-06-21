import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { signOutAction } from '@/features/auth/server';
import { routes } from '@/lib/routes';

const SIDEBAR_STATE_COOKIE = 'sidebar_state';
const FALLBACK_USER_NAME = 'User';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.signIn);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== 'false';

  const user = {
    name: session.user.name ?? session.user.email ?? FALLBACK_USER_NAME,
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} signOutAction={signOutAction} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

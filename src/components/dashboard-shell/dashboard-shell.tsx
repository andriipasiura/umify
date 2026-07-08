import { type ReactNode } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { ContentLayout } from '@/components/content-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { type SessionUser } from '@/lib/auth/session-user';

type DashboardShellProps = {
  user: SessionUser;
  signOutAction: () => Promise<void>;
  defaultOpen: boolean;
  children?: ReactNode;
};

export const DashboardShell = ({
  user,
  signOutAction,
  defaultOpen,
  children,
}: DashboardShellProps) => (
  <SidebarProvider defaultOpen={defaultOpen}>
    <AppSidebar user={user} signOutAction={signOutAction} />
    <ContentLayout>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
    </ContentLayout>
  </SidebarProvider>
);

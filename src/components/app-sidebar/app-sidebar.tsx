'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UmifyMark } from '@/components/icons/umify-mark';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DASHBOARD_NAV_ITEMS, type DashboardNavItem } from '@/lib/constants/navigation';

type NavUserData = {
  name: string;
  email: string;
  image: string | null;
};

type AppSidebarProps = {
  user: NavUserData;
  signOutAction: () => Promise<void>;
  items?: readonly DashboardNavItem[];
  className?: string;
};

const isItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export const AppSidebar = ({
  user,
  signOutAction,
  items = DASHBOARD_NAV_ITEMS,
  className,
}: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className={className}>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-0.5 py-1.5">
            <UmifyMark className="mx-auto" />
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold">UmiFy</span>
              <span className="text-muted-foreground truncate text-xs">Free UML-tool</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {items.map(({ icon: Icon, ...item }) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(pathname, item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavUser user={user} onSignOut={signOutAction} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
};

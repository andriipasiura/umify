'use client';

import { ChevronsUpDown, LogOut, Settings, UserRound } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type NavUserData = {
  name: string;
  email: string;
  image: string | null;
};

type NavUserProps = {
  user: NavUserData;
  onSignOut: () => Promise<void>;
  className?: string;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.at(0) ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

const UserIdentity = ({ user }: { user: NavUserData }) => (
  <>
    <Avatar className="size-8 rounded-lg">
      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
      <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
    </Avatar>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user.name}</span>
      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
    </div>
  </>
);

export const NavUser = ({ user, onSignOut, className }: NavUserProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size="lg"
        className={cn(
          'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground peer-data-[state=collapsed]:hidden',
          className,
        )}
      >
        <UserIdentity user={user} />
        <ChevronsUpDown className="ml-auto" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side="top"
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserIdentity user={user} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem disabled>
          <UserRound />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.settings} className="cursor-pointer">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <form action={onSignOut}>
        <DropdownMenuItem asChild>
          <button type="submit" className="w-full cursor-pointer">
            <LogOut />
            Log out
          </button>
        </DropdownMenuItem>
      </form>
    </DropdownMenuContent>
  </DropdownMenu>
);

import { type LucideIcon, Settings, Star, Workflow } from 'lucide-react';

import { routes } from '@/lib/routes';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  { label: 'Diagrams', href: routes.home, icon: Workflow },
  { label: 'Favorites', href: routes.favorites, icon: Star },
  { label: 'Settings', href: routes.settings, icon: Settings },
];

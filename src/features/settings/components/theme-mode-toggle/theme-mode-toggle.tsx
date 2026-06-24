'use client';

import { useTheme } from 'next-themes';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useIsMounted } from '@/hooks/use-is-mounted';

const LABEL = 'Dark Mode';
const DESCRIPTION = 'Switch the interface between dark and light themes.';

export const ThemeModeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="space-y-0.5">
        <Label htmlFor="dark-mode" className="text-sm font-medium">
          {LABEL}
        </Label>
        <p className="text-muted-foreground text-xs">{DESCRIPTION}</p>
      </div>
      <Switch id="dark-mode" checked={isDark} onCheckedChange={handleToggle} disabled={!mounted} />
    </div>
  );
};

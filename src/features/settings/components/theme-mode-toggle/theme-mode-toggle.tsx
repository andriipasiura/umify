'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useThemeMode } from '@/hooks/use-theme-mode';

const LABEL = 'Dark Mode';
const DESCRIPTION = 'Switch the interface between dark and light themes.';

export const ThemeModeToggle = () => {
  const { isDark, mounted, toggle } = useThemeMode();

  return (
    <div className="flex items-center justify-between p-4">
      <div className="space-y-0.5">
        <Label htmlFor="dark-mode" className="text-sm font-medium">
          {LABEL}
        </Label>
        <p className="text-muted-foreground text-xs">{DESCRIPTION}</p>
      </div>
      <Switch id="dark-mode" checked={isDark} onCheckedChange={toggle} disabled={!mounted} />
    </div>
  );
};

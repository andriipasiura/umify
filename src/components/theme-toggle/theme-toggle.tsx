'use client';

import { Moon, Sun } from 'lucide-react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { useThemeMode } from '@/hooks/use-theme-mode';
import { cn } from '@/lib/utils';

const PLACEHOLDER_CLASS = 'h-6 w-11 shrink-0';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { isDark, mounted, toggle } = useThemeMode();

  if (!mounted) {
    return <div aria-hidden className={PLACEHOLDER_CLASS} />;
  }

  return (
    <SwitchPrimitive.Root
      checked={isDark}
      onCheckedChange={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        PLACEHOLDER_CLASS,
        'peer group/switch focus-visible:border-ring focus-visible:ring-ring/50 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 relative inline-flex items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3',
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'bg-background dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground pointer-events-none relative flex size-5 items-center justify-center rounded-full ring-0 transition-transform data-checked:translate-x-[20px] data-unchecked:translate-x-[2px]',
        )}
      >
        <Sun className="absolute size-3 scale-100 opacity-100 transition-all duration-200 group-data-checked/switch:scale-0 group-data-checked/switch:opacity-0" />
        <Moon className="absolute size-3 scale-0 opacity-0 transition-all duration-200 group-data-checked/switch:scale-100 group-data-checked/switch:opacity-100" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
};

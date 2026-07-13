'use client';

import { useTheme } from 'next-themes';

import { useIsMounted } from '@/hooks/use-is-mounted';
import { type ColorTheme } from '@/lib/constants/themes';
import { cn } from '@/lib/utils';

type ThemeCardProps = {
  theme: ColorTheme;
  selected: boolean;
  onSelect: () => void;
};

export const ThemeCard = ({ theme, selected, onSelect }: ThemeCardProps) => {
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const swatch = mounted && resolvedTheme === 'dark' ? theme.darkSwatch : theme.swatch;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group hover:border-primary/50 focus-visible:ring-ring relative flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all focus-visible:ring-2 focus-visible:outline-none',
        selected ? 'border-primary' : 'border-border',
      )}
      aria-pressed={selected}
    >
      <div
        className="relative h-20 w-full overflow-hidden rounded-md"
        style={{ background: swatch.background }}
      >
        <div className="absolute inset-x-0 top-0 h-5" style={{ background: swatch.accent }} />
        <div
          className="absolute inset-y-0 top-5 left-0 w-8"
          style={{ background: swatch.accent }}
        />
        <div className="absolute inset-0 top-7 left-10 grid grid-cols-2 gap-1 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded"
              style={{
                background: i === 0 ? swatch.primary + '30' : swatch.accent,
                opacity: i === 0 ? 1 : 0.6,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="text-sm leading-none font-medium">{theme.name}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{theme.description}</p>
        </div>
        <span
          className="mt-0.5 size-3 shrink-0 rounded-full"
          style={{ background: swatch.primary }}
        />
      </div>
    </button>
  );
};

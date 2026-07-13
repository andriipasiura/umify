'use client';

import { COLOR_THEMES } from '@/lib/constants/themes';

import { usePreferences } from '../preferences-provider';
import { ThemeCard } from '../theme-card';

export const ColorThemePicker = () => {
  const { colorTheme, setColorTheme } = usePreferences();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {COLOR_THEMES.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          selected={colorTheme === theme.id}
          onSelect={() => setColorTheme(theme.id)}
        />
      ))}
    </div>
  );
};

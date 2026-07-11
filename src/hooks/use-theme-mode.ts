import { useTheme } from 'next-themes';

import { useIsMounted } from '@/hooks/use-is-mounted';

export const useThemeMode = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const toggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return { isDark, mounted, toggle };
};

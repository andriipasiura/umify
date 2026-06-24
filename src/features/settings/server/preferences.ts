import 'server-only';

import { cookies } from 'next/headers';

import {
  COOKIE_AUTO_SAVE,
  COOKIE_AUTO_SAVE_INTERVAL,
  COOKIE_COLOR_THEME,
  parsePreferences,
  type Preferences,
} from '../lib/preferences';

export const readPreferences = async (): Promise<Preferences> => {
  const jar = await cookies();

  return parsePreferences({
    colorTheme: jar.get(COOKIE_COLOR_THEME)?.value,
    autoSave: jar.get(COOKIE_AUTO_SAVE)?.value,
    autoSaveInterval: jar.get(COOKIE_AUTO_SAVE_INTERVAL)?.value,
  });
};

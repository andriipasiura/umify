import {
  AUTO_SAVE_INTERVALS,
  type AutoSaveInterval,
  DEFAULT_AUTO_SAVE,
  DEFAULT_AUTO_SAVE_INTERVAL,
} from '@/lib/constants/auto-save';
import { COLOR_THEMES, type ColorThemeId, DEFAULT_COLOR_THEME } from '@/lib/constants/themes';

export type Preferences = {
  colorTheme: ColorThemeId;
  autoSave: boolean;
  autoSaveInterval: AutoSaveInterval;
};

export const COOKIE_COLOR_THEME = 'ui-color-theme';
export const COOKIE_AUTO_SAVE = 'ui-auto-save';
export const COOKIE_AUTO_SAVE_INTERVAL = 'ui-auto-save-interval';

const VALID_THEME_IDS = new Set<string>(COLOR_THEMES.map((t) => t.id));
const VALID_INTERVALS = new Set<number>(AUTO_SAVE_INTERVALS.map((i) => i.value));

export const parsePreferences = (raw: {
  colorTheme?: string;
  autoSave?: string;
  autoSaveInterval?: string;
}): Preferences => {
  const colorTheme: ColorThemeId = VALID_THEME_IDS.has(raw.colorTheme ?? '')
    ? (raw.colorTheme as ColorThemeId)
    : DEFAULT_COLOR_THEME;

  const autoSave = raw.autoSave === 'false' ? false : DEFAULT_AUTO_SAVE;

  const parsedInterval = Number(raw.autoSaveInterval);
  const autoSaveInterval: AutoSaveInterval = VALID_INTERVALS.has(parsedInterval)
    ? (parsedInterval as AutoSaveInterval)
    : DEFAULT_AUTO_SAVE_INTERVAL;

  return { colorTheme, autoSave, autoSaveInterval };
};

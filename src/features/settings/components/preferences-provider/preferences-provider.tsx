'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { type AutoSaveInterval } from '@/lib/constants/auto-save';
import { type ColorThemeId } from '@/lib/constants/themes';

import {
  COOKIE_AUTO_SAVE,
  COOKIE_AUTO_SAVE_INTERVAL,
  COOKIE_COLOR_THEME,
  type Preferences,
} from '../../lib/preferences';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
};

type PreferencesContextValue = Preferences & {
  setColorTheme: (id: ColorThemeId) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: AutoSaveInterval) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  initial: Preferences;
  children: React.ReactNode;
};

export const PreferencesProvider = ({ initial, children }: PreferencesProviderProps) => {
  const [prefs, setPrefs] = useState<Preferences>(initial);

  const setColorTheme = useCallback((id: ColorThemeId) => {
    setPrefs((p) => ({ ...p, colorTheme: id }));
    setCookie(COOKIE_COLOR_THEME, id);
    document.documentElement.dataset.theme = id;
  }, []);

  const setAutoSave = useCallback((enabled: boolean) => {
    setPrefs((p) => ({ ...p, autoSave: enabled }));
    setCookie(COOKIE_AUTO_SAVE, String(enabled));
  }, []);

  const setAutoSaveInterval = useCallback((interval: AutoSaveInterval) => {
    setPrefs((p) => ({ ...p, autoSaveInterval: interval }));
    setCookie(COOKIE_AUTO_SAVE_INTERVAL, String(interval));
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ ...prefs, setColorTheme, setAutoSave, setAutoSaveInterval }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }

  return context;
};

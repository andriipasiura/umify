import { describe, expect, test } from 'vitest';

import { parsePreferences } from './preferences';

describe('parsePreferences', () => {
  test('applies defaults when all values are missing', () => {
    const result = parsePreferences({});
    expect(result).toEqual({ colorTheme: 'caffeine', autoSave: true, autoSaveInterval: 30 });
  });

  test('parses a valid color theme', () => {
    const result = parsePreferences({ colorTheme: 'ocean' });
    expect(result.colorTheme).toBe('ocean');
  });

  test('falls back to default for an unknown color theme', () => {
    const result = parsePreferences({ colorTheme: 'neon-pink' });
    expect(result.colorTheme).toBe('caffeine');
  });

  test('parses autoSave false', () => {
    const result = parsePreferences({ autoSave: 'false' });
    expect(result.autoSave).toBe(false);
  });

  test('treats any value other than "false" as autoSave true', () => {
    expect(parsePreferences({ autoSave: 'true' }).autoSave).toBe(true);
    expect(parsePreferences({ autoSave: '1' }).autoSave).toBe(true);
    expect(parsePreferences({}).autoSave).toBe(true);
  });

  test('parses a valid auto-save interval', () => {
    expect(parsePreferences({ autoSaveInterval: '60' }).autoSaveInterval).toBe(60);
    expect(parsePreferences({ autoSaveInterval: '300' }).autoSaveInterval).toBe(300);
  });

  test('falls back to default interval for an invalid value', () => {
    expect(parsePreferences({ autoSaveInterval: '999' }).autoSaveInterval).toBe(30);
    expect(parsePreferences({ autoSaveInterval: 'NaN' }).autoSaveInterval).toBe(30);
  });

  test('parses all values together', () => {
    const result = parsePreferences({
      colorTheme: 'violet',
      autoSave: 'false',
      autoSaveInterval: '15',
    });
    expect(result).toEqual({ colorTheme: 'violet', autoSave: false, autoSaveInterval: 15 });
  });
});

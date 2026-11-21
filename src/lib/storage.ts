import type * as z from 'zod';

type StorageArea = 'localStorage' | 'sessionStorage';

export const createStoredItem = <T>(area: StorageArea, key: string, schema: z.ZodType<T>) => ({
  read: (): T | null => {
    try {
      const raw = window[area].getItem(key);
      if (!raw) return null;
      const parsed = schema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },
  write: (value: T): void => {
    try {
      window[area].setItem(key, JSON.stringify(value));
    } catch {}
  },
  clear: (): void => {
    try {
      window[area].removeItem(key);
    } catch {}
  },
});

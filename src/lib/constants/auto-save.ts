export type AutoSaveInterval = 15 | 30 | 60 | 300;

export type AutoSaveIntervalOption = {
  value: AutoSaveInterval;
  label: string;
};

export const AUTO_SAVE_INTERVALS: readonly AutoSaveIntervalOption[] = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
] as const;

export const DEFAULT_AUTO_SAVE = true;
export const DEFAULT_AUTO_SAVE_INTERVAL: AutoSaveInterval = 30;

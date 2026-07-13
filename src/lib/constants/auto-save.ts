export type AutoSaveInterval = 15 | 30 | 60 | 300;

export type AutoSaveIntervalOption = {
  value: AutoSaveInterval;
  label: string;
  shortLabel: string;
};

export const AUTO_SAVE_INTERVALS: readonly AutoSaveIntervalOption[] = [
  { value: 15, label: '15 seconds', shortLabel: '15 sec' },
  { value: 30, label: '30 seconds', shortLabel: '30 sec' },
  { value: 60, label: '1 minute', shortLabel: '1 min' },
  { value: 300, label: '5 minutes', shortLabel: '5 min' },
] as const;

export const DEFAULT_AUTO_SAVE = true;
export const DEFAULT_AUTO_SAVE_INTERVAL: AutoSaveInterval = 30;

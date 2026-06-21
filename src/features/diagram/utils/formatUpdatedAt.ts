const RELATIVE_TIME = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const formatUpdatedAt = (updatedAt: Date): string => {
  const days = Math.round((updatedAt.getTime() - Date.now()) / MS_PER_DAY);
  return RELATIVE_TIME.format(days, 'day');
};

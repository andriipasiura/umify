import type { SaveStatus } from './diagram-status';

export type StatusConfig = {
  dot: string;
  pulse: boolean;
  label: string;
  pill: string;
};

export const STATUS_CONFIG: Record<SaveStatus, StatusConfig> = {
  saved: {
    dot: 'bg-indicator-success',
    pulse: false,
    label: 'Saved',
    pill: 'border-indicator-success/30 bg-indicator-success/10 text-indicator-success hover:bg-indicator-success/20',
  },
  unsaved: {
    dot: 'bg-indicator-warning',
    pulse: true,
    label: 'Unsaved changes',
    pill: 'border-indicator-warning/30 bg-indicator-warning/10 text-indicator-warning hover:bg-indicator-warning/20',
  },
  saving: {
    dot: 'bg-indicator-muted',
    pulse: true,
    label: 'Saving…',
    pill: 'border-indicator-muted/30 bg-indicator-muted/10 text-indicator-muted cursor-default',
  },
  error: {
    dot: 'bg-destructive',
    pulse: false,
    label: 'Save failed — click to retry',
    pill: 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20',
  },
};

import { getModKey } from '@/lib/platform';
import { cn } from '@/lib/utils';

import { STATUS_CONFIG } from './diagram-status-config';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

type DiagramStatusProps = {
  status: SaveStatus;
  onClick?: () => void;
  className?: string;
};

export const DiagramStatus = ({ status, onClick, className }: DiagramStatusProps) => {
  const { dot, pulse, label, shortLabel, pill } = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === 'saving'}
      title={status === 'saving' ? 'Saving…' : `Click to save (${getModKey()}+S)`}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-60',
        pill,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 shrink-0 rounded-full', dot, pulse && 'animate-pulse')}
      />
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{shortLabel}</span>
    </button>
  );
};

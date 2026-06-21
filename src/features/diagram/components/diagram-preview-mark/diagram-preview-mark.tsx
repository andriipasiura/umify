import { cn } from '@/lib/utils';

type DiagramPreviewMarkProps = {
  className?: string;
};

export const DiagramPreviewMark = ({ className }: DiagramPreviewMarkProps) => (
  <svg
    className={cn('text-foreground/8', className)}
    viewBox="0 0 140 100"
    fill="none"
    aria-hidden="true"
  >
    <rect x="10" y="10" width="40" height="28" rx="6" fill="currentColor" />
    <rect x="90" y="10" width="40" height="28" rx="6" fill="currentColor" />
    <rect x="50" y="62" width="40" height="28" rx="6" fill="currentColor" />
    <path d="M50 24 H58 Q70 24 70 36 V62" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <path d="M90 24 H82 Q70 24 70 36 V62" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);

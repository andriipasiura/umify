import { cn } from '@/lib/utils';

type UmifyMarkProps = { className?: string };

export const UmifyMark = ({ className }: UmifyMarkProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-xl font-bold',
      className,
    )}
  >
    U
  </span>
);

import { Show } from '@/components/utils/show';
import { type DiagramTitleResult } from '@/features/diagram/hooks/use-diagram-title';
import { cn } from '@/lib/utils';

type DiagramTitleProps = DiagramTitleResult & {
  className?: string;
};

const pillClass =
  'bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1 shadow-sm text-sm font-medium';

export const DiagramTitle = ({
  value,
  isEditing,
  onDoubleClick,
  inputProps,
  className,
}: DiagramTitleProps) => (
  <Show
    when={isEditing}
    fallback={
      <span
        className={cn(pillClass, 'block max-w-64 cursor-text truncate', className)}
        onDoubleClick={onDoubleClick}
        title={value}
      >
        {value}
      </span>
    }
  >
    <input
      {...inputProps}
      className={cn(pillClass, 'w-64 min-w-0 text-center outline-none', className)}
    />
  </Show>
);

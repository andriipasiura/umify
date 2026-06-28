import { Show } from '@/components/utils/show';
import { type InlineLabelInputProps } from '@/features/diagram/hooks/use-inline-label';
import { cn } from '@/lib/utils';

type NodeInlineLabelProps = {
  isEditing: boolean;
  label: string;
  onDoubleClick: () => void;
  inputProps: InlineLabelInputProps;
  displayClassName?: string;
  inputClassName?: string;
  tag?: 'span' | 'p';
};

export const NodeInlineLabel = ({
  isEditing,
  label,
  onDoubleClick,
  inputProps,
  displayClassName,
  inputClassName,
  tag: Tag = 'span',
}: NodeInlineLabelProps) => (
  <Show
    when={isEditing}
    fallback={
      <Tag
        className={cn('text-foreground cursor-text', displayClassName)}
        onDoubleClick={onDoubleClick}
      >
        {label}
      </Tag>
    }
  >
    <input
      {...inputProps}
      className={cn(
        'text-foreground bg-transparent outline-none',
        inputProps.className,
        inputClassName,
      )}
    />
  </Show>
);

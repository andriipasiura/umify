import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DiagramListSkeletonProps = {
  count?: number;
  className?: string;
};

const DEFAULT_COUNT = 8;
const GRID_CLASSES = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const DiagramCardSkeleton = () => (
  <div className="ring-foreground/10 flex flex-col overflow-hidden rounded-xl ring-1">
    <Skeleton className="h-28 rounded-none" />
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-5 w-16 rounded-4xl" />
      <Skeleton className="h-5 w-3/4" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-12 rounded-4xl" />
        <Skeleton className="h-5 w-14 rounded-4xl" />
      </div>
    </div>
  </div>
);

export const DiagramListSkeleton = ({
  count = DEFAULT_COUNT,
  className,
}: DiagramListSkeletonProps) => (
  <div className={cn(GRID_CLASSES, className)} aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <DiagramCardSkeleton key={index} />
    ))}
  </div>
);

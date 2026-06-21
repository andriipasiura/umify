import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DIAGRAM_VISIBILITY_FILTERS,
  type DiagramVisibilityFilter,
} from '@/features/diagram/search/diagram-filters';
import { cn } from '@/lib/utils';

const VISIBILITY_TAB_LABEL: Record<DiagramVisibilityFilter, string> = {
  all: 'All',
  public: 'Public',
  private: 'Private',
};

type DiagramVisibilityTabsProps = {
  value: DiagramVisibilityFilter;
  onChange: (value: DiagramVisibilityFilter) => void;
  className?: string;
};

export const DiagramVisibilityTabs = ({
  value,
  onChange,
  className,
}: DiagramVisibilityTabsProps) => (
  <Tabs
    value={value}
    onValueChange={(next) => {
      const match = DIAGRAM_VISIBILITY_FILTERS.find((option) => option === next);
      if (match) onChange(match);
    }}
    className={cn(className)}
  >
    <TabsList>
      {DIAGRAM_VISIBILITY_FILTERS.map((option) => (
        <TabsTrigger key={option} value={option}>
          {VISIBILITY_TAB_LABEL[option]}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

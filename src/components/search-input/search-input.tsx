import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
};

export const SearchInput = ({
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: SearchInputProps) => (
  <div className={cn('relative', className)}>
    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
    <Input
      type="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className="pl-9"
    />
  </div>
);

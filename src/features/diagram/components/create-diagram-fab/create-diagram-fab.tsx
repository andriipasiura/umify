'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CreateDiagramFabProps = {
  onClick: () => void;
};

export const CreateDiagramFab = ({ onClick }: CreateDiagramFabProps) => (
  <div className="sticky bottom-6 mt-6 flex justify-end">
    <Button
      onClick={onClick}
      size="icon"
      className="size-14 rounded-full shadow-lg"
      aria-label="Create new diagram"
    >
      <Plus className="size-6" />
    </Button>
  </div>
);

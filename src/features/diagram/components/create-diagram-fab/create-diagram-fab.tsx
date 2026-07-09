'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CreateDiagramFabProps = {
  onClick: () => void;
};

export const CreateDiagramFab = ({ onClick }: CreateDiagramFabProps) => (
  <div className="fixed right-6 bottom-6 mt-6 flex justify-end md:sticky md:right-auto">
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

'use client';

import { type ChangeEvent, type KeyboardEvent, useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { renameDiagram } from '@/features/diagram/server/diagram.actions';

export type DiagramTitleResult = {
  value: string;
  isEditing: boolean;
  draft: string;
  onDoubleClick: () => void;
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    autoFocus: boolean;
  };
};

export const useDiagramTitle = (id: string, initialTitle: string): DiagramTitleResult => {
  const [value, setValue] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [, startTransition] = useTransition();

  const commit = useCallback(() => {
    const trimmed = draft.trim();

    if (!trimmed || trimmed === value) {
      setDraft(value);
      setIsEditing(false);
      return;
    }

    const prev = value;
    setValue(trimmed);
    setIsEditing(false);

    startTransition(async () => {
      const result = await renameDiagram(id, trimmed);
      if (!result.ok) {
        setValue(prev);
        setDraft(prev);
        toast.error(result.error ?? 'Failed to rename diagram');
      }
    });
  }, [draft, id, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  return {
    value,
    isEditing,
    draft,
    onDoubleClick: () => {
      setDraft(value);
      setIsEditing(true);
    },
    inputProps: {
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      },
      autoFocus: true,
    },
  };
};

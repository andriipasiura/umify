'use client';

import { type ChangeEvent, type KeyboardEvent, useCallback, useState } from 'react';

import { type DiagramTitleResult } from '@/features/diagram/hooks/use-diagram-title';

export type UseLocalTitleResult = {
  titleControl: DiagramTitleResult;
  setTitle: (title: string) => void;
};

export const useLocalTitle = (initialTitle: string): UseLocalTitleResult => {
  const [value, setValue] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);

  const setTitle = useCallback((title: string) => {
    setValue(title);
    setDraft(title);
  }, []);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      setIsEditing(false);
      return;
    }

    setValue(trimmed);
    setIsEditing(false);
  }, [draft, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const titleControl: DiagramTitleResult = {
    value,
    isEditing,
    draft,
    onDoubleClick: () => {
      setDraft(value);
      setIsEditing(true);
    },
    inputProps: {
      value: draft,
      onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
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

  return { titleControl, setTitle };
};

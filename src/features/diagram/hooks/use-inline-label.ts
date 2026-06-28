import { type ChangeEvent, type KeyboardEvent, useState } from 'react';

import { useDiagramStore } from '../store/diagram-store';

export type InlineLabelInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoFocus: boolean;
  className: string;
};

export type InlineLabelResult = {
  isEditing: boolean;
  draft: string;
  onDoubleClick: () => void;
  inputProps: InlineLabelInputProps;
};

export const useInlineLabel = (nodeId: string, label: string): InlineLabelResult => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const updateNodeLabel = useDiagramStore((s) => s.updateNodeLabel);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) updateNodeLabel(nodeId, trimmed);
    else setDraft(label);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(label);
    setIsEditing(false);
  };

  return {
    isEditing,
    draft,
    onDoubleClick: () => {
      setDraft(label);
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
      className: 'nodrag nopan',
    },
  };
};

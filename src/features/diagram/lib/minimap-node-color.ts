import {
  KIND_ACTOR,
  KIND_BOUNDARY,
  KIND_NOTE,
  KIND_USECASE,
  type UmlNode,
} from '@/features/diagram/types';

export const miniMapNodeColor = (node: UmlNode): string => {
  switch (node.data.kind) {
    case KIND_ACTOR:
      return 'var(--chart-1)';
    case KIND_USECASE:
      return 'var(--chart-2)';
    case KIND_BOUNDARY:
      return 'var(--chart-3)';
    case KIND_NOTE:
      return 'var(--chart-4)';
  }
};

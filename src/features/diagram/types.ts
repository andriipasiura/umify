import { type Visibility } from '@prisma/client';

export type DiagramCardData = {
  id: string;
  title: string;
  visibility: Visibility;
  category: string | null;
  tags: string[];
  isFavorite: boolean;
  updatedAt: Date;
};

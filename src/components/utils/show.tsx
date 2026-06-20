import { type ReactNode } from 'react';

type ShowProps = { when: boolean; fallback?: ReactNode; children: ReactNode };

export const Show = ({ when, fallback = null, children }: ShowProps) => (
  <>{when ? children : fallback}</>
);

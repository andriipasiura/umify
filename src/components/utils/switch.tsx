import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

type MatchProps = { when: boolean; children: ReactNode };

export const Match = ({ children }: MatchProps): ReactElement => <>{children}</>;
export const Fallback = ({ children }: { children: ReactNode }): ReactElement => <>{children}</>;

export const Switch = ({ children }: { children: ReactNode }) => {
  let fallback: ReactNode = null;

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;

    if (child.type === Fallback) {
      fallback = child;
      continue;
    }

    if (child.type === Match && (child.props as MatchProps).when) return <>{child}</>;
  }

  return <>{fallback}</>;
};

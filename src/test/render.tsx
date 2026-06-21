import { render, type RenderOptions } from '@testing-library/react';
import {
  NuqsTestingAdapter,
  type OnUrlUpdateFunction,
  type UrlUpdateEvent,
} from 'nuqs/adapters/testing';
import { type ReactElement, type ReactNode } from 'react';

export type { UrlUpdateEvent };

type NuqsOptions = {
  searchParams?: string | URLSearchParams | Record<string, string>;
  onUrlUpdate?: OnUrlUpdateFunction;
};

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  nuqs?: NuqsOptions;
};

const customRender = (ui: ReactElement, { nuqs, ...options }: CustomRenderOptions = {}) => {
  const Providers = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={nuqs?.searchParams ?? ''} onUrlUpdate={nuqs?.onUrlUpdate}>
      {children}
    </NuqsTestingAdapter>
  );

  return render(ui, { wrapper: Providers, ...options });
};

export * from '@testing-library/react';
export { customRender as render };

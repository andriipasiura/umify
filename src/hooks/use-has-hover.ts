'use client';

import { useSyncExternalStore } from 'react';

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

const getSnapshot = () => window.matchMedia(HOVER_QUERY).matches;

const getServerSnapshot = () => true;

export function useHasHover() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

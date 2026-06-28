export const isMac = (): boolean =>
  typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);

export const getModKey = (): string => (isMac() ? '⌘' : 'Ctrl');
export const getUndoShortcut = (): string => (isMac() ? '⌘Z' : 'Ctrl+Z');
export const getRedoShortcut = (): string => (isMac() ? '⇧⌘Z' : 'Ctrl+Shift+Z');

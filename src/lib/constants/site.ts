import { env } from '@/env';

export const SITE_NAME = 'UmiFy';
export const SITE_TAGLINE = 'UML use-case diagrams, simplified';
export const SITE_TITLE = `${SITE_NAME} – ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  'Create, edit, and share UML use-case diagrams in the browser. Free, fast, no install.';
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
export const SITE_OG_IMAGE = '/og-image.png';
export const SITE_KEYWORDS = [
  'UML',
  'use case diagram',
  'diagram editor',
  'UML editor',
  'software design',
] as const;

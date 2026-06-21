import { type DiagramCardData } from '../types';

export const SAMPLE_DIAGRAMS: readonly DiagramCardData[] = [
  {
    id: 'sample-login-flow',
    title: 'Login Flow',
    visibility: 'public',
    category: 'web app',
    tags: ['auth', 'login', 'starter'],
    updatedAt: new Date('2026-05-30T10:00:00.000Z'),
  },
  {
    id: 'sample-ecommerce-checkout',
    title: 'E-commerce Checkout',
    visibility: 'public',
    category: 'product',
    tags: ['ecommerce', 'checkout', 'cart'],
    updatedAt: new Date('2026-05-26T10:00:00.000Z'),
  },
  {
    id: 'sample-account-management',
    title: 'Account Management',
    visibility: 'private',
    category: null,
    tags: ['auth', 'profile', 'settings'],
    updatedAt: new Date('2026-05-20T10:00:00.000Z'),
  },
];

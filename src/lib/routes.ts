export const routes = {
  home: '/',
  signIn: '/sign-in',
  diagrams: '/diagrams',
  favorites: '/favorites',
  settings: '/settings',
  privacyPolicy: '/privacy-policy',
  diagram: (id: string) => `/diagrams/${id}`,
} as const;

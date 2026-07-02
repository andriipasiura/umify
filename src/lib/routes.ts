export const routes = {
  home: '/',
  signIn: '/sign-in',
  diagrams: '/diagrams',
  favorites: '/favorites',
  settings: '/settings',
  privacyPolicy: '/privacy-policy',
  diagram: (id: string) => `/diagrams/${id}`,
  share: (id: string) => `/share/${id}`,
} as const;

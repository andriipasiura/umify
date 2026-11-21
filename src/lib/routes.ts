export const routes = {
  home: '/',
  signIn: '/sign-in',
  favorites: '/favorites',
  settings: '/settings',
  privacyPolicy: '/privacy-policy',
  newDiagram: '/diagrams/new',
  diagram: (id: string) => `/diagrams/${id}`,
  share: (id: string) => `/share/${id}`,
} as const;

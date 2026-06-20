export const routes = {
  home: '/',
  signIn: '/sign-in',
  diagrams: '/diagrams',
  privacyPolicy: '/privacy-policy',
  diagram: (id: string) => `/diagrams/${id}`,
} as const;

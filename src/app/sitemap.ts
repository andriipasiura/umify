import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/constants/site';
import { routes } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}${routes.signIn}`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}${routes.privacyPolicy}`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

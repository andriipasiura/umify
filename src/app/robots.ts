import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/diagrams/', '/favorites', '/settings', '/share/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

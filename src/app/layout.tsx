import './globals.css';

import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { PreferencesProvider } from '@/features/settings/components/preferences-provider';
import { readPreferences } from '@/features/settings/server/preferences';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/constants/site';

const fontSans = Poppins({
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s – ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const prefs = await readPreferences();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={prefs.colorTheme}
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider initial={prefs}>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

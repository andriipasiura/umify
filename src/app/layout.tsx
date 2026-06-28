import './globals.css';

import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { PreferencesProvider } from '@/features/settings/components/preferences-provider';
import { readPreferences } from '@/features/settings/server/preferences';

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
  title: 'UmiFy',
  description: 'UmiFy — UML use-case diagram editor',
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

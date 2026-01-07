import type { Metadata } from 'next';
import { Playfair_Display, Albert_Sans } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/style/tailwind.css';
import LenisProvider from '@/providers/LenisProvider';
import { SuperTokensInit } from '@/providers/SuperTokensInit';
import { DEFAULT_METADATA } from '@/services/metadata';
import { cn } from '@/utils/cn';
import ConditionalAnalytics from '@/components/Analytics/ConditionalAnalytics';
import MetaPixelProvider from '@/providers/MetaPixelProvider';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
});
const albertSans = Albert_Sans({
  subsets: ['latin'],
});

export const metadata: Metadata = DEFAULT_METADATA;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  banner: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${albertSans.className} ${playfairDisplay.className} antialiased`}>
      <MetaPixelProvider />
      <SuperTokensInit>
        <body
          className={cn(
            'flex min-h-screen flex-col scroll-smooth bg-black font-sans text-white',
            'data-[cover]:cover-mode',
          )}>
          <LenisProvider />
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </body>
      </SuperTokensInit>
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <ConditionalAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
    </html>
  );
}

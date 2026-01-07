import type { Metadata } from 'next';
import { Playfair_Display, Albert_Sans } from 'next/font/google';
import '@/style/tailwind.css';
import { SuperTokensInit } from '@/providers/SuperTokensInit';
import { LoadingModalProvider } from '@/hooks/useLoadingModal';
import LoadingModal from '@/components/Modals/LoadingModal';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
});
const albertSans = Albert_Sans({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Simmortals Dashboard',
  description: 'What we remember lives on.',
  robots: {
    index: false,
    follow: false,
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
      sizes: '32x32',
    },
  ],
  openGraph: {
    title: 'Simmortals',
    description: 'What we remember lives on.',
    siteName: 'Simmortals',
    url: 'https://simmortals.com',
    images: [
      {
        url: 'https://simmortals.com/opengraph.png',
        width: 1200,
        height: 630,
        secureUrl: 'https://simmortals.com/opengraph.png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${albertSans.className} ${playfairDisplay.className} antialiased`}>
      <SuperTokensInit>
        <LoadingModalProvider>
          <body className="flex min-h-screen flex-col scroll-smooth bg-black font-sans text-white">
            {children}
            <LoadingModal />
          </body>
        </LoadingModalProvider>
      </SuperTokensInit>
    </html>
  );
}

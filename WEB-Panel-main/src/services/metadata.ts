import { Metadata } from 'next';
import { getEnv } from './env';

export const DEFAULT_METADATA: Metadata = {
  title: 'Simmortals',
  description: 'What we remember lives on.',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
      sizes: '32x32',
    },
  ],
  robots: {
    index: getEnv() !== 'test',
    follow: getEnv() !== 'test',
  },
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

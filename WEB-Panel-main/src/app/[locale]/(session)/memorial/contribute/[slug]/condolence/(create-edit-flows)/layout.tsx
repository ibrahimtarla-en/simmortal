import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
};

// Add this to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('CreateCondolence');
  return (
    <main className="container">
      <div className="flex flex-col justify-around gap-10 px-4 py-10">
        <h1 className="font-serif text-2xl font-medium">{t('title')}</h1>
        {children}
      </div>
    </main>
  );
}

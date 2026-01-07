import { Metadata } from 'next';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <div className="flex flex-col justify-around gap-10 py-10">{children}</div>
    </main>
  );
}

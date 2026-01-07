import Navbar from '@/components/Elements/Navbar/Navbar';
import SuperTokensSessionProvider from '@/providers/SuperTokensSessionProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperTokensSessionProvider>
      <Navbar />
      <main className="container">{children}</main>
    </SuperTokensSessionProvider>
  );
}

import SuperTokensUnverifiedOnlyProvider from '@/providers/SuperTokensUnverifiedOnlyProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperTokensUnverifiedOnlyProvider>
      <main className="container">{children}</main>
    </SuperTokensUnverifiedOnlyProvider>
  );
}

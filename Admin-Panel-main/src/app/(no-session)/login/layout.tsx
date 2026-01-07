import SuperTokensAnonymousProvider from '@/providers/SuperTokensAnonymousOnlyProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SuperTokensAnonymousProvider>{children}</SuperTokensAnonymousProvider>;
}

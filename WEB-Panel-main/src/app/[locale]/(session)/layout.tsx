import SuperTokensSessionProvider from '@/providers/SuperTokensSessionProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SuperTokensSessionProvider>{children}</SuperTokensSessionProvider>;
}

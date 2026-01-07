import SuperTokensSuspendedOnlyProvider from '@/providers/SuperTokensSuspendedOnlyProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SuperTokensSuspendedOnlyProvider>{children}</SuperTokensSuspendedOnlyProvider>;
}

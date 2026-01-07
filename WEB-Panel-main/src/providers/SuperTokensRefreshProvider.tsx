// components/auth/RefreshGate.tsx  (client component)
'use client';
import { useEffect, useState } from 'react';
import Session from 'supertokens-web-js/recipe/session';
import { usePathname } from 'next/navigation';

export default function SuperTokensRefreshProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // OPTIONAL: refresh only if token is near expiry
        // const payload = await Session.getAccessTokenPayloadSecurely();
        // if (payload?.exp * 1000 < Date.now() + 60_000) await Session.attemptRefreshingSession();

        await Session.attemptRefreshingSession(); // cheap when not needed
      } catch {
        // ignore — UI will still show "logged out" after Navbar fetch
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // While we don't know yet, render nothing or a global skeleton so you don't flash logged-out.
  if (!ready) return null;

  return <>{children}</>;
}

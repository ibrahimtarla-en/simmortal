import React from 'react';
import { redirect } from 'next/navigation';
import { ensureSuperTokensInit } from '@/config/backend';
import { TryRefreshComponent } from './TryRefreshClientComponent';
import { getSSRSessionHelper } from '@/services/server/auth/sessionSSRHelper';
import { headers } from 'next/headers';
import { getUser } from '@/services/server/user';
import { UserAccountStatus } from '@/types/user';

ensureSuperTokensInit();

async function SuperTokensSessionProvider({ children }: { children: React.ReactNode }) {
  const { accessTokenPayload, hasToken, error } = await getSSRSessionHelper();
  if (error) {
    return <div>Something went wrong while trying to get the session. Error - {error.message}</div>;
  }

  if (accessTokenPayload === undefined) {
    if (!hasToken) {
      // Get the current URL to redirect back to after login
      const headersList = await headers();
      const fullUrl = headersList.get('x-url') || headersList.get('referer') || '';

      // Extract pathname and search params
      let redirectTo = '/';
      if (fullUrl) {
        try {
          const url = new URL(fullUrl);
          redirectTo = url.pathname + url.search;
        } catch {
          // Fallback if URL parsing fails
          redirectTo = '/';
        }
      }

      // Encode the redirect URL and pass it as a query param
      const loginUrl = `/login?redirect_to=${encodeURIComponent(redirectTo)}`;
      return redirect(loginUrl);
    }

    return <TryRefreshComponent key={Date.now()} />;
  }

  const user = await getUser();
  if (!user) {
    return redirect('/');
  }
  if (user.status === UserAccountStatus.SUSPENDED) {
    return redirect('/suspended');
  }
  if (!user.emailVerified && user.loginMethod === 'emailpassword') {
    return redirect('/verification-sent');
  }

  return <>{children}</>;
}

export default SuperTokensSessionProvider;

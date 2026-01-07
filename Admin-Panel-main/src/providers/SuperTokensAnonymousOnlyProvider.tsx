import React from 'react';
import { redirect } from 'next/navigation';
import { ensureSuperTokensInit } from '@/config/backend';
import { getSSRSessionHelper } from '@/services/server/auth/sessionSSRHelper';

ensureSuperTokensInit();

async function SuperTokensAnonymousProvider({ children }: { children: React.ReactNode }) {
  const { accessTokenPayload, error } = await getSSRSessionHelper();
  if (error) {
    return <div>Something went wrong while trying to get the session. Error - {error.message}</div>;
  }

  if (accessTokenPayload !== undefined) {
    return redirect('/');
  }

  return <>{children}</>;
}

export default SuperTokensAnonymousProvider;

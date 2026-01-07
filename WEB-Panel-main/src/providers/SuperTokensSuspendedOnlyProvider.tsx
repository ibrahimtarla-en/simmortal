import React from 'react';
import { redirect } from 'next/navigation';
import { ensureSuperTokensInit } from '@/config/backend';
import { getSSRSessionHelper } from '@/services/server/auth/sessionSSRHelper';
import { getUser } from '@/services/server/user';
import { UserAccountStatus } from '@/types/user';

ensureSuperTokensInit();

async function SuperTokensSuspendedOnlyProvider({ children }: { children: React.ReactNode }) {
  const { accessTokenPayload, error } = await getSSRSessionHelper();
  if (error) {
    return <div>Something went wrong while trying to get the session. Error - {error.message}</div>;
  }

  if (accessTokenPayload === undefined) {
    return redirect('/');
  }

  const user = await getUser();
  if (!user) {
    return redirect('/');
  }
  if (user.status !== UserAccountStatus.SUSPENDED) {
    return redirect('/');
  }

  return <>{children}</>;
}

export default SuperTokensSuspendedOnlyProvider;

import React from 'react';
import { redirect } from 'next/navigation';
import { ensureSuperTokensInit } from '@/config/backend';
import { TryRefreshComponent } from './TryRefreshClientComponent';
import { getSSRSessionHelper } from '@/services/server/auth/sessionSSRHelper';
import UserRoles from 'supertokens-node/recipe/userroles';
import ForceLogoutComponent from './ForceLogoutComponent';

ensureSuperTokensInit();

async function SuperTokensSessionProvider({ children }: { children: React.ReactNode }) {
  const { accessTokenPayload, hasToken, error } = await getSSRSessionHelper();

  if (error) {
    return <div>Something went wrong while trying to get the session. Error - {error.message}</div>;
  }

  if (accessTokenPayload === undefined) {
    if (!hasToken) {
      return redirect('/login');
    }
    return <TryRefreshComponent key={Date.now()} />;
  }

  // Role check

  const userId = accessTokenPayload.sub;
  const tennantId = accessTokenPayload.tId;

  if (!tennantId || !userId) {
    console.log('No tennantId or userId found in access token payload', { tennantId, userId });
    return <ForceLogoutComponent />;
  }

  // Check for a single required role
  const { roles } = await UserRoles.getRolesForUser(tennantId, userId);
  console.log('User roles', { roles });
  if (!roles.includes('admin')) {
    console.log('User does not have the required role', { roles });
    return <ForceLogoutComponent />;
  }

  return <>{children}</>;
}

export default SuperTokensSessionProvider;

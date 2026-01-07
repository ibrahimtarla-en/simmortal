import React from 'react';
import { Login } from '@/components';
import { DynamicRouteParams } from '@/types/util';

async function LoginPage({ searchParams }: DynamicRouteParams) {
  const queryParams = await searchParams;
  const redirectTo = queryParams?.redirect_to as string | undefined;
  if (redirectTo) {
    return <Login redirectTo={redirectTo} />;
  }
  return <Login />;
}

export default LoginPage;

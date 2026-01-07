import React from 'react';
import { SignUp } from '@/components';
import { DynamicRouteParams } from '@/types/util';

async function SignUpPage({ searchParams }: DynamicRouteParams) {
  const queryParams = await searchParams;
  const redirectTo = queryParams?.redirect_to as string | undefined;
  return <SignUp redirectTo={redirectTo} />;
}

export default SignUpPage;

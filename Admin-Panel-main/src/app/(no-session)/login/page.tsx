'use client';
import { GoogleButton } from '@/components';
import { loginWithGoogle } from '@/services/server/auth/supertokens';
import Logo from '@/assets/brand/logo.svg';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();

      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="container flex grow flex-col items-center justify-center gap-10">
      <Logo width={300} />
      <GoogleButton disabled={isLoading} onClick={handleGoogleLogin} />
    </main>
  );
}

export default LoginPage;

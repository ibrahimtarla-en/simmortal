'use client';
import { useNavbarBanner } from '@/hooks/useNavbarBanner';
import { Link } from '@/i18n/navigation';
import { exists } from '@/utils/exists';
import React from 'react';

function NavbarBanner() {
  const { state } = useNavbarBanner();
  if (!exists(state)) {
    return null;
  }
  return (
    <div className="bg-mauveine-900 border-shine-y-1 w-full py-1.5 text-center">
      <div className="container flex justify-center">
        {state.redirectTo ? (
          <Link href={state.redirectTo}>{state.message}</Link>
        ) : (
          <p>{state.message}</p>
        )}
      </div>
    </div>
  );
}

export default NavbarBanner;

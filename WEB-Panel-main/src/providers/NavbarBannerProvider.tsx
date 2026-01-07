'use client';
import React, { createContext, useMemo, useState } from 'react';

interface NavbarBannerProviderContext {
  state: BannerState | null;
  showBanner: ({ message }: { message: string }) => void;
  hideBanner: () => void;
}

type BannerState = {
  redirectTo?: string;
  message: string;
};

export const NavbarBannerContext = createContext<NavbarBannerProviderContext | null>(null);

export function NavbarBannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BannerState | null>(null);
  const api = useMemo(
    () => ({
      showBanner: (newState: BannerState) => {
        setState(newState);
      },
      hideBanner: () => setState(null),
    }),
    [],
  );
  return (
    <NavbarBannerContext.Provider value={{ ...api, state }}>
      {children}
    </NavbarBannerContext.Provider>
  );
}

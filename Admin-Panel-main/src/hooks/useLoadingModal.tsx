'use client';
import React, { createContext, useMemo, useState } from 'react';

import { useContext } from 'react';

export const useLoadingModal = () => {
  const context = useContext(LoadingModalContext);
  if (!context) throw new Error('useLoadingModal must be used within <LoadingModalProvider>');
  return context;
};

interface LoadingModalProviderContext {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const LoadingModalContext = createContext<LoadingModalProviderContext | null>(null);

export function LoadingModalProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const api = useMemo(
    () => ({
      showLoading: () => {
        setIsLoading(true);
      },
      hideLoading: () => setIsLoading(false),
    }),
    [],
  );
  return (
    <LoadingModalContext.Provider value={{ ...api, isLoading }}>
      {children}
    </LoadingModalContext.Provider>
  );
}

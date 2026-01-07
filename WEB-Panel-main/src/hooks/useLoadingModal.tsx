'use client';
import { LoadingModalContext } from '@/providers/LoadingModalProvider';
import { useContext } from 'react';

export const useLoadingModal = () => {
  const context = useContext(LoadingModalContext);
  if (!context) throw new Error('useLoadingModal must be used within <LoadingModalProvider>');
  return context;
};

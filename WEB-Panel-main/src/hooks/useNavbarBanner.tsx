'use client';
import { NavbarBannerContext } from '@/providers/NavbarBannerProvider';
import { useContext } from 'react';

export const useNavbarBanner = () => {
  const context = useContext(NavbarBannerContext);
  if (!context) throw new Error('useBanner must be used within <NavbarBannerProvider>');
  return context;
};

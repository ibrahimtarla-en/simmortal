'use client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import loading from '@/assets/lottie/loading.json';
import React, { useEffect, useRef } from 'react';
import Logo from '@/assets/brand/logo.colored.svg';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useLenis } from 'lenis/react';

function LoadingModal() {
  const scrollPosition = useRef(0);
  const { isLoading } = useLoadingModal();
  const lenis = useLenis();

  useEffect(() => {
    if (isLoading) {
      scrollPosition.current = window.pageYOffset;
      console.log(scrollPosition.current);

      lenis?.stop();
    } else {
      lenis?.start();
    }
    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [isLoading, lenis]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-999999999 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
      <DotLottieReact data={loading} loop autoplay className="h-30" />
      <Logo className="h-7" />
    </div>
  );
}

export default LoadingModal;

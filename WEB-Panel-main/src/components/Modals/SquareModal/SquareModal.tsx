'use client';
import Button from '@/components/Elements/Button/Button';
import { cn } from '@/utils/cn';
import React, { useEffect } from 'react';
import Close from '@/assets/icons/close.svg';
import { useBreakpoints } from '@/hooks';
import { useLenis } from 'lenis/react';

interface SquareModalProps {
  open?: boolean;
  preventsPageScroll?: boolean;
  children?: React.ReactNode;
  onCloseClicked?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  closable?: boolean;
}

function SquareModal({
  open,
  preventsPageScroll,
  children,
  onCloseClicked,
  closable = true,
}: SquareModalProps) {
  const lenis = useLenis();
  const { isBelow } = useBreakpoints();

  useEffect(() => {
    if (open && preventsPageScroll) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [open, preventsPageScroll, lenis]);

  return (
    <>
      {open && (
        <div className="fixed top-0 right-0 bottom-0 left-0 z-99999999 h-screen w-full overflow-y-auto backdrop-blur-sm">
          <div
            className={cn(
              'border-shine-1 bg-gradient-card-fill relative mx-auto mt-33 aspect-square w-88 rounded-2xl px-3 py-7',
              'md:w-135 md:px-14 md:py-14',
            )}>
            {children}
            {closable && (
              <Button
                size={isBelow('xl') ? 'small' : 'default'}
                icon={<Close />}
                onClick={onCloseClicked}
                className="absolute top-0 right-0 z-99 translate-x-2 -translate-y-2"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SquareModal;

'use client';
import React, { useEffect } from 'react';
import Close from '@/assets/icons/close.svg';
import Button from '@/components/Elements/Button/Button';
import { motion } from 'motion/react';
import { Condolence } from '@/types/condolence';
import CondolenceCard from '../CondolenceCard/CondolenceCard';
import { useLenis } from 'lenis/react';

interface CondolenceOverlayProps {
  condolence: Condolence;
  onClose: () => void;
  onLike?: () => void;
  onUnlike?: () => void;
}

function CondolenceOverlay({ condolence, onClose, onLike, onUnlike }: CondolenceOverlayProps) {
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();

    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [lenis]);

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4, ease: 'easeIn' } }}
      key={`${condolence.id}-overlay`}
      className="fixed inset-0 z-9999999 bg-zinc-800/30 backdrop-blur-xs"
      onClick={onClose}>
      <div className="container flex h-full w-full items-center justify-center">
        <div className="relative w-full max-w-xl px-5 py-5" onClick={(e) => e.stopPropagation()}>
          <Button icon={<Close />} onClick={onClose} className="absolute top-0 right-0 z-99" />
          <CondolenceCard condolence={condolence} onLike={onLike} onUnlike={onUnlike} />
        </div>
      </div>
    </motion.div>
  );
}

export default CondolenceOverlay;

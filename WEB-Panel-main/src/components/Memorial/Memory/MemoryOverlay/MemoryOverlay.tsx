'use client';
import { isMemoryWithAsset, Memory } from '@/types/memory';
import React, { useEffect, useRef, useState } from 'react';
import Close from '@/assets/icons/close.svg';
import Button from '@/components/Elements/Button/Button';
import { motion } from 'motion/react';
import { AssetType } from '@/types/asset';
import Image from 'next/image';
import MemoryCard from '../MemoryCard/MemoryCard';
import { cn } from '@/utils/cn';
import { useBreakpoints } from '@/hooks';
import { useLenis } from 'lenis/react';

interface MemoryOverlayProps {
  memory: Memory;
  onClose: () => void;
  onLike?: () => void;
  onUnlike?: () => void;
  assetOnly?: boolean;
}

function MemoryOverlay({
  memory,
  onClose,
  onLike,
  onUnlike,
  assetOnly = false,
}: MemoryOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1024,
    height: 1024,
  });
  const { containerAspectRatio } = useBreakpoints();
  const didPauseAudioRef = useRef(false);
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();

    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [lenis]);

  function handleVideoLoadedMetadata() {
    setDimensions({
      width: videoRef.current?.videoWidth || 1024,
      height: videoRef.current?.videoHeight || 1024,
    });
  }

  function handleImageLoadedMetadata(event: React.SyntheticEvent<HTMLImageElement, Event>) {
    setDimensions({
      width: event.currentTarget.naturalWidth || 1024,
      height: event.currentTarget.naturalHeight || 1024,
    });
  }

  useEffect(() => {
    if (isMemoryWithAsset(memory) && memory.assetType === AssetType.VIDEO && videoRef.current) {
      const audioPlayer = document.getElementById(
        'memorial-audio-player',
      ) as HTMLAudioElement | null;
      if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        didPauseAudioRef.current = true;
      }
    }
    return () => {
      const audioPlayer = document.getElementById(
        'memorial-audio-player',
      ) as HTMLAudioElement | null;
      if (didPauseAudioRef.current && audioPlayer) {
        audioPlayer.play();
      }
    };
  }, [memory]);

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4, ease: 'easeIn' } }}
      key={`${memory.id}-overlay`}
      className="fixed inset-0 z-9999999 container bg-zinc-800/30 backdrop-blur-xs"
      onClick={onClose}>
      <div className="relative flex h-full w-full items-center justify-center py-10">
        <div
          className={cn(
            'relative max-h-[calc(100%-(10*var(--spacing)))] max-w-full',
            containerAspectRatio > dimensions.width / dimensions.height ? 'h-full' : 'w-full',
            !assetOnly && 'h-auto w-full max-w-100',
          )}
          style={{ aspectRatio: dimensions.width / dimensions.height }}
          onClick={(e) => e.stopPropagation()}>
          <Button icon={<Close />} onClick={onClose} className="absolute -top-4 -right-4 z-99" />
          {assetOnly && (
            <>
              {isMemoryWithAsset(memory) && memory.assetType == AssetType.VIDEO && (
                <video
                  ref={videoRef}
                  src={memory.assetPath}
                  className={cn('bg-gradient-card-fill h-full w-full object-contain')}
                  controls={true}
                  playsInline
                  autoPlay
                  loop
                  onLoadedMetadata={handleVideoLoadedMetadata}
                />
              )}
              {isMemoryWithAsset(memory) && memory.assetType == AssetType.IMAGE && (
                <Image
                  fill
                  className={'bg-gradient-card-fill object-contain'}
                  src={memory.assetPath}
                  alt={'memory image'}
                  sizes="100vw"
                  onLoadedMetadata={handleImageLoadedMetadata}
                />
              )}
            </>
          )}

          {!assetOnly && (
            <MemoryCard memory={memory} onLike={onLike} onUnlike={onUnlike} showVideoControls />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MemoryOverlay;

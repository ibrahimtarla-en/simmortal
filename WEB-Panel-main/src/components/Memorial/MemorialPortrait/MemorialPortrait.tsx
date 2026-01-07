import { cn } from '@/utils/cn';
import Image from 'next/image';
import React from 'react';
import { MemorialFrame, MemorialTribute } from '@/types/memorial';
import { getFrame, getFrameBase, getTribute } from './MemorialPortrait.util';
import PremiumTag from '@/components/Elements/PremiumTag/PremiumTag';
import { AssetType } from '@/types/asset';

interface MemorialPortraitProps {
  imageUrl: string;
  name?: string;
  className?: string;
  fileType?: AssetType;
  overlay?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  frame?: MemorialFrame;
  showPremiumBadge?: boolean;
  isPremium?: boolean;
  tribute?: MemorialTribute;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  posterUrl?: string;
  onClick?: () => void;
}

function MemorialPortrait({
  imageUrl,
  name,
  className,
  fileType = AssetType.IMAGE,
  overlay,
  sizes,
  priority,
  frame = 'default',
  tribute = 'default',
  isPremium = false,
  showPremiumBadge = false,
  autoplay = false,
  controls = false,
  loop = false,
  muted = true,
  posterUrl,
  onClick,
}: MemorialPortraitProps) {
  return (
    <div className={cn('relative', onClick && 'cursor-pointer', className)} onClick={onClick}>
      <div className="relative p-[15.90%] pb-[19.65%]">
        <div className="aspect-square h-full w-full">
          <div className="bg-gradient-card-fill relative aspect-square max-h-full max-w-full">
            {showPremiumBadge && (
              <PremiumTag
                isPremium={isPremium}
                className="absolute top-0 left-0 z-10 -translate-y-full"
              />
            )}
            {fileType == AssetType.IMAGE && (
              <Image
                className="bg-gradient-card-fill overflow-clip object-cover"
                src={imageUrl}
                alt={name || 'Memorial Portrait'}
                fill
                sizes={sizes}
                priority={priority}
              />
            )}
            {fileType == AssetType.VIDEO && (
              <video
                src={imageUrl}
                className="bg-gradient-card-fill absolute inset-0 z-8 h-full w-full object-cover"
                controls={controls}
                playsInline
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                poster={posterUrl}
              />
            )}

            {overlay && (
              <div className="absolute bottom-0 left-0 w-full bg-linear-0 from-black/100 from-40% to-black/0 to-100% p-2.5 pt-15">
                {overlay}
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute top-0 left-0 z-9 aspect-square h-full w-full">
          {<Image src={getFrame(frame)} alt={frame} priority={priority} sizes={sizes} />}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 aspect-[427/118] w-full">
        <div className="absolute top-[25.42%] right-0 bottom-[18.65%] left-0">
          {tribute !== 'default' && (
            <Image
              src={getFrameBase(frame)}
              alt="frame-base"
              priority={priority}
              sizes={sizes}
              fill
            />
          )}
        </div>
        {tribute !== 'default' && (
          <Image src={getTribute(tribute)} alt={tribute} priority={priority} sizes={sizes} fill />
        )}
      </div>
    </div>
  );
}

export default MemorialPortrait;

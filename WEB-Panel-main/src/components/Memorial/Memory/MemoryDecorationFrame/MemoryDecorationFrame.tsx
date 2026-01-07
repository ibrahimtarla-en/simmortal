import { cn } from '@/utils/cn';
import Image from 'next/image';
import React from 'react';
import { useTranslations } from 'next-intl';
import { MemorialDecoration } from '@/types/memorial';
import { getMemorialDecoration } from '@/utils/memorial';

interface MemoryDecorationFrameProps {
  name?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decoration?: MemorialDecoration;
}

function MemoryDecorationFrame({
  className,
  priority,
  sizes,
  decoration = 'no-decoration',
}: MemoryDecorationFrameProps) {
  const t = useTranslations('Common.DecorationNames');
  return (
    <div className={cn('relative', className)}>
      <div className="border-shine-1 bg-gradient-card-fill relative flex aspect-[190/235] w-full items-center justify-center overflow-hidden rounded-lg">
        {decoration !== 'no-decoration' && (
          <Image
            src={getMemorialDecoration(decoration)}
            alt={decoration}
            priority={priority}
            sizes={sizes}
          />
        )}
        {decoration === 'no-decoration' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-center text-xl">{t('no-decoration')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemoryDecorationFrame;

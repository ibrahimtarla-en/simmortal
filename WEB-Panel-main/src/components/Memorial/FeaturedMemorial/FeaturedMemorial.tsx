'use client';
import React from 'react';
import { PublishedMemorial } from '@/types/memorial';
import { cn } from '@/utils/cn';
import Button from '@/components/Elements/Button/Button';
import MemorialPortrait from '../MemorialPortrait/MemorialPortrait';
import { formatDate } from '@/utils/date';
import { useLocale, useTranslations } from 'next-intl';
import { AssetType } from '@/types/asset';
import { useRouter } from '@/i18n/navigation';

interface FeaturedMemorialProps {
  memorial: PublishedMemorial;
  align?: 'left' | 'right';
}

function FeaturedMemorial({ memorial, align = 'left' }: FeaturedMemorialProps) {
  const t = useTranslations('FeaturedMemorial');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex max-w-228 flex-col items-center gap-9 font-serif',
        'md:flex-row md:justify-start md:gap-16',
        'lg:gap-24',
        align === 'right' && 'md:flex-row-reverse',
      )}>
      <div className="w-85 shrink-0">
        <MemorialPortrait
          fileType={memorial.livePortraitPath ? AssetType.VIDEO : AssetType.IMAGE}
          frame={memorial.frame}
          tribute={memorial.tribute}
          imageUrl={memorial.livePortraitPath || memorial.imagePath}
          sizes="(max-width: 1440px) 17rem, 27.5rem"
          priority
          autoplay
          loop
          muted
          onClick={() => router.push(`/memorial/${memorial.slug}`)}
        />
      </div>
      <div className="flex flex-col gap-10">
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4',
            align === 'left' ? 'md:items-start md:text-left' : 'md:items-end md:text-right',
          )}>
          <h2 className={cn('text-2xl', 'lg:text-3xl', 'xl:text-4xl')}>{memorial.name}</h2>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
            <div>
              <p className="text-2xs font-sans font-light uppercase">{tCommon('born')}</p>
              <p className="lg:text-lg xl:text-2xl">
                {formatDate(memorial.dateOfBirth, 'DD MMM YYYY', locale)}
              </p>
              <p className="text-2xs font-sans font-light">{memorial.placeOfBirth}</p>
            </div>
            <hr className="my-auto w-16" />
            <div>
              <p className="text-2xs font-sans font-light uppercase">{tCommon('died')}</p>
              <p className="lg:text-lg xl:text-2xl">
                {formatDate(memorial.dateOfDeath, 'DD MMM YYYY', locale)}
              </p>
              <p className="text-2xs font-sans font-light">{memorial.placeOfDeath}</p>
            </div>
          </div>
        </div>
        <div
          className={cn(
            'text-center font-sans font-light',
            'md:text-sm',
            align === 'left' ? 'md:text-left' : 'md:text-right',
            'lg:text-base',
            'xl:text-lg',
          )}>
          {memorial.about}
        </div>
        <div
          className={cn(
            'flex justify-center',
            align === 'right' ? 'md:justify-end' : 'md:justify-start',
          )}>
          <Button className="font-sans" role="link" href={`/memorial/${memorial.slug}`}>
            {t('viewMemorial')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedMemorial;

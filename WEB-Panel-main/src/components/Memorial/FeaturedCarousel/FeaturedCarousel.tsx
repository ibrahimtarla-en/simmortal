'use client';
import React from 'react';
import MemorialCarousel from '../MemorialCarousel/MemorialCarousel';
import { useTranslations } from 'next-intl';
import { PublishedMemorial } from '@/types/memorial';
import Button from '@/components/Elements/Button/Button';
import { cn } from '@/utils/cn';

interface FeaturedCarouselProps {
  memorials: PublishedMemorial[];
}

function FeaturedCarousel({ memorials }: FeaturedCarouselProps) {
  const t = useTranslations('VisitMemorial.FeaturedCarousel');
  const tCommon = useTranslations('Common');
  return (
    <div
      className={cn(
        'my-20 flex flex-col items-center justify-between gap-10',
        'md:flex-row-reverse',
        'lg:mx-5',
        'xl:mx-10 xl:gap-16',
        '2xl:mx-20',
      )}>
      <MemorialCarousel
        memorials={memorials}
        className={cn('w-full shrink-0', 'md:w-0 md:grow')}
        clickable
      />
      <div
        className={cn(
          'flex w-full shrink-0 flex-col items-center gap-5 px-5 text-center',
          'md:w-65 md:items-start md:px-0 md:text-left',
          'xl:w-90',
          '2xl:w-100',
        )}>
        <h2
          className={cn(
            'font-serif text-3xl font-medium',
            'md:text-2xl',
            'lg:text-3xl',
            'xl:text-4xl',
          )}>
          {t('title')}
        </h2>
        <p className={cn('font-light', 'md:text-sm', 'lg:text-base', 'xl:text-lg')}>
          {t('description')}
        </p>
        <Button role="link" href={`/memorial/search-results?showFeatured=true`}>
          {tCommon('viewAll')}
        </Button>
      </div>
    </div>
  );
}

export default FeaturedCarousel;

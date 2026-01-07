'use client';
import React, { useRef } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { useBreakpoints } from '@/hooks';
import { useTranslations } from 'next-intl';
import Button from '@/components/Elements/Button/Button';
import ArrowGo from '@/assets/icons/arrow-go.svg';

const features = [
  'memorial',
  'location',
  'simmtag',
  'lifestory',
  'memory',
  'condolence',
  'donation',
];

function FeaturesCarousel() {
  const t = useTranslations('HomePage.FeaturesCarousel');
  const swiperRef = useRef<SwiperRef>(null);
  const { isBelow } = useBreakpoints();

  return (
    <div className={cn('flex flex-col gap-12 py-5', 'lg:gap-20', 'xl:gap-24')}>
      <div className="flex items-center justify-between gap-4">
        <h1
          className={cn(
            'max-w-86 font-serif text-lg font-semibold whitespace-pre-line',
            'lg:max-w-120 lg:text-2xl',
            'xl:max-w-150 xl:text-3xl',
          )}>
          {t('title')}
        </h1>
        <div className="flex gap-3">
          <Button
            size={isBelow('lg') ? 'small' : 'default'}
            icon={<ArrowGo className="rotate-180" />}
            onClick={() => swiperRef.current?.swiper.slidePrev()}
          />
          <Button
            size={isBelow('lg') ? 'small' : 'default'}
            icon={<ArrowGo />}
            onClick={() => swiperRef.current?.swiper.slideNext()}
          />
        </div>
      </div>
      <div className="relative">
        <Swiper
          ref={swiperRef}
          loop={true}
          slidesPerView={'auto'}
          spaceBetween={36}
          className="relative"
          centeredSlides>
          {features.map((feature) => (
            <SwiperSlide
              key={feature}
              className={cn(
                '!flex !h-auto !w-56 flex-col justify-between',
                'md:!w-62',
                'lg:!w-75',
                'xl:!w-94',
              )}>
              <div>
                <h3 className={cn('font-serif text-sm font-semibold', 'lg:text-base')}>
                  {t(`${feature}.title`)}
                </h3>
                <p className={cn('text-xs font-light', 'lg:text-sm')}>
                  {t(`${feature}.description`)}
                </p>
              </div>
              <div className="border-shine-1 relative mt-3 w-full overflow-clip rounded-xl">
                <Image
                  width={854}
                  height={1120}
                  sizes="400px"
                  src={`/features/${feature}.jpg`}
                  alt={`Feature ${feature}`}
                  className="mt-auto object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute top-0 -left-0.5 z-999 h-full w-1/8 bg-linear-to-r from-black from-0% to-transparent" />
        <div className="absolute top-0 -right-0.5 z-999 h-full w-1/8 max-w-20 bg-linear-to-l from-black from-0% to-transparent" />
      </div>
    </div>
  );
}

export default FeaturesCarousel;

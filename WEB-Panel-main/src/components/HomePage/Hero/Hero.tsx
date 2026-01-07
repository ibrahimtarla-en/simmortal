'use client';
import Button from '@/components/Elements/Button/Button';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { useBreakpoints } from '@/hooks';

function Hero() {
  const t = useTranslations('HomePage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { isAbove, aspectRatio } = useBreakpoints();

  return (
    <section id="hero" className="relative top-2 h-[calc(100lvh-4.5rem)] w-full overflow-clip">
      <div className="absolute inset-0 w-full">
        {aspectRatio > 1 && (
          <video
            loop
            muted
            playsInline
            autoPlay
            className="h-full w-full object-contain object-[75%_center]"
            src={getVideoSource(locale, true)}
          />
        )}
        {aspectRatio <= 1 && (
          <video
            loop
            muted
            playsInline
            autoPlay
            className={cn('h-full w-full object-cover object-top', 'md:object-[center_10%]')}
            src={getVideoSource(locale, false)}
          />
        )}
      </div>
      <motion.div
        className={cn('h-full w-full px-4', aspectRatio <= 1 ? 'text-center' : 'text-left')}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 0.5 }}>
        <div
          className={cn(
            'relative flex w-full flex-col justify-center gap-6 pt-4',
            aspectRatio <= 1
              ? 'h-1/3 items-center'
              : 'h-full max-w-[calc(min(50%,500px))] items-start',
          )}>
          <h1
            className={cn(
              'relative font-serif text-2xl font-semibold',
              'lg:text-3xl',
              'xl:text-4xl',
            )}>
            {t('title')}
          </h1>
          <h2 className={cn('relative', 'lg:text-lg', 'xl:text-xl')}>{t('tagline')}</h2>
          <Button role="link" href="/memorial/create" size={isAbove('lg') ? 'default' : 'small'}>
            {tCommon('createMemorial')}
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;

function getVideoSource(locale: string, isTabletOrBigger: boolean) {
  switch (locale) {
    case 'tr':
      return isTabletOrBigger ? '/landing/sec_0_tr.mp4' : '/landing/sec_0_tr_vertical.mp4';
    default:
      return isTabletOrBigger ? '/landing/sec_0_en.mp4' : '/landing/sec_0_en_vertical.mp4';
  }
}

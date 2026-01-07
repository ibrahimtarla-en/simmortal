'use client';
import Button from '@/components/Elements/Button/Button';
import { useBreakpoints } from '@/hooks';
import { cn } from '@/utils/cn';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

function HomeVideoSections() {
  const t = useTranslations('HomeVideosSection');
  const locale = useLocale();
  const { isAbove } = useBreakpoints();

  return (
    <>
      <section
        className={cn(
          'relative aspect-[9/16] max-h-[calc(100lvh-4.5rem)] w-full overflow-clip',
          'md:aspect-video',
        )}>
        <div className={cn('relative flex h-full w-full', 'md:items-center')}>
          {isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_1_tr.mp4" />}
              {locale === 'en' && <source src="/landing/sec_1_en.mp4" />}
            </video>
          )}
          {!isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_1_tr_vertical.mp4" />}
              {locale === 'en' && <source src="/landing/sec_1_en_vertical.mp4" />}
            </video>
          )}
          <div
            className={cn(
              'relative mt-16 flex flex-col items-center gap-5',
              'md:mt-0 md:max-w-78',
              'lg:max-w-98',
              'xl:max-w-114',
            )}>
            <p className={cn('text-center', 'md:text-left md:text-base', '2xl:text-lg')}>
              {t.rich('SimmTagSection.description', {
                simmtag: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </p>
            <div className="flex">
              <Button role="link" href="/shop">
                {t('SimmTagSection.buttonLabel')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section
        className={cn(
          'relative aspect-[9/16] max-h-[calc(100lvh-4.5rem)] w-full overflow-clip',
          'md:aspect-video',
        )}>
        <div className={cn('relative flex h-full w-full', 'md:items-center md:justify-end')}>
          {isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              <source src="/landing/sec_2.mp4" />
            </video>
          )}
          {!isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              <source src="/landing/sec_2_vertical.mp4" />
            </video>
          )}
          <div
            className={cn(
              'relative mt-16 flex flex-col items-center gap-5',
              'md:mt-0 md:max-w-64',
              'lg:max-w-72',
              'xl:max-w-94',
              '2xl:max-w-100',
            )}>
            <p className={cn('text-center text-sm', 'md:text-left md:text-base', '2xl:text-lg')}>
              {t.rich('DigitalSimmTagSection.description', {
                simmtag: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </p>
            <div className="flex">
              <Button role="link" href="/memorial/create">
                {t('DigitalSimmTagSection.buttonLabel')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section
        className={cn(
          'relative aspect-[9/16] max-h-[calc(100lvh-4.5rem)] w-full overflow-clip',
          'md:aspect-video',
        )}>
        <div className={cn('relative flex h-full w-full', 'md:items-center')}>
          {isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_3_tr.mp4" />}
              {locale === 'en' && <source src="/landing/sec_3_en.mp4" />}
            </video>
          )}
          {!isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_3_tr_vertical.mp4" />}
              {locale === 'en' && <source src="/landing/sec_3_en_vertical.mp4" />}
            </video>
          )}
          <div
            className={cn(
              'relative mt-16 flex flex-col items-center gap-5',
              'md:mt-0 md:max-w-78',
              'lg:max-w-98',
              'xl:max-w-114',
            )}>
            <p className={cn('text-center', 'md:text-left md:text-base', '2xl:text-lg')}>
              {t.rich('TimelineSection.description', {
                simmtag: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </p>
            <div className="flex">
              <Button role="link" href="/memorial/create">
                {t('TimelineSection.buttonLabel')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section
        className={cn(
          'relative aspect-[9/16] max-h-[calc(100lvh-4.5rem)] w-full overflow-clip',
          'md:aspect-video',
        )}>
        <div className={cn('relative flex h-full w-full', 'md:justify-center')}>
          {isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_4_tr.mp4" />}
              {locale === 'en' && <source src="/landing/sec_4_en.mp4" />}
            </video>
          )}
          {!isAbove('md') && (
            <video loop muted playsInline autoPlay className="absolute h-full w-full">
              {locale === 'tr' && <source src="/landing/sec_4_tr_vertical.mp4" />}
              {locale === 'en' && <source src="/landing/sec_4_en_vertical.mp4" />}
            </video>
          )}
          <div className={cn('relative mt-16 flex flex-col items-center gap-5')}>
            <p className={cn('text-center', 'md:text-base', '2xl:text-lg')}>
              {t('DonationSection.description')}
            </p>
            <div className="flex">
              <Button role="link" href="/memorial">
                {t('DonationSection.buttonLabel')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeVideoSections;

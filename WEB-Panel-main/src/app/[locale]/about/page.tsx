import { cn } from '@/utils/cn';
import { getLocale, getTranslations } from 'next-intl/server';
import React from 'react';
import Connection from '@/assets/icons/values/connection.svg';
import Creativity from '@/assets/icons/values/creativity.svg';
import Innovation from '@/assets/icons/values/innovation.svg';
import Protection from '@/assets/icons/values/protection.svg';
import Responsibility from '@/assets/icons/values/responsibility.svg';

async function AboutPage() {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations('About'),
    getTranslations('Common'),
    getLocale(),
  ]);

  return (
    <main className={cn('container flex flex-col gap-5 py-5', '2xl:gap-14')}>
      <div>
        <video
          src={`/about/promo_${locale}.mp4`}
          controls
          className={cn('aspect-video w-full')}
          poster="/about/poster.jpg"
          playsInline
        />
      </div>
      <div className="flex flex-col gap-16">
        <div>
          <h1 className="my-2.5 font-serif text-xl font-medium">{tCommon('about')}</h1>
          <p className="text-lg font-extralight whitespace-pre-line">
            {t.rich('aboutText', {
              bold: (chunks) => <span className="font-bold">{chunks}</span>,
            })}
          </p>
        </div>
        <div>
          <h1 className="my-2.5 font-serif text-xl font-medium">{t('purposeTitle')}</h1>
          <p className="text-lg font-extralight whitespace-pre-line">{t('purposeText')}</p>
        </div>
        <div>
          <h1 className="my-2.5 font-serif text-xl font-medium">{t('promiseTitle')}</h1>
          <p className="text-lg font-extralight whitespace-pre-line">{t('promiseText')}</p>
        </div>
        <div>
          <h1 className="my-2.5 font-serif text-xl font-medium">{t('valuesTitle')}</h1>
          <div className={cn('mt-6 grid grid-cols-2 gap-5', 'sm:grid-cols-6', 'xl:grid-cols-10')}>
            <div className="col-span-2 flex min-h-60 flex-col gap-3 rounded-lg bg-zinc-900 px-5 py-7.5">
              <Connection className="text-mauveine-500 h-6 w-6" />
              <h3 className="text-lg font-bold">{t('Values.connection.title')}</h3>
              <p className="text- text-sm font-extralight">{t('Values.connection.description')}</p>
            </div>
            <div className="col-span-2 flex min-h-60 flex-col gap-3 rounded-lg bg-zinc-900 px-5 py-7.5">
              <Innovation className="text-mauveine-500 h-6 w-6" />
              <h3 className="text-lg font-bold">{t('Values.innovation.title')}</h3>
              <p className="text- text-sm font-extralight">{t('Values.innovation.description')}</p>
            </div>
            <div className="col-span-2 flex min-h-60 flex-col gap-3 rounded-lg bg-zinc-900 px-5 py-7.5">
              <Creativity className="text-mauveine-500 h-6 w-6" />
              <h3 className="text-lg font-bold">{t('Values.creativity.title')}</h3>
              <p className="text- text-sm font-extralight">{t('Values.creativity.description')}</p>
            </div>
            <div
              className={cn(
                'col-span-2 flex min-h-60 flex-col gap-3 rounded-lg bg-zinc-900 px-5 py-7.5',
                'sm:col-start-2',
                'xl:col-start-auto',
              )}>
              <Responsibility className="text-mauveine-500 h-6 w-6" />
              <h3 className="text-lg font-bold">{t('Values.responsibility.title')}</h3>
              <p className="text- text-sm font-extralight">
                {t('Values.responsibility.description')}
              </p>
            </div>
            <div className="col-span-2 flex min-h-60 flex-col gap-3 rounded-lg bg-zinc-900 px-5 py-7.5">
              <Protection className="text-mauveine-500 h-6 w-6" />
              <h3 className="text-lg font-bold">{t('Values.protection.title')}</h3>
              <p className="text- text-sm font-extralight">{t('Values.protection.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AboutPage;

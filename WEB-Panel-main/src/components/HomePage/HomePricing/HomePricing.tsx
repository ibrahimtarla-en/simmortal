'use client';
import Button from '@/components/Elements/Button/Button';
import LabeledSwitch from '@/components/Elements/LabeledSwitch/LabeledSwitch';
import PremiumTag from '@/components/Elements/PremiumTag/PremiumTag';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import Check from '@/assets/icons/check.svg';

interface HomePricingProps {
  freePrice: string;
  monthlyPrice: string;
  annualPrice: string;
}

function HomePricing({ freePrice, monthlyPrice, annualPrice }: HomePricingProps) {
  const [chosenPeriod, setChosenPeriod] = useState<'year' | 'month'>('month');
  const tCommon = useTranslations('Common');
  const t = useTranslations('HomePricing');
  return (
    <section className="justifiy-center flex flex-col items-center gap-10 py-7">
      <p className={cn('text-center text-sm', 'lg:text-base', '2xl:text-2xl')}>{t('title')}</p>
      <LabeledSwitch
        state={chosenPeriod === 'year' ? 'left' : 'right'}
        leftLabel={tCommon('annual')}
        rightLabel={tCommon('monthly')}
        onChange={(state) => {
          setChosenPeriod(state === 'left' ? 'year' : 'month');
        }}
      />
      <div className={cn('hidden gap-9', 'md:grid md:grid-cols-2')}>
        <div className="flex w-80 flex-col gap-13 rounded-lg bg-zinc-900 p-4 pb-6">
          <div className="flex">
            <PremiumTag isPremium={false} />
          </div>
          <div>
            <p className="text-6xl font-extrabold">
              {freePrice}
              <span className="text-base font-light lowercase">
                &nbsp;/&nbsp;{chosenPeriod === 'month' ? tCommon('monthly') : tCommon('annual')}
              </span>
            </p>
            <p className="text-2xs mt-5 min-h-8 text-zinc-300 italic">&nbsp;</p>
          </div>
          <div className="grow">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.keepForever')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" /> {t('Features.addImages')}
              </li>
            </ul>
          </div>
          <Button role="link" href="/memorial/create">
            {t('buttonLabel')}
          </Button>
        </div>
        <div className="relative flex w-80 flex-col gap-13 rounded-lg bg-zinc-900 p-4 pb-6">
          <div className="bg-gradient-ghost absolute inset-0" />
          <div className="relative flex">
            <PremiumTag isPremium={true} />
          </div>
          <div className="relative">
            <p className="text-6xl font-extrabold">
              {chosenPeriod === 'year' ? annualPrice : monthlyPrice}
              <span className="text-base font-light lowercase">
                &nbsp;/&nbsp;{chosenPeriod === 'month' ? tCommon('month') : tCommon('year')}
              </span>
            </p>
            <p className="text-2xs mt-5 min-h-8 text-zinc-300 italic">{t('disclaimer')}</p>
          </div>
          <div className="relative">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.keepForever')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" /> {t('Features.addImages')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.customFrame')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.customTribute')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.digitalSimmTag')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.timelineView')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.editableUrl')}
              </li>
              <li className="flex items-center gap-3">
                <Check width={18} height={18} className="text-zinc-400" />{' '}
                {t('Features.privatePage')}
              </li>
            </ul>
          </div>
          <Button role="link" href="/memorial/create">
            {t('buttonLabel')}
          </Button>
        </div>
      </div>

      <div className={cn('flex flex-col', 'md:hidden')}>
        <div className="relative rounded-lg bg-zinc-900 p-4">
          <div className="bg-gradient-ghost absolute inset-0 rounded-lg opacity-50" />

          {/* Header Row */}
          <div className="relative mb-4 grid grid-cols-3 gap-2">
            <div className="text-xs font-medium text-zinc-400">
              {/* Empty cell for feature labels */}
            </div>
            <div className="flex flex-col items-center">
              <PremiumTag isPremium={false} />
              <p className="mt-2 text-2xl font-extrabold">{freePrice}</p>
              <p className="text-2xs font-light text-zinc-400">
                / {chosenPeriod === 'month' ? tCommon('month') : tCommon('year')}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <PremiumTag isPremium={true} />
              <p className="mt-2 text-2xl font-extrabold">
                {chosenPeriod === 'year' ? annualPrice : monthlyPrice}
              </p>
              <p className="text-2xs font-light text-zinc-400">
                / {chosenPeriod === 'month' ? tCommon('month') : tCommon('year')}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="relative mb-4 text-center">
            <p className="text-2xs text-zinc-300 italic">{t('disclaimer')}</p>
          </div>

          {/* Features Table */}
          <div className="relative mb-4 flex flex-col gap-2">
            {/* Keep Forever */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.keepForever')}</div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Add Images */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.addImages')}</div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Custom Frame */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.customFrame')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Custom Tribute */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.customTribute')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Digital Simm Tag */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.digitalSimmTag')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Timeline View */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.timelineView')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Editable URL */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.editableUrl')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>

            {/* Private Page */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 py-2">
              <div className="text-xs font-medium">{t('Features.privatePage')}</div>
              <div className="flex justify-center">
                <span className="text-zinc-600">—</span>
              </div>
              <div className="flex justify-center">
                <Check width={16} height={16} className="text-zinc-400" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="relative flex justify-center">
            <Button role="link" href="/memorial/create" size="small">
              {t('buttonLabel')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePricing;

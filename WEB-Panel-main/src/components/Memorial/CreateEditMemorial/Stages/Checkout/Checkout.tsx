'use client';
import React, { useState, Fragment, useMemo } from 'react';
import StageProgress from '../../StageProgress';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LabeledSwitch from '@/components/Elements/LabeledSwitch/LabeledSwitch';
import { cn } from '@/utils/cn';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { createPremiumSubscriptionLink, publishFreeMemorial } from '@/services/server/memorial';
import StageControls from '@/components/Memorial/StageControls';
import { toSearchParams } from '@/utils/searchParams';
import { MemorialStatus } from '@/types/memorial';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface CheckoutProps {
  id: string;
  freePrice: string;
  monthlyPrice: string;
  annualPrice: string;
  status: MemorialStatus;
}
const FREE_PLAN_OVERRIDES = { frame: 'default', tribute: 'default', simmTagDesign: -1 };
function Checkout({ id, freePrice, monthlyPrice, annualPrice, status }: CheckoutProps) {
  const router = useRouter();
  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Checkout');
  const [chosenPeriod, setChosenPeriod] = useState<'year' | 'month'>('year');
  const [chosenPlan, setChosenPlan] = useState<'free' | 'premium'>('premium');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const editingPublishedMemorial = useMemo(() => {
    return status === MemorialStatus.PUBLISHED;
  }, [status]);

  const generateRows = () => {
    const rows: React.ReactNode[] = [];
    Object.entries(TABLE_CONFIG).forEach(([key, config]) => {
      const premiumLabel = config.premiumValueKey ? t(config.premiumValueKey) : tCommon('yes');
      const freeLabel = config.premiumOnly === false ? premiumLabel : '-';
      rows.push(
        <Fragment key={key}>
          <div className={cn('text-2xs font-sans font-medium', 'md:text-base')}>
            {t(`TableRows.${key}`)}
          </div>
          <div className={cn('text-2xs font-sans font-medium', 'md:text-base')}>{freeLabel}</div>
          <div className={cn('text-2xs font-sans font-medium', 'md:text-base')}>{premiumLabel}</div>
        </Fragment>,
      );
    });
    return rows;
  };

  const handleCheckout = async () => {
    try {
      showLoading();
      trackEvent('memorialCheckoutNextButtonClicked', { editingPublishedMemorial });
      trackEvent('memorialCheckoutPlanSelected', {
        editingPublishedMemorial,
        billingPeriod: chosenPeriod,
        planType: chosenPlan,
      });
      if (chosenPlan === 'free' && editingPublishedMemorial) {
        router.push(`/memorial/edit/${id}`);
      } else if (chosenPlan === 'free') {
        const result = await publishFreeMemorial(id);
        router.push(result.redirectUrl);
      } else {
        const checkoutLink = await createPremiumSubscriptionLink(id, chosenPeriod);
        if (!checkoutLink) {
          throw new Error('Failed to create checkout link');
        }
        trackEvent('memorialCheckoutStageCompleted', { editingPublishedMemorial });
        router.push(checkoutLink);
      }
    } catch {
      trackEvent('memorialCheckoutStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };
  return (
    <>
      {!editingPublishedMemorial && <StageProgress stage="checkout" />}
      <h2 className="text-center font-sans text-lg">{t('choosePlan')}</h2>
      <LabeledSwitch
        state={chosenPeriod === 'year' ? 'left' : 'right'}
        leftLabel={tCommon('annual')}
        rightLabel={tCommon('monthly')}
        onChange={(state) => {
          setChosenPeriod(state === 'left' ? 'year' : 'month');
        }}
      />
      <div className="mx-auto flex max-w-195 flex-col gap-10">
        <div className="relative font-sans">
          <div
            className={cn(
              'absolute top-0 right-[calc(33.333%+var(--spacing)*1)] h-full w-[calc(33.333%-var(--spacing)*2)] rounded-lg',
              chosenPlan === 'free' && 'border-mauveine-100 border-2',
            )}
          />
          <div
            onClick={() => setChosenPlan('free')}
            className={cn(
              'absolute top-0 right-[calc(33.333%+var(--spacing)*1)] z-99 h-full w-[calc(33.333%-var(--spacing)*2)] cursor-pointer rounded-lg',
            )}
          />
          <div
            className={cn(
              'bg-gradient-mauveine absolute top-0 right-0 h-full w-[calc(33.333%-var(--spacing)*3)] rounded-lg',
              chosenPlan === 'premium' && 'border-mauveine-100 border-2',
            )}>
            {chosenPeriod === 'year' && (
              <div
                className={cn(
                  'bg-gradient-mauveine border-shine-1 absolute top-0 left-3 -translate-y-1/2 rounded-lg px-3 py-2 text-xs font-medium',
                  chosenPlan === 'premium' && '-top-0.5 left-2.5',
                )}>
                {tCommon('recommended')}
              </div>
            )}
          </div>
          <div
            onClick={() => setChosenPlan('premium')}
            className={cn(
              'absolute top-0 right-0 z-99 h-full w-[calc(33.333%-var(--spacing)*3)] cursor-pointer rounded-lg',
            )}
          />
          <div className="relative grid grid-cols-3 gap-x-3 gap-y-4 py-6 [&>*]:px-6">
            <div />
            <div className="font-semibold">{tCommon('free')}</div>
            <div className="font-semibold">{tCommon('premium')}</div>
            <div />
            <div
              className={cn(
                'flex flex-wrap items-center gap-2 text-xl font-extrabold',
                'md:text-2xl',
              )}>
              {freePrice}
            </div>
            <div
              className={cn(
                'flex flex-wrap items-center gap-2 text-xl font-extrabold',
                'md:text-2xl',
              )}>
              {chosenPeriod === 'year' ? annualPrice : monthlyPrice}
              <span className="text-2xs font-normal">
                /&nbsp;{chosenPeriod === 'year' ? tCommon('year') : tCommon('month')}
              </span>
            </div>
            <div />
            <div />
            <div className="text-2xs leading-none italic">{t('donationFootnote')}</div>
            <div />
            <div>
              <hr className="opacity-50" />
            </div>
            <div>
              <hr className="opacity-50" />
            </div>
            {generateRows()}
          </div>
        </div>
        <RadioGroup
          onValueChange={(value) => setChosenPlan(value as 'free' | 'premium')}
          value={chosenPlan}>
          <div className="grid w-full grid-cols-3">
            <div />
            <div className="flex justify-center">
              <RadioButton value="free" />
            </div>
            <div className="flex justify-center">
              <RadioButton value="premium" />
            </div>
          </div>
        </RadioGroup>
      </div>
      <StageControls
        onPrevious={() => {
          trackEvent('memorialCheckoutBackButtonClicked', { editingPublishedMemorial });
          if (editingPublishedMemorial) {
            router.push(`/memorial/edit/${id}`);
          } else {
            router.push(`/memorial/edit/${id}/preview`);
          }
        }}
        nextButtonLabel={tCommon('continue')}
        previousButtonLabel={tCommon('back')}
        onNext={handleCheckout}
        nextDisabled={isLoading}
        preview={
          editingPublishedMemorial
            ? undefined
            : {
                href: `/memorial/preview/${id}${chosenPlan === 'free' ? '?' + toSearchParams(FREE_PLAN_OVERRIDES) : ''}`,
                buttonLabel: tCommon('previewMemorialButton'),
                analytics: {
                  eventName: 'memorialCheckoutPreviewButtonClicked',
                  params: { editingPublishedMemorial },
                },
              }
        }
      />
    </>
  );
}

export default Checkout;

interface TableConfigEntry {
  premiumOnly?: boolean;
  labelKey: string;
  premiumValueKey?: string;
}

const TABLE_CONFIG: Record<string, TableConfigEntry> = {
  expiration: {
    premiumOnly: false,
    labelKey: 'TableRows.expiration',
    premiumValueKey: 'keepForever',
  },
  addImage: { labelKey: 'TableRows.addImage', premiumOnly: false },
  frame: { labelKey: 'TableRows.frame' },
  tribute: { labelKey: 'TableRows.tribute' },
  simmTag: { labelKey: 'TableRows.simmTag' },
  timeline: { labelKey: 'TableRows.timeline' },
  editableUrl: { labelKey: 'TableRows.editableUrl' },
  privatePage: { labelKey: 'TableRows.privatePage' },
};

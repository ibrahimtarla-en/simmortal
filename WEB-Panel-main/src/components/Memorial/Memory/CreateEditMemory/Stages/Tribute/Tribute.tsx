'use client';
import {
  MEMORIAL_DECORATIONS,
  MEMORIAL_TRIBUTES,
  MemorialDecoration,
  MemorialTribute,
} from '@/types/memorial';
import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import StageControls from '../../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { Memory } from '@/types/memory';
import { publishMemory, updateMemory } from '@/services/server/memory';
import MemoryTributeFrame from '../../../MemoryDecorationFrame/MemoryDecorationFrame';
import { toSearchParams } from '@/utils/searchParams';
import { useMemoryAsset } from '@/hooks/useMemoryAsset';
import { isContributionNeedsPayment, isContributionPublished } from '@/types/contribution';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface TributeProps {
  initialValues: Memory;
  slug: string;
  decorationPrices: Record<MemorialDecoration, string>;
  tributePrices: Record<MemorialTribute, string | null>;
}

function Tribute({ initialValues, slug, decorationPrices, tributePrices }: TributeProps) {
  const [selectedTribute, setSelectedTribute] = useState<MemorialTribute>('default');
  const [selectedDecoration, setSelectedDecoration] = useState<MemorialDecoration>('no-decoration');

  const { withAsset, withoutAsset } = useMemoryAsset(initialValues);
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemory.Stages.Tribute');
  const router = useRouter();

  const handleNext = async () => {
    try {
      showLoading();
      if (
        withAsset &&
        withAsset.assetDecoration !== selectedTribute &&
        selectedTribute !== 'default'
      ) {
        await updateMemory(slug, initialValues.id, { assetDecoration: selectedTribute });
      } else if (
        withoutAsset &&
        withoutAsset.decoration !== selectedDecoration &&
        selectedDecoration !== 'no-decoration'
      ) {
        await updateMemory(slug, initialValues.id, { decoration: selectedDecoration });
      }
      const response = await publishMemory(slug, initialValues.id);

      if (isContributionNeedsPayment(response)) {
        trackEvent('memoryTributeCheckoutRedirected', {
          tribute: selectedTribute,
          decoration: selectedDecoration,
          hasAsset: !!withAsset,
        });
        router.push(response.paymentUrl);
      } else if (isContributionPublished(response)) {
        trackEvent('memoryTributePublishedDirectly', {
          tribute: selectedTribute,
          decoration: selectedDecoration,
          hasAsset: !!withAsset,
        });
        router.replace(`/memorial/${slug}?session_id=none&type=memory`);
      }
    } catch {
      trackEvent('memoryTributeStageFailed', {
        tribute: selectedTribute,
        decoration: selectedDecoration,
        hasAsset: !!withAsset,
      });
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHref = (): string => {
    if (withAsset) {
      return `/memorial/contribute/${slug}/memory/preview/${initialValues.id}?${toSearchParams({ assetDecoration: selectedTribute })}`;
    } else if (withoutAsset) {
      return `/memorial/contribute/${slug}/memory/preview/${initialValues.id}?${toSearchParams({ decoration: selectedDecoration })}`;
    }
    return '';
  };

  useEffect(() => {
    if (withAsset) {
      setSelectedTribute(withAsset.assetDecoration || 'default');
    } else if (withoutAsset) {
      setSelectedDecoration(withoutAsset.decoration || 'no-decoration');
    }
  }, [initialValues, withAsset, withoutAsset]);
  return (
    <>
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <p className="text-center text-lg">{t('stageDescription')}</p>
          {withAsset && (
            <RadioGroup
              className={cn('mb-4 grid grid-cols-1 gap-6', 'md:grid-cols-2', '2xl:grid-cols-3')}
              defaultValue="default"
              value={selectedTribute}
              disabled={isLoading}
              onValueChange={(value) => setSelectedTribute(value as MemorialTribute)}>
              {MEMORIAL_TRIBUTES.map((tribute) => (
                <div
                  key={tribute}
                  className={cn(
                    'flex w-88 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                    selectedTribute === tribute && 'border-mauveine-100',
                  )}
                  onClick={() => setSelectedTribute(tribute)}>
                  <MemorialPortrait
                    frame={'default'}
                    tribute={tribute}
                    imageUrl={withAsset.assetPath}
                    fileType={withAsset.assetType}
                    showPremiumBadge={false}
                    isPremium={tribute !== 'default'}
                    className="h-auto w-full cursor-pointer"
                  />
                  <label
                    htmlFor={tribute}
                    className={cn(
                      'text-lg font-light',
                      tribute === selectedTribute && 'font-semibold',
                    )}>
                    {tCommon(`TributeNames.${tribute}`)}
                  </label>
                  <label
                    htmlFor={tribute}
                    className={cn(
                      'text-md font-light',
                      tribute === selectedTribute && 'font-semibold',
                    )}>
                    {tribute === 'default' ? tCommon('free') : tributePrices[tribute]}
                  </label>
                  <RadioButton id={tribute} value={tribute} />
                </div>
              ))}
            </RadioGroup>
          )}
          {withoutAsset && (
            <RadioGroup
              className={cn('mb-4 grid grid-cols-1 gap-6', 'md:grid-cols-2', '2xl:grid-cols-5')}
              defaultValue="default"
              value={selectedDecoration}
              disabled={isLoading}
              onValueChange={(value) => setSelectedDecoration(value as MemorialDecoration)}>
              {MEMORIAL_DECORATIONS.map((decoration) => (
                <div
                  key={decoration}
                  className={cn(
                    'flex w-52 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                    selectedDecoration === decoration && 'border-mauveine-100',
                  )}
                  onClick={() => setSelectedDecoration(decoration)}>
                  <MemoryTributeFrame
                    decoration={decoration}
                    className="h-auto w-full cursor-pointer"
                    sizes="w-35 h-auto"
                  />
                  <label
                    htmlFor={decoration}
                    className={cn(
                      'text-lg font-light',
                      decoration === selectedDecoration && 'font-semibold',
                    )}>
                    {tCommon(`DecorationNames.${decoration}`)}
                  </label>
                  <label
                    htmlFor={decoration}
                    className={cn(
                      'text-md font-light',
                      decoration === selectedDecoration && 'font-semibold',
                    )}>
                    {decoration === 'no-decoration'
                      ? tCommon('free')
                      : decorationPrices[decoration]}
                  </label>
                  <RadioButton id={decoration} value={decoration} />
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memoryTributeBackButtonClicked');
            router.push(`/memorial/contribute/${slug}/memory/edit/${initialValues.id}/about`);
          }}
          nextButtonLabel={tCommon('next')}
          previousButtonLabel={tCommon('back')}
          onNext={() => {
            trackEvent('memoryTributeNextButtonClicked', {
              tribute: selectedTribute,
              decoration: selectedDecoration,
              hasAsset: !!withAsset,
            });
            handleNext();
          }}
          nextDisabled={isLoading}
          preview={{
            href: handlePreviewHref(),
            buttonLabel: tCommon('previewMemoryButton'),
            analytics: {
              eventName: 'memoryTributePreviewButtonClicked',
              params: {
                tribute: selectedTribute,
                decoration: selectedDecoration,
                hasAsset: !!withAsset,
              },
            },
          }}
        />
      </div>
    </>
  );
}

export default Tribute;

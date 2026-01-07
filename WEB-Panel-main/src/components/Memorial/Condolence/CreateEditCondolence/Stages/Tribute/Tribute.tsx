'use client';
import { MEMORIAL_DECORATIONS, MemorialDecoration } from '@/types/memorial';
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import StageControls from '../../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import BaseCondolenceCard from '../../../CondolenceCard/BaseCondolenceCard';
import { Condolence } from '@/types/condolence';
import { publishCondolence, updateCondolence } from '@/services/server/condolence';
import { toSearchParams } from '@/utils/searchParams';
import { isContributionNeedsPayment, isContributionPublished } from '@/types/contribution';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface TributeProps {
  prices: Record<MemorialDecoration, string>;
  initialValues: Condolence;
  slug: string;
}

function Tribute({ initialValues, slug, prices }: TributeProps) {
  const [selectedDecoration, setSelectedDecoration] = useState<MemorialDecoration>(
    !initialValues.content ? 'amethera-rose' : 'no-decoration',
  );

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemory.Stages.Tribute');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const handleNext = async () => {
    try {
      showLoading();
      if (
        selectedDecoration !== 'no-decoration' &&
        initialValues.decoration !== selectedDecoration
      ) {
        await updateCondolence(slug, initialValues.id, { decoration: selectedDecoration });
      }
      const response = await publishCondolence(slug, initialValues.id);

      if (isContributionNeedsPayment(response)) {
        trackEvent('condolenceTributeCheckoutRedirected', {
          decoration: selectedDecoration,
        });
        router.push(response.paymentUrl);
      } else if (isContributionPublished(response)) {
        trackEvent('condolenceTributePublishedDirectly', {
          decoration: selectedDecoration,
        });
        router.replace(`/memorial/${slug}?session_id=none&type=condolence`);
      }
    } catch {
      trackEvent('condolenceTributeStageFailed', {
        decoration: selectedDecoration,
      });
      // TODO: Handle error
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHref = () => {
    const condolenceId = initialValues.id;
    const overrides = { decoration: selectedDecoration };
    return `/memorial/contribute/${slug}/condolence/preview/${condolenceId}?${toSearchParams(overrides)}`;
  };

  // TODO: Update price when more tribute options are available
  return (
    <>
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <p className="text-center text-lg">{t('stageDescription')}</p>
          <RadioGroup
            className={cn(
              'mb-4 grid w-full grid-cols-1 gap-2',
              'md:grid-cols-1',
              '2xl:grid-cols-2',
            )}
            defaultValue="default"
            value={selectedDecoration}
            disabled={isLoading}
            onValueChange={(value) => setSelectedDecoration(value as MemorialDecoration)}>
            {MEMORIAL_DECORATIONS.map((decoration) =>
              !initialValues.content && decoration === 'no-decoration' ? null : (
                <div
                  key={decoration}
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                    selectedDecoration === decoration && 'border-mauveine-100',
                  )}
                  onClick={() => setSelectedDecoration(decoration)}>
                  <BaseCondolenceCard
                    content={initialValues.content || ''}
                    decoration={decoration}
                    author={initialValues.author}
                    date={initialValues.createdAt}
                    totalLikes={initialValues.totalLikes}
                    isLikedByUser={initialValues.isLikedByUser}
                    isPreview={true}
                    memorialSlug={initialValues.memorialSlug}
                    className={cn('h-full w-full cursor-pointer', 'md:w-128', '2xl:w-full')}
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
                    {decoration === 'no-decoration' ? tCommon('free') : prices[decoration]}
                  </label>
                  <RadioButton id={decoration} value={decoration} />
                </div>
              ),
            )}
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('condolenceTributeBackButtonClicked');
            router.push(`/memorial/contribute/${slug}/condolence/edit/${initialValues.id}/about`);
          }}
          nextButtonLabel={tCommon('checkout')}
          previousButtonLabel={tCommon('back')}
          onNext={() => {
            trackEvent('condolenceTributeNextButtonClicked', {
              decoration: selectedDecoration,
            });
            handleNext();
          }}
          nextDisabled={isLoading}
          preview={{
            href: handlePreviewHref(),
            buttonLabel: tCommon('previewMemoryButton'),
            analytics: {
              eventName: 'condolenceTributePreviewButtonClicked',
              params: { decoration: selectedDecoration },
            },
          }}
        />
      </div>
    </>
  );
}

export default Tribute;

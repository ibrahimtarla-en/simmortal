'use client';
import { Memorial, MEMORIAL_TRIBUTES, MemorialStatus, MemorialTribute } from '@/types/memorial';
import React, { useMemo, useState } from 'react';
import StageProgress from '../../StageProgress';
import { cn } from '@/utils/cn';
import StageControls from '../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { updateMemorial } from '@/services/server/memorial';
import { toSearchParams } from '@/utils/searchParams';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface TributeProps {
  initialValues: Memorial;
}

function Tribute({ initialValues }: TributeProps) {
  const [selectedTribute, setSelectedTribute] = useState<MemorialTribute>(
    initialValues.tribute ?? 'default',
  );

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Tribute');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const handleNext = async () => {
    try {
      showLoading();
      trackEvent('memorialTributeNextButtonClicked', { editingPublishedMemorial });
      trackEvent('memorialTributeSelected', {
        editingPublishedMemorial,
        tributeName: selectedTribute,
      });
      if (initialValues.tribute !== selectedTribute) {
        await updateMemorial(initialValues.id, { tribute: selectedTribute });
      }
      trackEvent('memorialTributeStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/simmtag`);
      }
    } catch {
      trackEvent('memorialTributeStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHref = (): string => {
    const memorialId = initialValues.id;
    const overrides = { tribute: selectedTribute };
    return `/memorial/preview/${memorialId}?${toSearchParams(overrides)}`;
  };

  return (
    <>
      <StageProgress stage="tribute" isEditing={editingPublishedMemorial} />
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <p className="text-center text-lg">{t('stageDescription')}</p>
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
                  frame={initialValues.frame}
                  tribute={tribute}
                  imageUrl={initialValues.imagePath || ''}
                  showPremiumBadge
                  isPremium={tribute !== 'default'}
                  className="h-auto w-full cursor-pointer"
                />
                <p
                  className={cn(
                    'text-lg font-light',
                    tribute === selectedTribute && 'font-semibold',
                  )}>
                  {tCommon(`TributeNames.${tribute}`)}
                </p>
                <RadioButton value={tribute} />
              </div>
            ))}
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialTributeBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
              return;
            }
            router.push(`/memorial/edit/${initialValues.id}/frame`);
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
          onNext={handleNext}
          nextDisabled={isLoading}
          preview={{
            href: handlePreviewHref(),
            buttonLabel: tCommon('previewMemorialButton'),
            analytics: {
              eventName: 'memorialTributePreviewButtonClicked',
              params: { editingPublishedMemorial },
            },
          }}
        />
      </div>
    </>
  );
}

export default Tribute;

'use client';
import { Memorial, MemorialStatus } from '@/types/memorial';
import React, { useMemo, useState } from 'react';
import StageProgress from '../../StageProgress';
import { cn } from '@/utils/cn';
import StageControls from '../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { updateMemorial } from '@/services/server/memorial';
import SimmTag from '@/components/Elements/SimmTag/SimmTag';
import { simmTags } from '@/components/Elements/SimmTag/SimmTag.config';
import { toSearchParams } from '@/utils/searchParams';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface FrameProps {
  initialValues: Memorial;
}

function SimmTagStage({ initialValues }: FrameProps) {
  const [selectedSimmTag, setSelectedSimmTag] = useState<number>(initialValues.simmTagDesign ?? -1);
  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.SimmTag');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const handleNext = async () => {
    try {
      showLoading();
      trackEvent('memorialSimmTagNextButtonClicked', { editingPublishedMemorial });
      const simmTagDesign = selectedSimmTag === -1 ? null : selectedSimmTag;
      trackEvent('memorialSimmTagSelected', {
        editingPublishedMemorial,
        simmTagName: simmTagDesign ? `${simmTagDesign}` : 'Default',
      });
      if (initialValues.simmTagDesign !== simmTagDesign) {
        await updateMemorial(initialValues.id, { simmTagDesign });
      }
      trackEvent('memorialSimmTagStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/music`);
      }
    } catch {
      trackEvent('memorialSimmTagStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHref = (): string => {
    const memorialId = initialValues.id;
    const overrides = { simmTagDesign: selectedSimmTag };
    return `/memorial/preview/${memorialId}?${toSearchParams(overrides)}`;
  };

  return (
    <>
      <StageProgress stage="simmTag" isEditing={editingPublishedMemorial} />
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-18">
          <p className="text-center text-lg">
            {t.rich('stageDescription', { name: () => initialValues.name })}
          </p>
          <RadioGroup
            className={cn(
              'mb-4 grid cursor-pointer grid-cols-1 gap-10',
              'md:grid-cols-2',
              'lg:grid-cols-3',
              'xl:grid-cols-4',
              '2xl:grid-cols-5',
            )}
            defaultValue="default"
            value={String(selectedSimmTag)}
            disabled={isLoading}
            onValueChange={(value) => setSelectedSimmTag(parseInt(value, 10))}>
            <div
              onClick={() => setSelectedSimmTag(-1)}
              className={cn('flex flex-col items-center justify-center gap-4')}>
              <SimmTag
                className={cn(selectedSimmTag === -1 && 'border-mauveine-100 border-1')}
                showPremiumTag
                size="large"
              />
              <RadioButton value={String(-1)} />
            </div>
            {Array.from({ length: simmTags.length }).map((_, index) => (
              <div
                key={index}
                className={cn('flex flex-col items-center justify-center gap-4')}
                onClick={() => setSelectedSimmTag(index)}>
                <SimmTag
                  showPremiumTag
                  design={index}
                  size="large"
                  className={cn(index === selectedSimmTag && 'border-mauveine-100 border-1')}
                />
                <RadioButton value={String(index)} />
              </div>
            ))}
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialSimmTagBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
            } else {
              router.push(`/memorial/edit/${initialValues.id}/tribute`);
            }
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
          onNext={handleNext}
          nextDisabled={isLoading}
          preview={{
            href: handlePreviewHref(),
            buttonLabel: tCommon('previewMemorialButton'),
            analytics: {
              eventName: 'memorialSimmTagPreviewButtonClicked',
              params: { editingPublishedMemorial },
            },
          }}
        />
      </div>
    </>
  );
}

export default SimmTagStage;

'use client';
import { Memorial, MEMORIAL_FRAMES, MemorialFrame, MemorialStatus } from '@/types/memorial';
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

interface FrameProps {
  initialValues: Memorial;
}

function Frame({ initialValues }: FrameProps) {
  const [selectedFrame, setSelectedFrame] = useState<MemorialFrame>(initialValues.frame);

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Frame');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const handleNext = async () => {
    try {
      showLoading();
      trackEvent('memorialFrameNextButtonClicked', { editingPublishedMemorial });
      trackEvent('memorialFrameSelected', { editingPublishedMemorial, frameName: selectedFrame });
      if (initialValues.frame !== selectedFrame) {
        await updateMemorial(initialValues.id, { frame: selectedFrame });
      }
      trackEvent('memorialFrameStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/tribute`);
      }
    } catch {
      trackEvent('memorialFrameStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHref = (): string => {
    const memorialId = initialValues.id;
    const overrides = { frame: selectedFrame };
    return `/memorial/preview/${memorialId}?${toSearchParams(overrides)}`;
  };

  return (
    <>
      <StageProgress stage="frame" isEditing={editingPublishedMemorial} />
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <p className="text-center text-lg">{t('stageDescription')}</p>
          <RadioGroup
            className={cn('mb-4 grid grid-cols-1 gap-6', 'md:grid-cols-2', '2xl:grid-cols-3')}
            defaultValue="default"
            value={selectedFrame}
            disabled={isLoading}
            onValueChange={(value) => setSelectedFrame(value as MemorialFrame)}>
            {MEMORIAL_FRAMES.map((frame) => (
              <div
                key={frame}
                className={cn(
                  'flex w-88 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                  selectedFrame === frame && 'border-mauveine-100',
                )}
                onClick={() => setSelectedFrame(frame)}>
                <MemorialPortrait
                  frame={frame}
                  imageUrl={initialValues.imagePath || ''}
                  showPremiumBadge
                  isPremium={frame !== 'default'}
                  className="hover:border-primary-500 data-[state=checked]:border-primary-500 h-auto w-full cursor-pointer rounded-lg border-4 border-transparent transition-all"
                />
                <p className={cn('text-lg font-light', frame === selectedFrame && 'font-semibold')}>
                  {tCommon(`FrameNames.${frame}`)}
                </p>
                <RadioButton value={frame} />
              </div>
            ))}
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialFrameBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
            } else {
              router.push(`/memorial/edit/${initialValues.id}/live-portrait`);
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
              eventName: 'memorialFramePreviewButtonClicked',
              params: { editingPublishedMemorial },
            },
          }}
        />
      </div>
    </>
  );
}

export default Frame;

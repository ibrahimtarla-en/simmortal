'use client';
import { Memorial, MemorialLivePortraitEffect, MemorialStatus } from '@/types/memorial';
import React, { useMemo, useState } from 'react';
import StageProgress from '../../StageProgress';
import { cn } from '@/utils/cn';
import StageControls from '../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { updateMemorial } from '@/services/server/memorial';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import Image from 'next/image';
import PremiumTag from '@/components/Elements/PremiumTag/PremiumTag';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface LivePortraitProps {
  initialValues: Memorial;
}

function LivePortrait({ initialValues }: LivePortraitProps) {
  const [selectedEffect, setSelectedEffect] = useState<MemorialLivePortraitEffect | null>(
    initialValues.livePortraitEffect || null,
  );

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.LivePortrait');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const handleNext = async () => {
    try {
      showLoading();
      trackEvent('memorialLivePortraitNextButtonClicked', { editingPublishedMemorial });
      if (selectedEffect) {
        trackEvent('memorialLivePortraitEffectSelected', {
          editingPublishedMemorial,
          effectName: selectedEffect,
        });
      }
      if (initialValues.livePortraitEffect !== selectedEffect) {
        await updateMemorial(initialValues.id, { livePortraitEffect: selectedEffect });
      }
      trackEvent('memorialLivePortraitStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/frame`);
      }
    } catch {
      trackEvent('memorialLivePortraitStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <StageProgress stage="livePortrait" isEditing={editingPublishedMemorial} />
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <p className="text-center text-lg">{t('stageDescription')}</p>
          <p className="text text-center text-xs whitespace-pre-line">{t('hint')}</p>
          <p className="text text-mauveine-100 text-center text-sm whitespace-pre-line">
            {t('disclaimer')}
          </p>
          <RadioGroup
            className={cn('mb-4 grid grid-cols-1 gap-6', 'md:grid-cols-2', '2xl:grid-cols-3')}
            defaultValue="default"
            value={selectedEffect || 'none'}
            disabled={isLoading}
            onValueChange={(value) => {
              if (value === 'none') {
                setSelectedEffect(null);
                return;
              }
              setSelectedEffect(value as MemorialLivePortraitEffect | null);
            }}>
            <div
              className={cn(
                'relative flex max-w-88 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                selectedEffect === null && 'border-mauveine-100',
              )}
              onClick={() => setSelectedEffect(null)}>
              <PremiumTag isPremium={false} className="absolute top-3 left-8 z-10" />
              <div className="aspect-square w-full rounded-sm bg-zinc-600 p-2">
                <div className="relative h-full w-full">
                  <Image
                    src="/live-portrait/none.jpeg"
                    alt="No Live Portrait"
                    sizes="(min-width: 640px) 50vw, (min-width: 33vw) 100vw"
                    fill
                    className="h-auto w-full cursor-pointer rounded-lg border-4 border-transparent transition-all"
                  />
                </div>
              </div>
              <p className={cn('text-lg font-light', selectedEffect === null && 'font-semibold')}>
                {t(`EffectNames.none`)}
              </p>
              <RadioButton value={'none'} />
            </div>
            <div
              className={cn(
                'relative flex max-w-88 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                selectedEffect === MemorialLivePortraitEffect.EFFECT_ONE && 'border-mauveine-100',
              )}
              onClick={() => setSelectedEffect(MemorialLivePortraitEffect.EFFECT_ONE)}>
              <PremiumTag isPremium={true} className="absolute top-3 left-8 z-10" />
              <div className="aspect-square w-full rounded-sm bg-zinc-600 p-2">
                <video
                  muted
                  autoPlay
                  loop
                  playsInline
                  src="/live-portrait/effect-one.mp4"
                  className="h-auto w-full cursor-pointer rounded-lg border-4 border-transparent transition-all"
                />
              </div>
              <p
                className={cn(
                  'text-lg font-light',
                  selectedEffect === MemorialLivePortraitEffect.EFFECT_ONE && 'font-semibold',
                )}>
                {t(`EffectNames.effectOne`)}
              </p>
              <RadioButton value={MemorialLivePortraitEffect.EFFECT_ONE} />
            </div>
            <div
              className={cn(
                'relative flex max-w-88 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-transparent p-4',
                selectedEffect === MemorialLivePortraitEffect.EFFECT_TWO && 'border-mauveine-100',
              )}
              onClick={() => setSelectedEffect(MemorialLivePortraitEffect.EFFECT_TWO)}>
              <PremiumTag isPremium={true} className="absolute top-3 left-8 z-10" />
              <div className="aspect-square w-full rounded-sm bg-zinc-600 p-2">
                <video
                  muted
                  autoPlay
                  loop
                  playsInline
                  src="/live-portrait/effect-two.mp4"
                  className="h-auto w-full cursor-pointer rounded-lg border-4 border-transparent transition-all"
                />
              </div>
              <p
                className={cn(
                  'text-lg font-light',
                  selectedEffect === MemorialLivePortraitEffect.EFFECT_TWO && 'font-semibold',
                )}>
                {t(`EffectNames.effectTwo`)}
              </p>
              <RadioButton value={MemorialLivePortraitEffect.EFFECT_TWO} />
            </div>
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialLivePortraitBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
            } else {
              router.push(`/memorial/edit/${initialValues.id}/url`);
            }
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
          onNext={handleNext}
          nextDisabled={isLoading}
        />
      </div>
    </>
  );
}

export default LivePortrait;

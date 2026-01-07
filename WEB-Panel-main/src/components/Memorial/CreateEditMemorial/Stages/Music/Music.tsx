'use client';
import { Memorial, MEMORIAL_MUSIC, MemorialMusic, MemorialStatus } from '@/types/memorial';
import React, { useMemo, useState } from 'react';
import StageProgress from '../../StageProgress';
import StageControls from '@/components/Memorial/StageControls';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
import { updateMemorial } from '@/services/server/memorial';
import { toSearchParams } from '@/utils/searchParams';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import { useRouter } from '@/i18n/navigation';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import AudioPlayer from '@/components/Elements/AudioPlayer/AudioPlayer';
import PremiumTag from '@/components/Elements/PremiumTag/PremiumTag';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface MusicProps {
  initialValues: Memorial;
}

function Music({ initialValues }: MusicProps) {
  const [selectedMusic, setSelectedMusic] = useState<MemorialMusic | null>(initialValues.music);

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Music');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const handleNext = async () => {
    try {
      showLoading();
      trackEvent('memorialMusicNextButtonClicked', { editingPublishedMemorial });
      if (selectedMusic) {
        trackEvent('memorialMusicSelected', { editingPublishedMemorial, trackName: selectedMusic });
      }
      if (initialValues.music !== selectedMusic) {
        await updateMemorial(initialValues.id, { music: selectedMusic });
      }
      trackEvent('memorialMusicStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/preview`);
      }
    } catch {
      trackEvent('memorialMusicStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <StageProgress stage="music" isEditing={editingPublishedMemorial} />
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className={cn('flex grow flex-col gap-4', 'md:flex-row md:gap-6', '2xl:gap-17.5')}>
          {initialValues.imagePath && (
            <div className="relative">
              <MemorialPortrait
                imageUrl={initialValues.imagePath}
                priority
                frame={initialValues.frame}
                tribute={initialValues.tribute}
                sizes="(min-width: 640px) 100vw, (min-width: 768px) 20rem, 28rem"
                name={initialValues.name || 'memorial portrait'}
                className={cn('shrink-0', 'md:w-81', '2xl:w-107')}
              />
            </div>
          )}
          <RadioGroup
            className={cn('mb-4 grid grow auto-rows-fr grid-cols-1 gap-6', 'lg:grid-cols-2')}
            defaultValue="default"
            value={selectedMusic ?? 'none'}
            disabled={isLoading}
            onValueChange={(value) => setSelectedMusic(value as MemorialMusic)}>
            <div
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-5',
                selectedMusic === null && 'border-mauveine-100',
              )}
              onClick={() => setSelectedMusic(null)}>
              <div
                className={cn(
                  'bg-gradient-card-fill relative mt-3 flex w-full grow flex-col items-center justify-center gap-3 rounded-xl border-1 border-transparent p-3',
                  selectedMusic === null && 'border-mauveine-100',
                )}>
                <PremiumTag
                  isPremium={false}
                  className="absolute top-0 left-3 z-99 -translate-y-1/2"
                />
                <p className="text-center text-sm font-medium">{t(`Tracks.none`)}</p>
              </div>
              <RadioButton value={'none'} />
            </div>
            {MEMORIAL_MUSIC.map((music) => (
              <div
                key={music}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-5',
                )}
                onClick={() => setSelectedMusic(music)}>
                <div
                  className={cn(
                    'bg-gradient-card-fill relative mt-3 flex w-full flex-col gap-3 rounded-xl border-1 p-3',
                    selectedMusic !== music && 'border-shine-1 border-0 p-3.25',
                    selectedMusic === music && 'border-mauveine-100',
                  )}>
                  <PremiumTag isPremium className="absolute top-0 left-3 z-99 -translate-y-1/2" />
                  <p className="text-center text-sm font-medium">{t(`Tracks.${music}`)}</p>
                  <AudioPlayer audioUrl={`/music/${music}.mp3`} pauseOthersWhenActivated />
                </div>
                <RadioButton value={music} />
              </div>
            ))}
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialMusicBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
            } else {
              router.push(`/memorial/edit/${initialValues.id}/simmtag`);
            }
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
          onNext={handleNext}
          nextDisabled={isLoading}
          preview={{
            href: `/memorial/preview/${initialValues.id}?${toSearchParams({ music: selectedMusic })}`,
            buttonLabel: tCommon('previewMemorialButton'),
            analytics: {
              eventName: 'memorialMusicPreviewButtonClicked',
              params: { editingPublishedMemorial },
            },
          }}
        />
      </div>
    </>
  );
}

export default Music;

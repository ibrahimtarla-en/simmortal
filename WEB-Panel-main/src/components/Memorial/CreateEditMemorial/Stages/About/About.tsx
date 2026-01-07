'use client';
import { cn } from '@/utils/cn';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StageProgress from '../../StageProgress';
import StageControls from '../../../StageControls';
import { useRouter } from '@/i18n/navigation';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import { formatDate } from '@/utils/date';
import AudioRecorder from '@/components/Elements/AudioRecorder/AudioRecorder';
import { useLocale, useTranslations } from 'next-intl';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import Button from '@/components/Elements/Button/Button';
import TextArea from '@/components/Elements/TextArea/TextArea';
import { useBreakpoints } from '@/hooks';
import { Controller, useForm } from 'react-hook-form';
import { transcribeAudio } from '@/services/client/memorial';
import { exists } from '@/utils/exists';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import loading from '@/assets/lottie/loading.json';
import { updateMemorial } from '@/services/server/memorial';
import { MemorialStatus } from '@/types/memorial';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface AboutProps {
  id: string;
  imagePath: string;
  dateOfBirth: string;
  dateOfDeath: string;
  name: string;
  initialValue?: string;
  status: MemorialStatus;
}

type InputMode = 'speech' | 'text';

interface MemorialAboutForm {
  about: string;
}

function About({
  id,
  imagePath,
  name,
  dateOfBirth,
  dateOfDeath,
  initialValue,
  status,
}: AboutProps) {
  const t = useTranslations('CreateMemorial.Stages.About');
  const tCommon = useTranslations('Common');
  const recorder = useAudioRecorder();
  const { isBelow } = useBreakpoints();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(exists(initialValue) ? 'text' : 'speech');
  const [transcription, setTranscription] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MemorialAboutForm>({ defaultValues: { about: initialValue } });
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const locale = useLocale();
  const { toast } = useToast();

  const editingPublishedMemorial = useMemo(() => {
    return status === MemorialStatus.PUBLISHED;
  }, [status]);

  const handleFormSubmit = async (data: MemorialAboutForm) => {
    try {
      showLoading();
      await updateMemorial(id, {
        about: data.about,
      });
      trackEvent('memorialAboutStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${id}`);
      } else {
        router.push(`/memorial/edit/${id}/url`);
      }
    } catch {
      trackEvent('memorialAboutStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  const handleNextPressed = useCallback(async () => {
    trackEvent('memorialAboutNextButtonClicked', { editingPublishedMemorial });
    const hasTranscribed = inputMode === 'speech' && transcription;
    const shouldSubmit = inputMode === 'text' || hasTranscribed;
    if (shouldSubmit) {
      formRef.current?.requestSubmit();
    }
  }, [inputMode, transcription, editingPublishedMemorial]);

  useEffect(() => {
    async function transcribe() {
      try {
        if (recorder.audioBlob) {
          setIsTranscribing(true);
          const result = await transcribeAudio(recorder.audioBlob);
          setTranscription(result.transcription || '');
          setValue('about', result.transcription || '');
        } else {
          setTranscription(null);
          setValue('about', initialValue || '');
        }
      } finally {
        setIsTranscribing(false);
      }
    }
    transcribe();
  }, [initialValue, recorder.audioBlob, setValue]);

  return (
    <>
      <StageProgress stage="about" isEditing={editingPublishedMemorial} />
      <form
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}>
        <div className={cn('flex grow flex-col gap-4', 'md:flex-row md:gap-6', '2xl:gap-17.5')}>
          <MemorialPortrait
            imageUrl={imagePath}
            name={name}
            priority
            sizes="(min-width: 640px) 100vw, (min-width: 768px) 20rem, 28rem"
            className={cn('aspect-square shrink-0', 'md:h-81 md:w-81', '2xl:h-107 2xl:w-107')}
            overlay={
              <div>
                <p className="font-serif text-lg font-semibold">{name}</p>
                <p className="text-2xs">
                  {`${formatDate(dateOfBirth, 'DD MMM, YYYY', locale)} - ${formatDate(dateOfDeath, 'DD MMM, YYYY', locale)}`}
                </p>
              </div>
            }
          />
          <div className="flex grow flex-col justify-between gap-11">
            <p className={cn('text-center font-light', 'xl:text-lg')}>
              {t.rich('userPrompt', { name: () => name })}
            </p>
            {inputMode === 'speech' && (
              <AudioRecorder
                recorder={recorder}
                onRecordStart={() => {
                  trackEvent('memorialAboutMicrophoneButtonClicked', { editingPublishedMemorial });
                }}
              />
            )}
            <Controller
              name="about"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextArea
                  className={cn(inputMode === 'speech' && !recorder.audioUrl && 'hidden')}
                  value={value}
                  onChange={onChange}
                  error={!!errors.about}
                  overlay={
                    isTranscribing && (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-black p-5">
                        <DotLottieReact
                          data={loading}
                          loop
                          autoplay
                          className="h-0 max-h-1/2 grow"
                        />
                        <p className="shrink-0 text-center text-sm">{t('transcribing')}</p>
                      </div>
                    )
                  }
                />
              )}
            />
            <Button
              variant="ghost"
              type="button"
              size={isBelow('lg') ? 'small' : 'default'}
              className="text-mauveine-300 underline"
              onClick={() => {
                const newMode = inputMode === 'speech' ? 'text' : 'speech';
                if (newMode === 'text') {
                  trackEvent('memorialAboutWriteInsteadLinkClicked', { editingPublishedMemorial });
                } else {
                  trackEvent('memorialAboutRecordInsteadLinkClicked', { editingPublishedMemorial });
                }
                setInputMode(newMode);
              }}>
              {inputMode === 'speech' ? t('writeInstead') : t('recordInstead')}
            </Button>
          </div>
        </div>
        <StageControls
          disabled={isLoading || isTranscribing}
          onPrevious={() => {
            trackEvent('memorialAboutBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${id}`);
            } else {
              router.push(`/memorial/edit/${id}/cover`);
            }
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
          onNext={handleNextPressed}
          nextButtonType={'button'}
          nextDisabled={inputMode === 'speech' && !transcription}
        />
      </form>
    </>
  );
}

export default About;

'use client';
import { PublishedMemorial } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState } from 'react';
import FileUpload from '../../Elements/FileUpload/FileUpload';
import { useAudioUpload } from '@/hooks/upload/useAudioUpload';
import AudioPlayer from '../../Elements/AudioPlayer/AudioPlayer';
import Button from '../../Elements/Button/Button';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { generateVoiceClone } from '@/services/client/memorial';
interface VoiceCloneProps {
  memorial: PublishedMemorial;
  onComplete?: () => Promise<void>;
}

const MAX_AUDIO_FILES = 3;

function VoiceClone({ memorial, onComplete }: VoiceCloneProps) {
  const t = useTranslations('AiGreeting.VoiceClone');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const upload = useAudioUpload(MAX_AUDIO_FILES, {
    maxFileSizeMB: 15,
    maxDurationSeconds: 1, // 5 minutes
    onFilesChanged: () => {
      setError(null);
    },
  });
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const handleSubmit = async () => {
    showLoading();
    setError(null);
    try {
      if (upload.files.length === 0) {
        setError(t('pleaseUploadAtLeastOneFile'));
        hideLoading();
        return;
      }
      await generateVoiceClone(memorial.id, upload.files, locale);
      await onComplete?.();
    } catch {
      setError(tError('generic'));
    } finally {
      hideLoading();
    }
  };

  return (
    <section className="flex flex-col justify-around gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <p className={cn('py-2 text-center text-zinc-400')}>{t('description')}</p>
        <div className={cn('flex grow flex-col gap-4', 'md:flex-row md:gap-6', '2xl:gap-17.5')}>
          <FileUpload
            className={cn('aspect-square', 'md:w-81', '2xl:w-107')}
            upload={upload}
            error={!!error}
            errorMessage={error || undefined}>
            {upload.files.length >= MAX_AUDIO_FILES ? (
              <div
                className={cn(
                  'flex aspect-square items-center justify-center p-4 text-center text-sm',
                  'md:w-81',
                  '2xl:w-107',
                )}>
                {t('maxFilesReached')}
              </div>
            ) : null}
          </FileUpload>
          <div className={cn('flex grow flex-col gap-6', 'md:py-0')}>
            {upload.previewUrls.map((previewUrl) => (
              <AudioPlayer
                key={previewUrl}
                audioUrl={previewUrl}
                onDelete={() => upload.removeFileByUrl(previewUrl)}
              />
            ))}
          </div>
        </div>
        <Button className="self-end" onClick={handleSubmit} disabled={isLoading}>
          {tCommon('submit')}
        </Button>
      </div>
    </section>
  );
}

export default VoiceClone;

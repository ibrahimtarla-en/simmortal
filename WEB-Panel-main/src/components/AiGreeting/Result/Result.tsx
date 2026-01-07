'use client';
import Button from '@/components/Elements/Button/Button';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useToast } from '@/hooks/useToast';
import { useRouter } from '@/i18n/navigation';
import { resetAiMemorialGreetingCreation } from '@/services/server/memorial';
import { PublishedMemorial } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ResultProps {
  memorial: PublishedMemorial;
  videoPath: string;
  refresh?: () => Promise<void>;
}

function Result({ memorial, videoPath, refresh }: ResultProps) {
  const t = useTranslations('AiGreeting.Result');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const { toast } = useToast();

  const { showLoading, hideLoading } = useLoadingModal();
  const router = useRouter();

  const handleReset = async () => {
    showLoading();

    try {
      await resetAiMemorialGreetingCreation(memorial.id);
      await refresh?.();
    } catch {
      toast({ message: tError('generic') });
      router.refresh();
    } finally {
      hideLoading();
    }
  };

  return (
    <section className="flex flex-col justify-around gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-10 rounded-lg bg-zinc-900 p-4',
          '2xl:gap-16 2xl:p-6',
        )}>
        <video controls src={videoPath} className="h-full max-h-96 rounded-md" />
        <Button onClick={handleReset} type="button">
          {tCommon('reset')}
        </Button>
      </div>
    </section>
  );
}

export default Result;

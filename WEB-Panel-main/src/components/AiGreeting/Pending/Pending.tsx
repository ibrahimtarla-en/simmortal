'use client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import React, { useEffect, useRef } from 'react';
import loading from '@/assets/lottie/loading.json';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import { PublishedMemorial } from '@/types/memorial';
import { resetAiMemorialGreetingCreation } from '@/services/server/memorial';
import { useToast } from '@/hooks/useToast';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import Button from '@/components/Elements/Button/Button';
import { useRouter } from '@/i18n/navigation';

interface PendingProps {
  memorial: PublishedMemorial;
  refreshStatus?: () => Promise<void>;
}

function Pending({ memorial, refreshStatus }: PendingProps) {
  const t = useTranslations('AiGreeting.Pending');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoadingModal();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleReset = async () => {
    showLoading();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    try {
      await resetAiMemorialGreetingCreation(memorial.id);
      await refreshStatus?.();
    } catch {
      toast({ message: tError('generic') });
      router.refresh();
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    const ref = setInterval(() => {
      refreshStatus?.();
    }, 10000);
    intervalRef.current = ref;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshStatus]);

  return (
    <section className="flex flex-col justify-around gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-10 rounded-lg bg-zinc-900 p-4',
          '2xl:gap-16 2xl:p-6',
        )}>
        <DotLottieReact data={loading} loop autoplay className="h-30" />
        <p>{t('info')}</p>
        <Button onClick={handleReset} type="button">
          {tCommon('reset')}
        </Button>
      </div>
    </section>
  );
}

export default Pending;

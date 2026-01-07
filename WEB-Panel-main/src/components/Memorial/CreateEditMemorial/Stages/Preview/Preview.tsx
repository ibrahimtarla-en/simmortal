'use client';
import React, { useMemo, useState } from 'react';
import StageControls from '../../../StageControls';
import { PublishMemorialPreview } from '@/types/memorial';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import MemorialInfo from '@/components/Memorial/MemorialInfo/MemorialInfo';
import MemorialTabs from '@/components/Memorial/MemorialTabs/MemorialTabs';
import LabeledSwitch from '@/components/Elements/LabeledSwitch/LabeledSwitch';
import { cn } from '@/utils/cn';
import StageProgress from '../../StageProgress';
import { publishFreeMemorial } from '@/services/server/memorial';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface PreviewProps {
  preview: PublishMemorialPreview;
}

function Preview({ preview }: PreviewProps) {
  const [isPremium, setIsPremium] = useState(true);
  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Preview');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const activePreview = useMemo(
    () => (isPremium ? preview.premiumVersion : preview.freeVersion),
    [isPremium, preview],
  );

  const handleCheckout = async () => {
    try {
      showLoading();
      if (isPremium) {
        trackEvent('createMemorialPreviewCheckoutButtonClicked');
        trackEvent('createMemorialPreviewStageCompleted');
        router.push(`/memorial/edit/${preview.premiumVersion.id}/checkout`);
      } else {
        const result = await publishFreeMemorial(preview.freeVersion.id);
        trackEvent('createMemorialPreviewStageCompleted');
        trackEvent('createMemorialPreviewPublishButtonClicked');
        router.push(result.redirectUrl);
      }
    } catch {
      trackEvent('createMemorialPreviewStageFailed');
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <StageProgress stage="preview" />
      <div className={cn('flex flex-col gap-10', '2xl:gap-16')}>
        <div className="flex flex-col items-center justify-center gap-10 text-center text-lg font-light">
          <p>{t('stageDescription')}</p>
          <LabeledSwitch
            state={isPremium ? 'left' : 'right'}
            leftLabel={tCommon('premium')}
            rightLabel={tCommon('free')}
            onChange={(state) => {
              const newIsPremium = state === 'left';
              trackEvent('createMemorialPreviewVersionSelected', {
                version: newIsPremium ? 'premium' : 'free',
              });
              setIsPremium(newIsPremium);
            }}
          />
        </div>
        <div>
          <MemorialInfo memorial={activePreview} viewMode="preview" />
          <MemorialTabs
            previewMode
            memorialName={activePreview.name}
            timelineDisabled={!isPremium}
          />
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('createMemorialPreviewBackButtonClicked');
            router.push(`/memorial/edit/${activePreview.id}/music`);
          }}
          nextButtonLabel={isPremium ? tCommon('checkout') : tCommon('publish')}
          previousButtonLabel={tCommon('back')}
          onNext={handleCheckout}
          nextDisabled={isLoading}
        />
      </div>
    </>
  );
}

export default Preview;

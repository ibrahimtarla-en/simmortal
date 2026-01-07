'use client';
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import StageControls from '../../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import { Memory } from '@/types/memory';
import { publishMemory, updateMemory } from '@/services/server/memory';
import Donation from '../../../Donation';
import DonationCount from '../../../DonationCount';
import BaseMemoryCard from '../../../MemoryCard/BaseMemoryCard';
import { isContributionNeedsPayment, isContributionPublished } from '@/types/contribution';
import MemorialPublishedModal from '@/components/Memorial/CreateEditMemorial/MemorialPublishedModal';
import { toSearchParams } from '@/utils/searchParams';
import { useMemoryAsset } from '@/hooks/useMemoryAsset';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useToast } from '@/hooks/useToast';
import { trackEvent } from '@/utils/analytics';

interface DonateProps {
  initialValues: Memory;
  slug: string;
}

function Donate({ initialValues, slug }: DonateProps) {
  const [donationCount, setDonationCount] = useState(0);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const t = useTranslations('CreateMemory.Stages.Donate');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const { withAsset, withoutAsset } = useMemoryAsset(initialValues);

  const handleNext = async () => {
    try {
      showLoading();
      if (initialValues.donationCount !== donationCount) {
        await updateMemory(slug, initialValues.id, { donationCount: donationCount });
      }
      setShowPublishedModal(true);
      const response = await publishMemory(slug, initialValues.id);

      if (isContributionNeedsPayment(response)) {
        trackEvent('memoryDonateCheckoutRedirected', {
          donationCount: donationCount,
        });
        router.push(response.paymentUrl);
      } else if (isContributionPublished(response)) {
        trackEvent('memoryDonatePublishedDirectly', {
          donationCount: donationCount,
        });
        setShowPublishedModal(true);
      }
    } catch {
      trackEvent('memoryDonateStageFailed', {
        donationCount: donationCount,
      });
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  const handleNavigateToMemorial = () => {
    router.push(`/memorial/${slug}`);
  };

  const handlePreviewHref = () => {
    const memoryId = initialValues.id;
    const overrides = { donationCount: donationCount };
    return `/memorial/contribute/${slug}/memory/preview/${memoryId}?${toSearchParams(overrides)}`;
  };
  // TODO: Update price when more tribute options are available
  return (
    <>
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}>
        <div className={cn('flex w-full flex-col items-center justify-center gap-6')}>
          <h2 className="text-lg">{t('question')}</h2>
          <div className="flex flex-col items-center justify-center">
            {withAsset && (
              <>
                <MemorialPortrait
                  tribute={withAsset.assetDecoration || 'default'}
                  imageUrl={withAsset.assetPath}
                  fileType={withAsset.assetType}
                  showPremiumBadge={false}
                  className="h-auto w-81"
                />
                <Donation count={donationCount} />
              </>
            )}
            {withoutAsset && (
              <BaseMemoryCard
                date={withoutAsset.date}
                author={withoutAsset.author}
                content={withoutAsset.content}
                decoration={withoutAsset.decoration || 'no-decoration'}
                donationCount={donationCount}
                totalLikes={withoutAsset.totalLikes}
                className="w-66"
                createdAt={withoutAsset.createdAt}
                memorialSlug={withoutAsset.memorialSlug}
              />
            )}
          </div>
          <DonationCount count={donationCount} price={1} setCount={setDonationCount} />
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memoryDonateBackButtonClicked');
            router.push(`/memorial/contribute/${slug}/memory/edit/${initialValues.id}/tribute`);
          }}
          nextButtonLabel={tCommon('publish')}
          previousButtonLabel={tCommon('back')}
          onNext={() => {
            trackEvent('memoryDonatePublishButtonClicked', {
              donationCount: donationCount,
            });
            handleNext();
          }}
          nextDisabled={isLoading}
          preview={
            withAsset
              ? {
                  href: handlePreviewHref(),
                  buttonLabel: tCommon('previewMemorialButton'),
                  analytics: {
                    eventName: 'memoryDonatePreviewButtonClicked',
                    params: { donationCount: donationCount },
                  },
                }
              : undefined
          }
        />
      </div>
      {showPublishedModal && (
        <MemorialPublishedModal type="memory" primaryButtonAction={handleNavigateToMemorial} />
      )}
    </>
  );
}

export default Donate;

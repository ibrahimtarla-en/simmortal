'use client';
import React, { useEffect, useRef } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import { useTranslations } from 'next-intl';
import Button from '@/components/Elements/Button/Button';
import loading from '@/assets/lottie/loading.json';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Donation } from '@/types/donation';
import { cn } from '@/utils/cn';
import DonateCard from '../DonateCard/DonateCard';
import { MemorialDonationWreath } from '@/types/memorial';
import { useRouter } from '@/i18n/navigation';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { createDonation, publishDonation } from '@/services/server/donation';
import { useUserStore } from '@/store';
import { exists } from '@/utils/exists';
interface MemorialDonationsProps<T extends Donation = Donation> {
  controller: ReturnType<typeof usePaginatedFetch<T>>;
  memorialSlug?: string;
  previewMode?: boolean;
  wreathPrices?: Record<MemorialDonationWreath, string>;
  showMemorialInfo?: boolean;
}

function MemorialDonations<T extends Donation = Donation>({
  controller,
  memorialSlug,
  previewMode,
  wreathPrices,
  showMemorialInfo = false,
}: MemorialDonationsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });
  const { showLoading, hideLoading } = useLoadingModal();
  const { items, fetchNext, isAllFetched, updateItem, removeItem } = controller;
  const tCommon = useTranslations('Common');
  const { user } = useUserStore();

  async function processDonation(wreath: MemorialDonationWreath) {
    if (!memorialSlug) return;
    if (!exists(user)) {
      const redirectUrl = `/memorial/contribute/${memorialSlug}/donate`;
      router.push(`/login?redirect_to=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    showLoading();
    try {
      const donation = await createDonation(memorialSlug, wreath);
      const response = await publishDonation(memorialSlug, donation.id);
      router.push(response.paymentUrl);
    } finally {
      hideLoading();
    }
  }

  // Set slug and fetch initial on mount or slug change
  useEffect(() => {
    if (previewMode) {
      return;
    }
    fetchNext();
  }, [fetchNext, previewMode]);

  // Infinite scroll
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (previewMode) {
      return;
    }
    if (latest > 0.8 && !isAllFetched) {
      fetchNext();
    }
  });
  return (
    <>
      <div ref={containerRef}>
        {items.length === 0 && memorialSlug && (
          <div className="flex w-full justify-center py-4">
            {!isAllFetched && <DotLottieReact data={loading} loop autoplay className="h-20" />}
            {isAllFetched && !wreathPrices && (
              <Button role="link" href={`/memorial/contribute/${memorialSlug}/donate`}>
                {tCommon('donate')}
              </Button>
            )}
            {isAllFetched && wreathPrices && (
              <div
                className={cn('grid w-full grid-cols-1 gap-4', 'md:grid-cols-2', 'xl:grid-cols-4')}>
                {Object.entries(wreathPrices).map(([wreath, price]) => (
                  <DonateCard
                    wreath={wreath as MemorialDonationWreath}
                    price={price}
                    onDonate={processDonation}
                    key={wreath}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {items.length > 0 && (
          <div className={cn('grid grid-cols-1 gap-4', 'md:grid-cols-2', 'xl:grid-cols-4')}>
            {items.map((donation) => (
              <DonateCard
                key={donation.id}
                showMemorialInfo={showMemorialInfo}
                donation={donation}
                wreath={donation.wreath}
                onLike={() => {
                  updateItem(
                    {
                      ...donation,
                      isLikedByUser: true,
                      totalLikes: donation.totalLikes + 1,
                    },
                    (item) => item.id,
                  );
                }}
                onUnlike={() => {
                  updateItem(
                    {
                      ...donation,
                      isLikedByUser: true,
                      totalLikes: donation.totalLikes - 1,
                    },
                    (item) => item.id,
                  );
                }}
                onDelete={() => {
                  removeItem(donation, (item) => item.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MemorialDonations;

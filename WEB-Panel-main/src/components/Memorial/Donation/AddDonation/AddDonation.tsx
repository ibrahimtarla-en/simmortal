'use client';
import { MemorialDonationWreath, PublishedMemorial } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';
import DonateCard from '../DonateCard/DonateCard';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { createDonation, publishDonation } from '@/services/server/donation';
import { useRouter } from '@/i18n/navigation';
import StageControls from '../../StageControls';

interface AddDonationProps {
  memorialSlug: string;
  memorial: PublishedMemorial;
  prices: Record<MemorialDonationWreath, string>;
}

function AddDonation({ memorialSlug, memorial, prices }: AddDonationProps) {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Donate');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const router = useRouter();

  async function processDonation(wreath: MemorialDonationWreath) {
    showLoading();
    try {
      const donation = await createDonation(memorialSlug, wreath);
      const response = await publishDonation(memorialSlug, donation.id);
      router.push(response.paymentUrl);
    } finally {
      hideLoading();
    }
  }

  return (
    <main className="container">
      <div className="flex flex-col justify-around gap-10 px-4 py-10">
        <h1 className="font-serif text-2xl font-medium">{tCommon('donate')}</h1>
        <div>
          <div className={cn('flex flex-col gap-7 rounded-lg bg-zinc-900 p-4', '2xl:p-6')}>
            <div className="text-center">
              <p className="font text-lg">{t.rich('tagline', { name: memorial.name })}</p>
              <p className="font text-mauveine-200 mt-0.5 text-xs">{t('infoText')}</p>
            </div>
            <div className={cn('grid grid-cols-1 gap-4', 'md:grid-cols-2', 'xl:grid-cols-4')}>
              {Object.entries(prices).map(([wreath, price]) => (
                <DonateCard
                  wreath={wreath as MemorialDonationWreath}
                  price={price}
                  onDonate={processDonation}
                  key={wreath}
                  disabled={isLoading}
                />
              ))}
            </div>
            <StageControls
              disabled={isLoading}
              previousButtonLabel={tCommon('back')}
              nextButtonType="button"
              onPrevious={() => {
                router.replace(`/memorial/${memorialSlug}`);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddDonation;

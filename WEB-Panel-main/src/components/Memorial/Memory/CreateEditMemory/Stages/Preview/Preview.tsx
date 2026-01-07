'use client';

import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import { Memory } from '@/types/memory';

import { useNavbarBanner } from '@/hooks/useNavbarBanner';
import BaseMemoryCard from '../../../MemoryCard/BaseMemoryCard';
import { useMemoryAsset } from '@/hooks/useMemoryAsset';

interface DonateProps {
  initialValues: Memory;
}

function Donate({ initialValues }: DonateProps) {
  const { showBanner } = useNavbarBanner();

  const t = useTranslations('CreateMemory.Stages.Preview');

  const { withAsset, withoutAsset } = useMemoryAsset(initialValues);

  useEffect(() => {
    showBanner({
      message: t('previewInfo'),
    });
  }, [showBanner, t]);

  return (
    <>
      <div className={cn('mt-10 flex w-full justify-center')}>
        {withAsset && (
          <BaseMemoryCard
            date={withAsset.date}
            author={withAsset.author}
            content={withAsset.content}
            tribute={withAsset.assetDecoration || 'default'}
            assetPath={withAsset.assetPath}
            assetType={withAsset.assetType}
            donationCount={withAsset.donationCount}
            totalLikes={withAsset.totalLikes}
            className="w-66"
            createdAt={withAsset.createdAt}
            memorialSlug={withAsset.memorialSlug}
          />
        )}
        {withoutAsset && (
          <BaseMemoryCard
            date={withoutAsset.date}
            author={withoutAsset.author}
            content={withoutAsset.content}
            decoration={withoutAsset.decoration || 'no-decoration'}
            donationCount={withoutAsset.donationCount}
            totalLikes={withoutAsset.totalLikes}
            className="w-66"
            createdAt={withoutAsset.createdAt}
            memorialSlug={withoutAsset.memorialSlug}
          />
        )}
      </div>
    </>
  );
}

export default Donate;

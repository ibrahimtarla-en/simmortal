'use client';

import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import { useNavbarBanner } from '@/hooks/useNavbarBanner';
import BaseCondolenceCard from '../../../CondolenceCard/BaseCondolenceCard';
import { Condolence } from '@/types/condolence';

interface DonateProps {
  initialValues: Condolence;
}

function Donate({ initialValues }: DonateProps) {
  const { showBanner } = useNavbarBanner();

  const t = useTranslations('CreateMemory.Stages.Preview');

  useEffect(() => {
    showBanner({
      message: t('previewInfo'),
    });
  }, [showBanner, t]);

  return (
    <>
      <div className={cn('mt-10 flex w-full justify-center')}>
        <BaseCondolenceCard
          content={initialValues.content || ''}
          decoration={initialValues.decoration || 'no-decoration'}
          author={initialValues.author}
          date={initialValues.createdAt}
          totalLikes={initialValues.totalLikes}
          isLikedByUser={initialValues.isLikedByUser}
          isPreview={true}
          className={cn('h-full w-full max-w-[580px]')}
          id={initialValues.id}
          memorialSlug={initialValues.memorialSlug || ''}
        />
      </div>
    </>
  );
}

export default Donate;

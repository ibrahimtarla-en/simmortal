'use client';
import Button from '@/components/Elements/Button/Button';
import SquareModal from '@/components/Modals/SquareModal/SquareModal';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import Copy from '@/assets/icons/copy.svg';
import { ContributeType } from '@/types/memory';
import { MemorialDonationWreath } from '@/types/memorial';

interface MemorialPublishedModalProps {
  type?: ContributeType;
  hasLink?: boolean;
  primaryButtonAction?: () => void;
  prices?: Record<MemorialDonationWreath, string>;
}

function MemorialPublishedModal({
  type,
  hasLink = true,
  primaryButtonAction,
}: MemorialPublishedModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations('CreateMemorial.Stages.Published');

  const memorialDescription = useMemo(() => {
    if (type === 'memory') {
      return t('memoryPublished');
    } else if (type === 'condolence') {
      return t('condolencePublished');
    }
    if (type === 'donation') {
      return t('donationPublished');
    } else {
      return t('nowLive');
    }
  }, [type, t]);

  const handleClose = () => {
    if (primaryButtonAction) {
      primaryButtonAction();
    }
    window.history.replaceState({}, document.title, getCleanUrl());
    setIsOpen(false);
  };

  return (
    <>
      <SquareModal open={isOpen} onCloseClicked={handleClose}>
        <div className={cn('flex h-full flex-col items-center justify-center gap-3', 'md:gap-5')}>
          <h2 className={cn('text-3xl', 'md:text-4xl')}>{t('congratulations')}</h2>
          <p className={cn('text-center font-light', 'md:text-xl')}>{memorialDescription}</p>
          <Button className="mt-7 mb-5" onClick={primaryButtonAction || handleClose}>
            {t('viewMemorial')}
          </Button>
          {hasLink && (
            <Button
              variant="ghost"
              className={cn('text-mauveine-300 gap-0.5 text-sm underline', 'md:text-base')}
              icon={<Copy />}
              onClick={() => {
                navigator.clipboard.writeText(getCleanUrl());
              }}>
              {t('copyLink')}
            </Button>
          )}
        </div>
      </SquareModal>
    </>
  );
}

export default MemorialPublishedModal;

const getCleanUrl = () => window.location.origin + window.location.pathname + window.location.hash;

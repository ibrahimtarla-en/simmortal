'use client';
import Button from '@/components/Elements/Button/Button';
import SquareModal from '@/components/Modals/SquareModal/SquareModal';
import { useToast } from '@/hooks/useToast';
import { deleteCondolence } from '@/services/server/condolence';
import { deleteDonation } from '@/services/server/donation';
import { deleteMemory } from '@/services/server/memory';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface DeleteContributionModalProps {
  onClose?: () => void;
  type: 'memory' | 'condolence' | 'donation';
  memorialSlug: string;
  contributionId: string;
  onDelete?: () => void;
}

function DeleteContributionModal({
  onClose,
  memorialSlug,
  contributionId,
  type,
  onDelete,
}: DeleteContributionModalProps) {
  const t = useTranslations('DeleteContribution');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteContribution = async () => {
    setIsDeleting(true);
    try {
      if (type === 'memory') {
        await deleteMemory(memorialSlug, contributionId);
      } else if (type === 'condolence') {
        await deleteCondolence(memorialSlug, contributionId);
      } else if (type === 'donation') {
        await deleteDonation(memorialSlug, contributionId);
      }
      toast({
        title: t(`successTitle.${type}`),
        message: t(`successDescription.${type}`),
      });
      onDelete?.();
      onClose?.();
    } catch {
      onClose?.();
      toast({ message: tError('generic') });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SquareModal
      open
      closable={!isDeleting}
      preventsPageScroll
      onCloseClicked={(e) => {
        e.stopPropagation();
        onClose?.();
      }}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="text-2xl font-semibold text-white">{t(`title.${type}`)}</h2>
        <p className="font-light">{tCommon('areYouSure')}</p>
        <p className="text-sm font-bold text-red-500">{t(`description.${type}`)}</p>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            size="small"
            disabled={isDeleting}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteContribution();
            }}
            size="small"
            className={cn(
              'bg-red-700 hover:bg-red-600',
              isDeleting && 'bg-red-950 hover:bg-red-950',
            )}
            disabled={isDeleting}>
            {tCommon('delete')}
          </Button>
        </div>
      </div>
    </SquareModal>
  );
}

export default DeleteContributionModal;

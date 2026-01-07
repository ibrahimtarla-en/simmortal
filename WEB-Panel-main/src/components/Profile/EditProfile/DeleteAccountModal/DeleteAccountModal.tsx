'use client';
import Button from '@/components/Elements/Button/Button';
import SquareModal from '@/components/Modals/SquareModal/SquareModal';
import { useToast } from '@/hooks/useToast';
import { deleteAccount } from '@/services/server/user';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface DeleteAccountModalProps {
  open?: boolean;
  onClose?: () => void;
}

function DeleteAccountModal({ onClose, open }: DeleteAccountModalProps) {
  const t = useTranslations('Profile');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      onClose?.();
      toast({ message: tError('generic') });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SquareModal open={open} closable={!isDeleting} preventsPageScroll onCloseClicked={onClose}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="text-2xl font-semibold text-white">{t('deleteAccount')}</h2>
        <p className="font-light">{tCommon('areYouSure')}</p>
        <p className="text-sm font-bold text-red-500">{t('deleteAccountDescription')}</p>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={onClose} size="small" disabled={isDeleting}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleDeleteAccount}
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

export default DeleteAccountModal;

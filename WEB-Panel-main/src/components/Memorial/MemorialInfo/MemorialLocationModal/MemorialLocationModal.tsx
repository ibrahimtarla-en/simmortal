'use client';
import Button from '@/components/Elements/Button/Button';
import SquareModal from '@/components/Modals/SquareModal/SquareModal';
import { useToast } from '@/hooks/useToast';
import { useRouter } from '@/i18n/navigation';
import { createOrUpdateSimmTagLocation } from '@/services/server/simmtag';
import { cn } from '@/utils/cn';
import { getUserLocation } from '@/utils/geolocation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useRef, useState } from 'react';
import loading from '@/assets/lottie/loading.json';
import location from '@/assets/lottie/location.json';
import { useBreakpoints } from '@/hooks';

interface MemorialLocationModalProps {
  open?: boolean;
  onClose?: () => void;
  memorialId: string;
}

function MemorialLocationModal({ onClose, open, memorialId }: MemorialLocationModalProps) {
  const t = useTranslations('SimmTag');
  const tError = useTranslations('Error');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const toastCooldown = useRef<boolean>(false);
  const { isBelow } = useBreakpoints();

  const handleSetLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUserLocation();
      if (response.status === 'error') {
        console.log(response);
        throw new Error('Geolocation error');
      }
      await createOrUpdateSimmTagLocation(memorialId, response.coords);
      toast({
        title: t('locationAssignedTitle'),
        message: t('locationAssignedMessage'),
      });
      router.refresh();
      onClose?.();
    } catch {
      if (toastCooldown.current) return;
      toastCooldown.current = true;
      setTimeout(() => {
        toastCooldown.current = false;
      }, 3000);
      toast({ title: tError('locationErrorTitle'), message: tError('locationErrorMessage') });
    } finally {
      setIsLoading(false);
    }
  }, [memorialId, router, tError, t, toast, onClose]);

  return (
    <SquareModal open={open} closable={!isLoading} preventsPageScroll onCloseClicked={onClose}>
      {!isLoading && (
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-4 text-center text-white',
            'md:gap-6',
          )}>
          <DotLottieReact data={location} loop autoplay className={cn('h-20', 'md:h-36')} />
          <div className={cn('flex flex-col gap-3', 'md:gap-5')}>
            <h2 className={cn('text-lg font-semibold', 'md:text-2xl')}>{t('assignLocation')}</h2>
            <p className={cn('text-sm', 'md:text-lg')}>{t('assignLocationDescription')}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSetLocation}
              className="w-full"
              size={isBelow('md') ? 'small' : 'default'}>
              {t('confirmLocationButtonLabel')}
            </Button>
            <Button onClick={onClose} className="w-full" size={isBelow('md') ? 'small' : 'default'}>
              {t('cancelLocationButtonLabel')}
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <h2 className={cn('text-lg font-semibold', 'md:text-2xl')}>{t('assigningLocation')}</h2>
          <DotLottieReact data={loading} loop autoplay className="max-h-30 shrink grow" />
        </div>
      )}
    </SquareModal>
  );
}

export default MemorialLocationModal;

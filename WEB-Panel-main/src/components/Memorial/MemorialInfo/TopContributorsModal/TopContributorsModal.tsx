'use client';
import { useToast } from '@/hooks/useToast';
import loading from '@/assets/lottie/loading.json';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/utils/cn';
import { ClickableMemorialStat, PublishedMemorial, TopContributor } from '@/types/memorial';
import {
  getTopCandleContributors,
  getTopDonationContributors,
  getTopFlowerContributors,
  getTopTreeContributors,
} from '@/services/server/memorial';
import Close from '@/assets/icons/close.svg';
import Candles from '@/assets/icons/candles.svg';
import Donations from '@/assets/icons/donations.svg';
import Flowers from '@/assets/icons/flowers.svg';
import Trees from '@/assets/icons/tree.svg';
import Button from '@/components/Elements/Button/Button';
import { useBreakpoints } from '@/hooks';
import { useLenis } from 'lenis/react';

interface TopContributorsModalProps {
  open?: boolean;
  onClose?: () => void;
  contributionType: ClickableMemorialStat;
  memorial: PublishedMemorial;
}

function TopContributorsModal({
  onClose,
  open,
  contributionType,
  memorial,
}: TopContributorsModalProps) {
  const [contributors, setContributors] = useState<TopContributor[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('VisitMemorial.TopContributors');
  const tError = useTranslations('Error');
  const { toast } = useToast();
  const { isBelow } = useBreakpoints();
  const lenis = useLenis();

  useEffect(() => {
    const fetchData = async (contributionType: ClickableMemorialStat) => {
      setIsLoading(true);
      try {
        switch (contributionType) {
          case 'flowers':
            setContributors(await getTopFlowerContributors(memorial.slug));
            break;
          case 'donations':
            setContributors(await getTopDonationContributors(memorial.slug));
            break;
          case 'candles':
            setContributors(await getTopCandleContributors(memorial.slug));
            break;
          case 'trees':
            setContributors(await getTopTreeContributors(memorial.slug));
            break;
          default:
            setContributors([]);
            break;
        }
      } catch {
        toast({
          message: tError('generic'),
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (open) {
      fetchData(contributionType);
    }
    if (!open) {
      setContributors(null);
    }
  }, [open, contributionType, memorial, toast, tError]);

  useEffect(() => {
    if (open) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [open, lenis]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed top-0 right-0 bottom-0 left-0 z-99999999 flex w-full items-center justify-center p-6 font-serif backdrop-blur-sm',
      )}>
      <div
        className={cn(
          'border-shine-1 bg-gradient-card-fill max-h-120 w-full max-w-190 shrink-0 rounded-2xl px-5 py-10',
        )}>
        <div className="relative flex max-h-95 flex-col">
          {isLoading && (
            <div className="mx-auto flex h-30 w-full max-w-170 flex-col items-center justify-center">
              <DotLottieReact data={loading} loop autoplay className="max-h-30 shrink grow" />
            </div>
          )}
          {!isLoading && contributors && contributors.length === 0 && (
            <>
              <h2
                className={cn('mb-9 flex items-center gap-2 text-xl text-zinc-200', 'md:text-2xl')}>
                <div className="h-9 w-9">{iconMap[contributionType]}</div>
                {t(contributionType)}
              </h2>
              <div>{t('noContributors')}</div>
            </>
          )}
          {!isLoading && contributors && contributors.length > 0 && (
            <>
              <h2
                className={cn('mb-9 flex items-center gap-2 text-xl text-zinc-200', 'md:text-2xl')}>
                <div className="h-9 w-9">{iconMap[contributionType]}</div>
                {t(contributionType)}
              </h2>
              <div
                onWheel={(e) => e.stopPropagation()}
                className={cn(
                  'grid h-full grow grid-cols-1 gap-x-9 gap-y-9',
                  '!scrollbar-thin scrollbar-track-transparent scrollbar-corner-blue-500 scrollbar-thumb-mauveine-500 max-h-95 overflow-y-auto overscroll-none px-2 pb-5',
                  'md:grid-cols-2',
                )}
                style={{ overscrollBehavior: 'contain' }}>
                {contributors.map((contributor) => (
                  <div
                    key={contributor.userId}
                    className="flex w-full items-center justify-between pr-4">
                    <div className={cn('md:text-lg')}>{contributor.name}</div>
                    <div className={cn('text-mauveine-200 text-lg', 'md:text-xl')}>
                      {contributor.amount}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <Button
          size={isBelow('xl') ? 'small' : 'default'}
          icon={<Close />}
          onClick={onClose}
          className="absolute top-0 right-0 z-99 translate-x-2 -translate-y-2"
        />
      </div>
    </div>
  );
}

export default TopContributorsModal;

const iconMap: Record<ClickableMemorialStat, React.ReactNode> = {
  candles: <Candles />,
  donations: <Donations />,
  flowers: <Flowers />,
  trees: <Trees />,
};

'use client';
import React, { useState } from 'react';
import {
  CLICKABLE_MEMORIAL_STATS,
  ClickableMemorialStat,
  MEMORIAL_STAT_KEYS,
  MemorialStats,
  PublishedMemorial,
} from '@/types/memorial';
import Condolences from '@/assets/icons/condolences.svg';
import Memories from '@/assets/icons/memories.svg';
import Candles from '@/assets/icons/candles.svg';
import Donations from '@/assets/icons/donations.svg';
import Views from '@/assets/icons/views.svg';
import Likes from '@/assets/icons/heart-filled.svg';
import Flowers from '@/assets/icons/flowers.svg';
import Trees from '@/assets/icons/tree.svg';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import TopContributorsModal from './TopContributorsModal/TopContributorsModal';

interface MemorialStatsProps {
  memorial: PublishedMemorial;
  className?: string;
  hideLabels?: boolean;
  iconClassName?: string;
  textClassName?: string;
  allowTopContributorsModal?: boolean;
}

function MemorialStatsGrid({
  memorial,
  className,
  hideLabels = false,
  iconClassName,
  textClassName,
  allowTopContributorsModal,
}: MemorialStatsProps) {
  const { stats } = memorial;
  const t = useTranslations('VisitMemorial');
  const [topContributorsModalOpen, setTopContributorsModalOpen] = useState(false);
  const [selectedContributionType, setSelectedContributionType] =
    useState<ClickableMemorialStat>('flowers');

  return (
    <>
      <div
        className={cn(
          'grid shrink grid-cols-2 gap-5 font-serif',
          hideLabels && 'grid-cols-4',
          'md:grid-cols-4',
          className,
        )}>
        {MEMORIAL_STAT_KEYS.map((key) => (
          <div
            key={key}
            onClick={
              allowTopContributorsModal &&
              CLICKABLE_MEMORIAL_STATS.includes(key as ClickableMemorialStat)
                ? () => {
                    setSelectedContributionType(key as ClickableMemorialStat);
                    setTopContributorsModalOpen(true);
                  }
                : undefined
            }
            className={cn(
              'flex items-center gap-2',
              CLICKABLE_MEMORIAL_STATS.includes(key as ClickableMemorialStat) &&
                allowTopContributorsModal
                ? 'cursor-pointer hover:underline'
                : '',
            )}>
            <div className={cn('h-7.5 w-7.5', iconClassName)}>{iconMap[key]}</div>
            <div className={cn('text-sm font-medium', textClassName)}>
              {stats[key]} {hideLabels ? null : t(`MemorialStats.${key}`)}
            </div>
          </div>
        ))}
      </div>
      {allowTopContributorsModal && (
        <TopContributorsModal
          open={topContributorsModalOpen}
          memorial={memorial}
          contributionType={selectedContributionType}
          onClose={() => setTopContributorsModalOpen(false)}
        />
      )}
    </>
  );
}

export default MemorialStatsGrid;

const iconMap: Record<keyof MemorialStats, React.ReactNode> = {
  views: <Views />,
  condolences: <Condolences />,
  memories: <Memories />,
  candles: <Candles />,
  donations: <Donations />,
  flowers: <Flowers />,
  trees: <Trees />,
  likes: <Likes />,
};

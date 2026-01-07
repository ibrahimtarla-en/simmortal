'use client';
import { PublishedMemorial } from '@/types/memorial';
import { formatDate } from '@/utils/date';
import Image from 'next/image';
import React from 'react';
import MemorialStatsGrid from '../MemorialInfo/MemorialStats';
import Report from '@/assets/icons/report.svg';
import { Link } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { useLocale } from 'next-intl';

interface MemorialCardProps {
  memorial: PublishedMemorial;
  decorator?: React.ReactNode;
  infoText?: string;
  onReportClick?: () => void;
  href: string;
  className?: string;
  decoratorPosition?: 'top-left' | 'top-right';
  disabled?: boolean;
}

function MemorialCard({
  memorial,
  decorator,
  infoText,
  onReportClick,
  href,
  className,
  decoratorPosition = 'top-right',
  disabled = false,
}: MemorialCardProps) {
  const locale = useLocale();

  return (
    <Link
      className={cn(
        'border-shine-1 w-full overflow-clip rounded-xl font-serif',
        className,
        disabled && 'pointer-events-none',
      )}
      href={href}>
      <div className="relative aspect-square w-full">
        {decorator && (
          <div
            className={cn(
              'absolute top-2.5 z-10',
              decoratorPosition === 'top-right' && 'right-2.5',
              decoratorPosition === 'top-left' && 'left-2.5',
            )}>
            {decorator}
          </div>
        )}
        <Image className="object-cover" src={memorial.imagePath} alt={memorial.name} fill />
      </div>
      <div className="flex flex-col items-center gap-6 p-3">
        <div className="flex w-full justify-between font-sans text-xs">
          <div className="text-2xs text-zinc-200">{infoText}</div>
          <button className="h-3 w-3 cursor-pointer" onClick={onReportClick}>
            <Report width={12} height={12} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-medium">{memorial.name}</h2>
          <p>
            {formatDate(memorial.dateOfBirth, 'YYYY', locale)} -{' '}
            {formatDate(memorial.dateOfDeath, 'YYYY', locale)}
          </p>
        </div>
        <MemorialStatsGrid
          memorial={memorial}
          hideLabels
          iconClassName="text-mauveine-200"
          className="w-full"
        />
      </div>
    </Link>
  );
}

export default MemorialCard;

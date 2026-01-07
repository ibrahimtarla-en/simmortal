'use client';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';
import Premium from '@/assets/icons/premium.svg';

interface PremiumTagProps {
  isPremium: boolean;
  className?: string;
}

function PremiumTag({ isPremium, className }: PremiumTagProps) {
  const tCommon = useTranslations('Common');

  return (
    <div
      className={cn(
        'text-2xs border-shine-1 flex h-5.5 min-w-21 items-center justify-center gap-1 rounded-full px-2 py-1 font-medium',
        isPremium ? 'bg-mauveine-500' : 'bg-zinc-700',
        className,
      )}>
      {isPremium && <Premium className="h-3.5 w-3.5 grow-0" />}
      {isPremium ? tCommon('premium') : tCommon('free')}
    </div>
  );
}

export default PremiumTag;

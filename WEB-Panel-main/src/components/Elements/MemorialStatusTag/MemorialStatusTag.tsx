'use client';
import { MemorialStatus } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';
import Edit from '@/assets/icons/edit.svg';
import Verified from '@/assets/icons/verified.svg';
import Close from '@/assets/icons/close.svg';

interface MemorialStatusTagProps {
  status: MemorialStatus;
}

function MemorialStatusTag({ status }: MemorialStatusTagProps) {
  const tCommon = useTranslations('Common');
  return (
    <div
      className={cn(
        'flex h-7 min-w-24 items-center justify-center gap-0.5 rounded-lg border-1 border-white p-1.25 font-sans text-xs font-medium text-white',
        status === MemorialStatus.DRAFT && 'bg-zinc-700',
        status === MemorialStatus.PUBLISHED && 'bg-mauveine-700',
        status === MemorialStatus.REMOVED && 'bg-red-700',
      )}>
      {tCommon(status)}
      {status === MemorialStatus.DRAFT && <Edit className="h-4.5 w-4.5" />}
      {status === MemorialStatus.PUBLISHED && <Verified className="h-4.5 w-4.5" />}
      {status === MemorialStatus.REMOVED && <Close className="h-4.5 w-4.5" />}
    </div>
  );
}

export default MemorialStatusTag;

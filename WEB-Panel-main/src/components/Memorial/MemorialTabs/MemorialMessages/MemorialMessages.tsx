'use client';
import Button from '@/components/Elements/Button/Button';
import { getMemorialFlags, handleMemorialFlag } from '@/services/server/memorial';
import {
  MemorialFlag,
  MemorialFlagContent,
  MemorialFlagStatus,
  MemorialFlagType,
} from '@/types/memorial';
import { cn } from '@/utils/cn';
import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';
import MemoryOverlay from '../../Memory/MemoryOverlay/MemoryOverlay';
import { createMemoryPreview } from '@/services/server/memory';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { createCondolencePreview } from '@/services/server/condolence';
import CondolenceOverlay from '../../Condolence/CondolenceOverlay/CondolenceOverlay';
import { getDonationById } from '@/services/server/donation';
import DonationOverlay from '../../Donation/DonationOverlay/DonationOverlay';

interface MemorialMessagesProps {
  initialFlags: MemorialFlag[];
  slug: string;
}

function MemorialMessages({ initialFlags, slug }: MemorialMessagesProps) {
  const [flags, setFlags] = useState<MemorialFlag[]>(initialFlags);
  const [highlightedContribution, setHighlightedContribution] =
    useState<MemorialFlagContent | null>(null);
  const [updatingFlags, setUpdatingFlags] = useState<boolean>(false);
  const t = useTranslations('Notification');
  const { showLoading, hideLoading } = useLoadingModal();
  const handleFlag = useCallback(
    async (flagId: string, status: MemorialFlagStatus) => {
      setUpdatingFlags(true);
      try {
        await handleMemorialFlag(flagId, status);
        const updatedFlags = await getMemorialFlags(slug);
        setFlags(updatedFlags || []);
      } finally {
        setUpdatingFlags(false);
      }
    },
    [slug],
  );

  const handleViewContribution = useCallback(
    async (flag: MemorialFlag) => {
      try {
        showLoading();
        if (
          flag.type === MemorialFlagType.MEMORY_REPORT ||
          flag.type === MemorialFlagType.MEMORY_REQUEST
        ) {
          const memory = await createMemoryPreview(slug, flag.referenceId);
          if (memory) {
            setHighlightedContribution({ type: 'memory', contribution: memory });
          }
        } else if (
          flag.type === MemorialFlagType.CONDOLENCE_REPORT ||
          flag.type === MemorialFlagType.CONDOLENCE_REQUEST
        ) {
          // Assuming a similar function exists for condolences
          const condolence = await createCondolencePreview(slug, flag.referenceId);
          if (condolence) {
            setHighlightedContribution({ type: 'condolence', contribution: condolence });
          }
        } else if (flag.type === MemorialFlagType.DONATION_REPORT) {
          const donation = await getDonationById(slug, flag.referenceId);
          if (donation) {
            setHighlightedContribution({ type: 'donation', contribution: donation });
          }
        }
      } finally {
        hideLoading();
      }
    },
    [hideLoading, showLoading, slug],
  );

  if (flags.length === 0) {
    return <div className="py-6 text-center">{t('noNewMessages')}</div>;
  }
  return (
    <>
      <div className="flex flex-col gap-6">
        {flags
          .filter((f) => f.type !== MemorialFlagType.MEMORIAL_REPORT) // These shouldn't exist, but just in case filter them out
          .map((flag) => (
            <Message
              key={flag.id}
              flag={flag}
              disableActions={updatingFlags}
              handleFlag={handleFlag}
              onViewContribution={handleViewContribution}
            />
          ))}
      </div>
      <AnimatePresence>
        {highlightedContribution && highlightedContribution.type === 'memory' && (
          <MemoryOverlay
            memory={highlightedContribution.contribution}
            onClose={() => setHighlightedContribution(null)}
          />
        )}
        {highlightedContribution && highlightedContribution.type === 'condolence' && (
          <CondolenceOverlay
            condolence={highlightedContribution.contribution}
            onClose={() => setHighlightedContribution(null)}
          />
        )}
        {highlightedContribution && highlightedContribution.type === 'donation' && (
          <DonationOverlay
            donation={highlightedContribution.contribution}
            onClose={() => setHighlightedContribution(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default MemorialMessages;

interface MessageProp {
  flag: MemorialFlag;
  disableActions?: boolean;
  handleFlag: (flagId: string, status: MemorialFlagStatus) => void;
  onViewContribution: (flag: MemorialFlag) => void;
}

function Message({ flag, disableActions, handleFlag, onViewContribution }: MessageProp) {
  const t = useTranslations('Notification');
  const tReport = useTranslations('Report.Options');
  const tCommon = useTranslations('Common');
  return (
    <div
      className={cn(
        'flex flex-col gap-4 bg-zinc-900 p-5',
        'md:flex-row md:items-center md:justify-between',
        disableActions && 'text-zinc-500',
      )}>
      <div>
        <p className="font-light">
          {t(flag.type, {
            name: flag.actor.name ?? tCommon('someone'),
          })}
        </p>
        {flag.reason && <p className="mt-1 text-xs font-light italic">{tReport(flag.reason)}</p>}
      </div>
      <div className="flex justify-end gap-2.5">
        <Button
          variant="ghost"
          size="small"
          disabled={disableActions}
          onClick={() => onViewContribution(flag)}>
          {tCommon('view')}
        </Button>
        <Button
          size="small"
          className={cn(!disableActions && 'bg-mauveine-400')}
          disabled={disableActions}
          onClick={() => {
            handleFlag(flag.id, MemorialFlagStatus.APPROVED);
          }}>
          {tCommon('approve')}
        </Button>
        <Button
          size="small"
          disabled={disableActions}
          onClick={() => {
            handleFlag(flag.id, MemorialFlagStatus.REJECTED);
          }}>
          {tCommon('reject')}
        </Button>
      </div>
    </div>
  );
}

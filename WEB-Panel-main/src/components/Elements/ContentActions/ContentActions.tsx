'use client';
import React, { useRef, useState } from 'react';
import Report from '@/assets/icons/report.svg';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
import { usePathname, useRouter } from '@/i18n/navigation';
import { nonbreakingText } from '@/utils/string';
import { useUserStore } from '@/store';
import DeleteContributionModal from '@/components/Memorial/DeleteContributionModal/DeleteContributionModal';

interface ContentActionsProps {
  contentType: 'memory' | 'condolence' | 'memorial' | 'donation';
  contentId: string;
  menuPosition?: 'top' | 'bottom';
  ownerId: string;
  memorialSlug: string;
  onDelete?: () => void;
}

function ContentActions({
  contentType,
  contentId,
  menuPosition = 'top',
  ownerId,
  memorialSlug,
  onDelete,
}: ContentActionsProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const path = usePathname();
  const { user } = useUserStore();

  const isOwner = user?.userId === ownerId;

  const handleBlur = (event: React.FocusEvent) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setMenuVisible(false);
    }
  };

  if (isOwner && contentType === 'memorial') {
    return <></>;
  }

  return (
    <div className="relative" ref={containerRef} onBlur={handleBlur}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuVisible((current) => !current);
        }}
        className="h-6 w-6 cursor-pointer">
        <Report />
      </button>
      {menuVisible && !isOwner && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/report/${contentId}?type=${contentType}&redirectTo=${encodeURIComponent(path)}`,
              );
              setMenuVisible(false);
            }}
            className={cn(
              'border-shine-1 hover:bg-mauveine-500 absolute right-0 z-99 cursor-pointer rounded-md bg-zinc-700 p-2.5 font-sans text-xs font-medium',
              menuPosition === 'top' && 'top-0 -translate-y-full',
              menuPosition === 'bottom' && 'top-full mt-2',
            )}>
            {nonbreakingText(tCommon('report'))}
          </button>
        </>
      )}
      {menuVisible && isOwner && (
        <div
          className={cn(
            'border-shine-1 absolute right-0 z-99 overflow-clip rounded-md bg-zinc-700 font-sans text-xs font-medium',
            menuPosition === 'top' && 'top-0 -translate-y-full',
            menuPosition === 'bottom' && 'top-full mt-2',
          )}>
          {contentType !== 'memorial' && (
            <button
              className="hover:bg-mauveine-500 w-full cursor-pointer p-2.5 text-left"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModalVisible(true);
                setMenuVisible(false);
              }}>
              {nonbreakingText(tCommon('delete'))}
            </button>
          )}
          {contentType !== 'donation' && (
            <button
              className="hover:bg-mauveine-500 w-full cursor-pointer p-2.5 text-left"
              onClick={(e) => {
                e.stopPropagation();
                if (contentType === 'memorial') {
                  router.push(`/memorial/edit/${contentId}`);
                } else if (contentType === 'memory') {
                  router.push(
                    `/memorial/contribute/${memorialSlug}/memory/edit/${contentId}/about`,
                  );
                } else if (contentType === 'condolence') {
                  router.push(
                    `/memorial/contribute/${memorialSlug}/condolence/edit/${contentId}/about`,
                  );
                }
                setMenuVisible(false);
              }}>
              {nonbreakingText(tCommon('edit'))}
            </button>
          )}
        </div>
      )}
      {contentType !== 'memorial' && deleteModalVisible && (
        <DeleteContributionModal
          onClose={() => setDeleteModalVisible(false)}
          type={contentType}
          memorialSlug={memorialSlug}
          contributionId={contentId}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

export default ContentActions;

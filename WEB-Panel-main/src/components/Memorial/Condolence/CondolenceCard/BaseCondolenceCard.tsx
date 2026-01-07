'use client';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import React from 'react';
import HeartEmpty from '@/assets/icons/heart-empty.svg';
import HeartFilled from '@/assets/icons/heart-filled.svg';
import Verified from '@/assets/icons/verified.svg';
import { formatRelativeTime } from '@/utils/date';
import { MemorialDecoration, PublishedMemorial } from '@/types/memorial';
import { getMemorialDecoration } from '@/utils/memorial';
import { useLocale, useTranslations } from 'next-intl';
import { useMemorialDecorationText } from '@/hooks/useMemorialDecorationText';
import ContentActions from '@/components/Elements/ContentActions/ContentActions';
import { ContributionAuthor } from '@/types/contribution';
import { Link } from '@/i18n/navigation';

interface BaseCondolenceCardProps {
  id?: string;
  date: Date;
  className?: string;
  isPreview?: boolean;
  author: ContributionAuthor;
  content: string;
  decoration?: MemorialDecoration;
  totalLikes: number;
  memorialSlug: string;
  isLikedByUser?: boolean;
  handleLike?: () => void;
  handleUnlike?: () => void;
  previewMode?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  showMemorialInfo?: boolean;
  memorial?: PublishedMemorial;
}

function BaseCondolenceCard({
  id,
  className,
  date,
  content,
  author,
  decoration = 'no-decoration',
  totalLikes,
  isLikedByUser,
  handleLike,
  handleUnlike,
  onClick,
  isPreview = false,
  memorialSlug,
  onDelete,
  showMemorialInfo = false,
  memorial,
}: BaseCondolenceCardProps) {
  const tCommon = useTranslations('Common');
  const getDecorationText = useMemorialDecorationText();
  const locale = useLocale();

  return (
    <div className={cn('relative', onClick && 'cursor-pointer', className)}>
      <div
        className={cn(
          'border-shine-1 bg-gradient-card-fill relative z-10 flex h-full flex-col justify-between rounded-lg p-3',
          showMemorialInfo && memorial && 'h-[calc(100%-var(--spacing)*12)]',
        )}
        onClick={onClick}>
        <div className="flex w-full flex-row gap-3.5">
          {decoration && decoration !== 'no-decoration' && (
            <div className="flex w-35 flex-shrink-0 items-center justify-center">
              <Image src={getMemorialDecoration(decoration)} alt={decoration} />
            </div>
          )}
          <div className="flex w-full flex-col justify-between gap-3">
            {content && <p className="w-full text-lg font-light">{content}</p>}
            {!content && (
              <span className="text-lg font-semibold italic">
                {tCommon('honoredTheirMemory', {
                  name: getDecorationText(decoration ?? ''),
                })}
              </span>
            )}
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-col gap-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-base">{author.name}</span>
                    {author.verified && (
                      <Verified className="text-mauveine-200 ml-1.5" width={16} height={16} />
                    )}
                  </div>

                  <span className="text-mauveine-200 text-sm font-light">
                    {formatRelativeTime(date ?? '', locale)}
                  </span>
                </div>
                {decoration !== 'no-decoration' && content && (
                  <span className="text-sm font-semibold italic">
                    {tCommon('honoredTheirMemory', {
                      name: getDecorationText(decoration ?? 'gerbera-daisy'),
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {!isPreview && (
          <div className="mt-5 flex w-full justify-between">
            <button
              className="flex cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (isLikedByUser) {
                  handleUnlike?.();
                } else {
                  handleLike?.();
                }
              }}>
              {isLikedByUser ? (
                <HeartFilled width={24} height={24} />
              ) : (
                <HeartEmpty width={24} height={24} />
              )}
              <span className="ml-1 font-sans text-base">{totalLikes}</span>
            </button>
            {id && (
              <ContentActions
                contentType="condolence"
                contentId={id}
                ownerId={author.id}
                memorialSlug={memorialSlug}
                onDelete={onDelete}
              />
            )}
          </div>
        )}
      </div>
      {showMemorialInfo && memorial && (
        <div className="relative h-12 w-full p-3">
          <div className="bg-gradient-ghost border-shine-1 absolute bottom-0 left-0 h-[calc(100%+var(--spacing)*4)] w-full rounded-b-xl" />
          <Link
            target="_blank"
            href={`/memorial/${memorial.slug}`}
            className="relative flex h-full w-full cursor-pointer items-center gap-3 font-serif text-sm text-white">
            <div className="relative aspect-square h-full shrink-0 overflow-clip rounded-full">
              <Image
                fill
                sizes="32px"
                src={memorial.imagePath}
                alt={memorial.name}
                className="aspect-square h-full object-cover"
              />
            </div>
            <p className="line-clamp-1">{memorial.name}</p>
          </Link>
        </div>
      )}
    </div>
  );
}

export default BaseCondolenceCard;

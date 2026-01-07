'use client';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import React from 'react';
import HeartEmpty from '@/assets/icons/heart-empty.svg';
import HeartFilled from '@/assets/icons/heart-filled.svg';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import { AssetType } from '@/types/asset';
import Verified from '@/assets/icons/verified.svg';
import Donation from '../Donation';
import { formatRelativeTime } from '@/utils/date';
import { MemorialDecoration, MemorialTribute, PublishedMemorial } from '@/types/memorial';
import { getMemorialDecoration } from '@/utils/memorial';
import ContentActions from '@/components/Elements/ContentActions/ContentActions';
import { ContributionAuthor } from '@/types/contribution';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface MemoryCardProps {
  id?: string;
  date?: string;
  className?: string;
  author: ContributionAuthor;
  content: string;
  tribute?: MemorialTribute;
  decoration?: MemorialDecoration;
  assetPath?: string;
  assetType?: AssetType;
  donationCount: number;
  totalLikes: number;
  isLikedByUser?: boolean;
  handleLike?: () => void;
  handleUnlike?: () => void;
  onDelete?: () => void;
  createdAt: string;
  previewMode?: boolean;
  onClick?: () => void;
  memorialSlug: string;
  showVideoControls?: boolean;
  showMemorialInfo?: boolean;
  memorial?: PublishedMemorial;
}

function BaseMemoryCard({
  className,
  date,
  content,
  tribute,
  author,
  decoration,
  assetPath,
  assetType,
  donationCount,
  totalLikes,
  isLikedByUser = false,
  handleLike,
  handleUnlike,
  id,
  createdAt,
  previewMode = false,
  onClick,
  memorialSlug,
  onDelete,
  showVideoControls = false,
  showMemorialInfo = false,
  memorial,
}: MemoryCardProps) {
  const getYear = (date: string) => new Date(date).getFullYear();
  const locale = useLocale();
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'border-shine-1 bg-gradient-card-fill relative z-10 flex w-full items-center justify-center overflow-hidden rounded-lg p-3',
          onClick && 'cursor-pointer',
        )}
        onClick={onClick}>
        <div className="flex w-full flex-col items-center justify-center gap-3.5">
          {assetPath && (
            <>
              <MemorialPortrait
                frame={'default'}
                tribute={tribute}
                imageUrl={assetPath}
                fileType={assetType}
                className="h-auto w-full"
                muted={!showVideoControls}
                autoplay={!showVideoControls}
                controls={showVideoControls}
                loop={!showVideoControls}
              />
              {donationCount > 0 && (
                <Donation count={donationCount ?? 0} size="sm" className="text-2xs" />
              )}
            </>
          )}
          {decoration && decoration !== 'no-decoration' && (
            <Image
              src={getMemorialDecoration(decoration)}
              alt={decoration}
              className="h-35 w-35"
              sizes="140px"
            />
          )}
          <span className="w-full text-2xl">{getYear(date ?? '')}</span>
          <p className="w-full text-base font-light">{content}</p>
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex items-center">
              <span className="font-serif text-base">{author.name}</span>
              {author.verified && (
                <Verified className="text-mauveine-200 ml-1.5" width={16} height={16} />
              )}
            </div>

            <span className="text-mauveine-200 text-sm font-light">
              {formatRelativeTime(createdAt, locale)}
            </span>
          </div>
          {decoration && donationCount !== undefined && donationCount > 0 && (
            <Donation count={donationCount ?? 0} className="text-2xs" />
          )}
          <div className="flex w-full justify-between">
            <button
              className="flex cursor-pointer items-center justify-center pr-1"
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
            {id && !previewMode && (
              <ContentActions
                contentType="memory"
                contentId={id}
                ownerId={author.id}
                memorialSlug={memorialSlug}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
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

export default BaseMemoryCard;

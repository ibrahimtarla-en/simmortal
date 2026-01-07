'use client';
import Button from '@/components/Elements/Button/Button';
import { MemorialDonationWreath } from '@/types/memorial';
import { formatRelativeTime } from '@/utils/date';
import { getDonationItemCountFromWreath, getWreathImage } from '@/utils/memorial';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import HeartEmpty from '@/assets/icons/heart-empty.svg';
import HeartFilled from '@/assets/icons/heart-filled.svg';
import ContentActions from '@/components/Elements/ContentActions/ContentActions';
import { useUserStore } from '@/store';
import { exists } from '@/utils/exists';
import { Link, useRouter } from '@/i18n/navigation';
import { likeDonation, unlikeDonation } from '@/services/server/donation';
import { Donation, isDonationWithMemorialInfo } from '@/types/donation';

interface DonatePromoteCardProps {
  onDonate: (wreath: MemorialDonationWreath) => void;
  price: string;
  disabled?: boolean;
  wreath: MemorialDonationWreath;
}

interface DonateDisplayCardProps {
  donation: Donation;
  onLike?: () => void;
  onUnlike?: () => void;
  onDelete?: () => void;
  previewMode?: boolean;
  onClick?: () => void;
  showMemorialInfo?: boolean;
}

type DonateCardProps = DonatePromoteCardProps | DonateDisplayCardProps;
function DonateCard(props: DonateCardProps) {
  const [isLiked, setIsLiked] = useState(
    isDisplayCard(props) ? props.donation?.isLikedByUser : false,
  );
  const [totalLikes, setTotalLikes] = useState(
    isDisplayCard(props) ? props.donation?.totalLikes : 0,
  );

  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const { user } = useUserStore();
  const router = useRouter();

  const handleLike = async () => {
    if (isPromoteCard(props)) return;
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(true);
    setTotalLikes((prev) => prev + 1);
    props.onLike?.();
    if (props.previewMode) return;
    await likeDonation(props.donation.memorialSlug, props.donation.id);
  };

  const handleUnlike = async () => {
    if (isPromoteCard(props)) return;
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(false);
    setTotalLikes((prev) => prev - 1);
    props.onUnlike?.();
    if (props.previewMode) return;
    await unlikeDonation(props.donation.memorialSlug, props.donation.id);
  };

  return (
    <div className="relative mx-auto w-full max-w-80">
      <div
        className="border-shine-1 bg-gradient-card-fill relative z-10 flex w-full flex-col gap-3.5 rounded-xl p-3"
        onClick={isDisplayCard(props) && props.onClick ? props.onClick : undefined}>
        <div className="relative aspect-square w-full">
          <Image
            fill
            src={
              isDisplayCard(props)
                ? getWreathImage(props.donation.wreath, locale)
                : getWreathImage(props.wreath, locale)
            }
            alt={isDisplayCard(props) ? props.donation.wreath : props.wreath}
            className="object-contain"
          />
        </div>
        {isPromoteCard(props) && (
          <>
            <div className="flex justify-between">
              <p className="font-serif">{`${getDonationItemCountFromWreath(props.wreath)} ${tCommon('saplings')}`}</p>
              <p className="text-sm font-medium">{props.price}</p>
            </div>
            <Button
              disabled={props.disabled}
              onClick={() => {
                props.onDonate(props.wreath);
              }}>
              {tCommon('donate')}
            </Button>
          </>
        )}
        {isDisplayCard(props) && (
          <>
            <div>
              <p className="font-serif">{props.donation.author.name}</p>
              <p className="text-mauveine-200 mt-1 text-xs">
                {formatRelativeTime(props.donation.createdAt, locale)}
              </p>
            </div>
            <div className="flex w-full justify-between">
              <button
                className="flex cursor-pointer items-center justify-center pr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLiked) {
                    handleUnlike();
                  } else {
                    handleLike();
                  }
                }}>
                {isLiked ? (
                  <HeartFilled width={24} height={24} />
                ) : (
                  <HeartEmpty width={24} height={24} />
                )}
                <span className="ml-1 font-sans text-base">{totalLikes}</span>
              </button>
              {props.donation.id && !props.previewMode && (
                <ContentActions
                  contentType="donation"
                  contentId={props.donation.id}
                  ownerId={props.donation.author.id}
                  memorialSlug={props.donation.memorialSlug}
                  onDelete={props.onDelete}
                />
              )}
            </div>
          </>
        )}
      </div>
      {isDisplayCard(props) &&
        props.showMemorialInfo &&
        isDonationWithMemorialInfo(props.donation) && (
          <div className="relative h-12 w-full p-3">
            <div className="bg-gradient-ghost border-shine-1 absolute bottom-0 left-0 h-[calc(100%+var(--spacing)*4)] w-full rounded-b-xl" />
            <Link
              target="_blank"
              href={`/memorial/${props.donation.memorial.slug}`}
              className="relative flex h-full w-full cursor-pointer items-center gap-3 font-serif text-sm text-white">
              <div className="relative aspect-square h-full shrink-0 overflow-clip rounded-full">
                <Image
                  fill
                  sizes="32px"
                  src={props.donation.memorial.imagePath}
                  alt={props.donation.memorial.name}
                  className="aspect-square h-full object-cover"
                />
              </div>
              <p className="line-clamp-1">{props.donation.memorial.name}</p>
            </Link>
          </div>
        )}
    </div>
  );
}

export default DonateCard;

function isPromoteCard(props: DonateCardProps): props is DonatePromoteCardProps {
  return (props as DonatePromoteCardProps).onDonate !== undefined;
}
function isDisplayCard(props: DonateCardProps): props is DonateDisplayCardProps {
  return (props as DonateDisplayCardProps).donation !== undefined;
}

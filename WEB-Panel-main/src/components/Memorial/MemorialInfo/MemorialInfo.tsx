'use client';
import { PublishedMemorial } from '@/types/memorial';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MemorialPortrait from '../MemorialPortrait/MemorialPortrait';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import MemorialStatsGrid from './MemorialStats';
import Button from '@/components/Elements/Button/Button';
import HeartFilled from '@/assets/icons/heart-filled.svg';
import HeartEmpty from '@/assets/icons/heart-empty.svg';
import Share from '@/assets/icons/share.svg';
import { nonbreakingText } from '@/utils/string';
import SimmTag from '@/components/Elements/SimmTag/SimmTag';
import { exists } from '@/utils/exists';
import { useLocale, useTranslations } from 'next-intl';
import { BlurOverlay } from '@/components';
import { useNavbarBanner } from '@/hooks/useNavbarBanner';
import { likeMemorial, unlikeMemorial } from '@/services/server/memorial';
import { useUserStore } from '@/store';
import { useRouter } from '@/i18n/navigation';
import Edit from '@/assets/icons/edit.svg';
import Close from '@/assets/icons/close.svg';
import Trash from '@/assets/icons/trash.svg';
import { UserAccountStatus } from '@/types/user';
import ContentActions from '@/components/Elements/ContentActions/ContentActions';
import { useToast } from '@/hooks/useToast';
import DeleteMemorialModal from './DeleteMemorialModal/DeleteMemorialModal';
import { AssetType } from '@/types/asset';
import { trackEvent } from '@/utils/analytics';
import MemorialCover from '../MemorialCover/MemorialCover';
import SoundOn from '@/assets/icons/sound-on.svg';
import SoundOff from '@/assets/icons/sound-off.svg';
import Locked from '@/assets/icons/locked.svg';
import Unlocked from '@/assets/icons/unlocked.svg';
import MemorialLocationModal from './MemorialLocationModal/MemorialLocationModal';
import { useBreakpoints } from '@/hooks';

type ViewMode = 'view' | 'edit' | 'preview';

interface MemorialInfoProps {
  memorial: PublishedMemorial;
  viewMode?: ViewMode;
  isPremium?: boolean;
  showPreviewBanner?: boolean;
  className?: string;
  showCover?: boolean;
}

function MemorialInfo({
  memorial,
  viewMode = 'view',
  showPreviewBanner = false,
  className,
  isPremium = false,
  showCover = false,
}: MemorialInfoProps) {
  const tCommon = useTranslations('Common');
  const { showBanner } = useNavbarBanner();
  const t = useTranslations('VisitMemorial.MemorialInfo');
  const router = useRouter();
  const locale = useLocale();
  const [isContributeActive, setIsContributeActive] = useState(false);
  const [deleteMemorialModalOpen, setDeleteMemorialModalOpen] = useState(false);
  const [memorialLocationModalOpen, setMemorialLocationModalOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [isLiked, setIsLiked] = useState(memorial.isLikedByUser);
  const { user } = useUserStore();
  const { toast } = useToast();
  const toastCooldown = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const didManuallyUnmute = useRef<boolean>(false);
  const { isBelow } = useBreakpoints();

  const hasSimmTag = useMemo(
    () =>
      (exists(memorial.simmTagDesign) &&
        memorial.simmTagDesign >= 0 &&
        exists(memorial.location)) ||
      viewMode === 'edit',
    [memorial.simmTagDesign, memorial.location, viewMode],
  );
  const isOwner = useMemo(() => {
    return exists(user) && user.userId === memorial.ownerId;
  }, [user, memorial.ownerId]);

  const hasMusic = useMemo(() => exists(memorial.music), [memorial.music]);

  const handleLike = useCallback(() => {
    if (isLiked) {
      unlikeMemorial(memorial.slug);
    } else {
      likeMemorial(memorial.slug);
    }
    setIsLiked((current) => !current);
  }, [isLiked, memorial.slug]);

  const handleShare = useCallback(async () => {
    trackEvent('memorialShareButtonClicked', {
      memorialSlug: memorial.slug,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: memorial.name,
          text: memorial.about,
          url: `${window.location.origin}/memorial/${memorial.slug}`,
        });

        trackEvent('memorialNativeShareSheetOpened');
      } else {
        // Fallback for browsers that do not support the Web Share API
        navigator.clipboard.writeText(`${window.location.origin}/memorial/${memorial.slug}`);

        trackEvent('memorialShareLinkCopiedToClipboard');

        if (toastCooldown.current) return;
        toastCooldown.current = true;
        setTimeout(() => {
          toastCooldown.current = false;
        }, 3000);
        toast({ title: t('linkCopied'), message: t('linkCopiedDetail') });
      }
    } catch {
      trackEvent('memorialShareCancelled');
    }
  }, [memorial.name, memorial.about, memorial.slug, t, toast]);

  useEffect(() => {
    if (showPreviewBanner) {
      showBanner({
        message: t('previewInfo'),
      });
    }
  }, [showBanner, showPreviewBanner, t]);

  return (
    <>
      {showCover && (
        <MemorialCover
          memorial={memorial}
          soundOn={soundOn}
          hasMusic={hasMusic}
          setSoundOn={(soundOn: boolean) => {
            audioRef.current?.play();
            didManuallyUnmute.current = true;
            setSoundOn(soundOn);
          }}
        />
      )}
      <section
        className={cn('container my-10 flex w-full flex-col gap-8', className)}
        id="memorial-info">
        {viewMode === 'view' && (
          <div className="flex flex-wrap items-center justify-end gap-4">
            <ContentActions
              contentType="memorial"
              contentId={memorial.id}
              menuPosition="bottom"
              ownerId={memorial.ownerId}
              memorialSlug={memorial.slug}
            />
            {isOwner && (
              <Button icon={<Edit />} role="link" href={`/memorial/edit/${memorial.id}`} />
            )}
            <Button icon={<Share />} onClick={handleShare} />
            {exists(user) && user.status === UserAccountStatus.ACTIVE && (
              <Button icon={isLiked ? <HeartFilled /> : <HeartEmpty />} onClick={handleLike} />
            )}
            {hasMusic && (
              <Button
                icon={soundOn ? <SoundOn /> : <SoundOff />}
                onClick={() => setSoundOn((prev) => !prev)}
              />
            )}
            <div className="relative" style={{ zIndex: isContributeActive ? 99999999999 : 'auto' }}>
              <Button
                onClick={() => {
                  setIsContributeActive((t) => !t);
                }}>
                {tCommon('contribute')}
              </Button>
              {isContributeActive && (
                <div className="absolute right-0 mt-2.5 flex flex-col gap-2.5">
                  <Button
                    onClick={() => {
                      router.push(`/memorial/contribute/${memorial.slug}/memory/create`);
                    }}
                    className="w-43.5">
                    {t('addMemory')}
                  </Button>
                  <Button
                    className="w-43.5"
                    onClick={() => {
                      router.push(`/memorial/contribute/${memorial.slug}/condolence/create`);
                    }}>
                    {t('addCondolence')}
                  </Button>
                  <Button
                    className="w-43.5"
                    onClick={() => {
                      router.push(`/memorial/contribute/${memorial.slug}/donate`);
                    }}>
                    {t('addWreath')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        {viewMode === 'edit' && (
          <div
            className={cn(
              'flex w-full flex-col items-center justify-between gap-5 text-zinc-400',
              'xl:flex-row-reverse xl:items-start',
            )}>
            <div className="flex grow justify-end gap-4">
              <Button
                icon={<Trash />}
                onClick={() => {
                  setDeleteMemorialModalOpen(true);
                }}>
                {nonbreakingText(t('Edit.deleteMemorial'))}
              </Button>
              <Button icon={<Close />} role="link" href={`/memorial/${memorial.slug}`} />
            </div>
            <div className="flex w-full flex-col gap-5">
              <div
                className={cn(
                  'flex flex-col justify-center gap-5',
                  'md:flex-row',
                  'xl:justify-start',
                )}>
                <div className={cn('flex max-w-full justify-center gap-3')}>
                  <div
                    style={{ direction: 'rtl' }}
                    className={cn(
                      'my-auto line-clamp-1 max-w-full shrink-1 rounded-full bg-zinc-900 p-3 text-xs text-ellipsis',
                      'md:text-sm',
                    )}>
                    https://simmortals.com/memorial/
                    <span className="text-white">{memorial.slug}</span>
                  </div>
                  <Button
                    showPremiumTag={!isPremium}
                    role="link"
                    href={
                      isPremium
                        ? `/memorial/edit/${memorial.id}/url`
                        : `/memorial/edit/${memorial.id}/checkout`
                    }
                    onClick={() =>
                      trackEvent('memorialEditUrlButtonClicked', {
                        isUserPremium: isPremium,
                      })
                    }>
                    {t('Edit.editUrl')}
                  </Button>
                </div>
                <div className={cn('order-1 flex items-center justify-center', 'md:order-0')}>
                  <Button
                    role="link"
                    showPremiumTag={!isPremium}
                    href={
                      isPremium
                        ? `/memorial/edit/${memorial.id}/music`
                        : `/memorial/edit/${memorial.id}/checkout`
                    }
                    onClick={() =>
                      trackEvent('memorialEditMusicButtonClicked', {
                        isUserPremium: isPremium,
                      })
                    }>
                    {t('Edit.editMusic')}
                  </Button>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center justify-center gap-3',
                  'md:gap-5',
                  'xl:justify-start',
                )}>
                <div className={cn('flex items-center gap-1 text-xs text-white', 'md:text-sm')}>
                  {memorial.isUnlisted ? (
                    <Locked width={28} height={28} className="h-7 w-7 shrink-0" />
                  ) : (
                    <Unlocked width={28} height={28} className="h-7 w-7 shrink-0" />
                  )}
                  <p>{memorial.isUnlisted ? t('Edit.unlistedInfo') : t('Edit.publicInfo')}</p>
                </div>
                <Button
                  showPremiumTag={!isPremium}
                  role="link"
                  href={
                    isPremium
                      ? `/memorial/edit/${memorial.id}/url`
                      : `/memorial/edit/${memorial.id}/checkout`
                  }
                  onClick={() =>
                    trackEvent('memorialEditVisibilityButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editVisibility')}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div
          className={cn(
            'grid w-full grid-cols-1 items-center justify-center gap-5',
            'md:grid-cols-[auto_1fr] md:justify-start md:gap-y-10',
            'xl:grid-rows-[auto_1fr] xl:items-end xl:gap-y-6',
          )}>
          <div
            className={cn('relative mx-auto h-full w-68', 'xl:row-start-1 xl:row-end-4 xl:w-110')}>
            <MemorialPortrait
              fileType={
                memorial.livePortraitPath && viewMode !== 'edit' ? AssetType.VIDEO : AssetType.IMAGE
              }
              frame={memorial.frame}
              tribute={memorial.tribute}
              imageUrl={
                viewMode === 'edit'
                  ? memorial.imagePath
                  : memorial.livePortraitPath || memorial.imagePath
              }
              sizes="(max-width: 1440px) 17rem, 27.5rem"
              priority
              autoplay
              loop
              muted
              posterUrl={memorial.imagePath}
            />
            {viewMode === 'edit' && (
              <div
                className={cn(
                  'bg-mauveine-900/50 absolute -inset-2 z-99 flex max-h-75 flex-col items-center justify-between rounded-2xl p-2',
                  'xl:max-h-112',
                )}>
                <Button
                  showPremiumTag={!isPremium}
                  role="link"
                  href={
                    isPremium
                      ? `/memorial/edit/${memorial.id}/frame`
                      : `/memorial/edit/${memorial.id}/checkout`
                  }
                  size={isBelow('xl') ? 'small' : 'default'}
                  onClick={() =>
                    trackEvent('memorialEditFrameButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editFrame')}
                </Button>
                <Button
                  role="link"
                  href={`/memorial/edit/${memorial.id}/identity`}
                  size={isBelow('xl') ? 'small' : 'default'}
                  onClick={() =>
                    trackEvent('memorialEditImageButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editImage')}
                </Button>
                <Button
                  showPremiumTag={!isPremium}
                  role="link"
                  href={
                    isPremium
                      ? `/memorial/edit/${memorial.id}/live-portrait`
                      : `/memorial/edit/${memorial.id}/checkout`
                  }
                  size={isBelow('xl') ? 'small' : 'default'}
                  onClick={() =>
                    trackEvent('memorialEditLivePortraitButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editLivePortrait')}
                </Button>
                <Button
                  role="link"
                  href={`/memorial/edit/${memorial.id}/cover`}
                  size={isBelow('xl') ? 'small' : 'default'}
                  onClick={() =>
                    trackEvent('memorialEditCoverImageButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editCoverImage')}
                </Button>
                <Button
                  showPremiumTag={!isPremium}
                  role="link"
                  size={isBelow('xl') ? 'small' : 'default'}
                  href={
                    isPremium
                      ? `/memorial/edit/${memorial.id}/tribute`
                      : `/memorial/edit/${memorial.id}/checkout`
                  }
                  onClick={() =>
                    trackEvent('memorialEditTributeButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editTribute')}
                </Button>
              </div>
            )}
          </div>
          <div className={cn('flex justify-center', 'md:block')}>
            <div className={cn('grid grid-cols-[1fr_auto] gap-10', 'md:gap-y-10', 'xl:gap-y-6')}>
              <div
                className={cn(
                  'relative flex flex-col gap-5',
                  'md:gap-6 md:py-4',
                  'xl:pt-5.5 xl:pb-0',
                )}>
                {viewMode === 'edit' && (
                  <div className="bg-mauveine-900/50 absolute -inset-2 z-99 flex items-center justify-center rounded-2xl">
                    <Button
                      role="link"
                      href={`/memorial/edit/${memorial.id}/identity`}
                      onClick={() =>
                        trackEvent('memorialEditIdentityButtonClicked', {
                          isUserPremium: isPremium,
                        })
                      }>
                      {t('Edit.editIdentity')}
                    </Button>
                  </div>
                )}
                <p
                  className={cn(
                    'font-serif text-4xl font-medium',
                    !hasSimmTag && 'text-center',
                    'md:text-left',
                  )}>
                  {memorial.name}
                </p>
                <div
                  className={cn(
                    'flex gap-12',
                    !hasSimmTag && 'justify-center',
                    'md:justify-between',
                  )}>
                  <div>
                    <div
                      className={cn(
                        'grid max-w-38 grid-cols-1 gap-6',
                        !hasSimmTag && 'mx-auto max-w-87 grid-cols-[1fr_minmax(auto,6rem)_1fr]',
                        'md:mx-0 md:py-4',
                        'lg:max-w-87 lg:grid-cols-[1fr_minmax(auto,6rem)_1fr]',
                      )}>
                      <div>
                        <p className="text-2xs font-light uppercase">{tCommon('born')}</p>
                        <p className="font-serif text-2xl">
                          {nonbreakingText(
                            formatDate(memorial.dateOfBirth, 'DD MMM, YYYY', locale),
                          )}
                        </p>
                        <p className="text-2xs font-sans font-light">{memorial.placeOfBirth}</p>
                      </div>
                      <hr className={cn('my-auto grow')} />
                      <div>
                        <p className="text-2xs font-light uppercase">{tCommon('died')}</p>
                        <p className="font-serif text-2xl">
                          {nonbreakingText(
                            formatDate(memorial.dateOfDeath, 'DD MMM, YYYY', locale),
                          )}
                        </p>
                        <p className="text-2xs font-sans font-light">{memorial.placeOfDeath}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-end">
                {hasSimmTag && memorial.simmTagDesign && (
                  <div className="relative">
                    <SimmTag
                      design={memorial.simmTagDesign}
                      location={memorial.location}
                      mapPinName={memorial.name}
                    />
                    {viewMode === 'edit' && (
                      <div className="bg-mauveine-900/50 absolute -inset-2 z-99 flex flex-col items-center justify-between rounded-2xl p-4">
                        <Button
                          showPremiumTag={!isPremium}
                          size="small"
                          role="link"
                          href="/shop"
                          target="_blank"
                          className="h-10">
                          {t('Edit.buyPhysicalSimmTag')}
                        </Button>
                        <Button
                          showPremiumTag={!isPremium}
                          size="small"
                          role="link"
                          className="h-10"
                          href={
                            isPremium
                              ? `/memorial/edit/${memorial.id}/simmtag`
                              : `/memorial/edit/${memorial.id}/checkout`
                          }>
                          {t('Edit.editSimmTag')}
                        </Button>
                        <Button
                          showPremiumTag={!isPremium}
                          size="small"
                          onClick={() => {
                            setMemorialLocationModalOpen(true);
                          }}
                          className="h-10">
                          {t('Edit.editLocation')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {!exists(memorial.simmTagDesign) && viewMode === 'edit' && (
                  <div className="relative">
                    <SimmTag />
                    {viewMode === 'edit' && (
                      <div className="bg-mauveine-900/50 absolute -inset-2 z-99 flex flex-col items-center justify-end rounded-2xl p-4 pb-[20%]">
                        <div />
                        <Button
                          showPremiumTag={!isPremium}
                          size="small"
                          role="link"
                          className="h-10"
                          href={
                            isPremium
                              ? `/memorial/edit/${memorial.id}/simmtag`
                              : `/memorial/edit/${memorial.id}/checkout`
                          }
                          onClick={() =>
                            trackEvent('memorialAddSimmTagButtonClicked', {
                              isUserPremium: isPremium,
                            })
                          }>
                          {t('Edit.addSimmTag')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <p
                  className={cn(
                    'relative row-start-2 hidden font-light whitespace-pre-line',
                    '2xl:block',
                  )}>
                  {memorial.about}
                </p>
                {viewMode === 'edit' && (
                  <div
                    className={cn(
                      'bg-mauveine-900/50 absolute -inset-2 z-99 hidden items-center justify-center rounded-2xl',
                      '2xl:flex',
                    )}>
                    <Button
                      role="link"
                      href={`/memorial/edit/${memorial.id}/about`}
                      onClick={() =>
                        trackEvent('memorialEditAboutButtonClicked', {
                          isUserPremium: isPremium,
                        })
                      }>
                      {t('Edit.editAbout')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={cn('relative row-start-3', 'md:col-span-2 md:row-start-auto')}>
            <p className={cn('font-light', 'md:col-span-2 md:row-start-auto', '2xl:hidden')}>
              {memorial.about}
            </p>
            {viewMode === 'edit' && (
              <div
                className={cn(
                  'bg-mauveine-900/50 absolute -inset-2 z-99 flex items-center justify-center rounded-2xl',
                  '2xl:hidden',
                )}>
                <Button
                  role="link"
                  href={`/memorial/edit/${memorial.id}/about`}
                  onClick={() =>
                    trackEvent('memorialEditAboutButtonClicked', {
                      isUserPremium: isPremium,
                    })
                  }>
                  {t('Edit.editAbout')}
                </Button>
              </div>
            )}
          </div>

          <MemorialStatsGrid
            memorial={memorial}
            className={cn('md:col-span-2', 'xl:pb-5.5')}
            allowTopContributorsModal={viewMode !== 'edit'}
          />
        </div>
        <BlurOverlay
          isActive={isContributeActive}
          onClose={() => {
            setIsContributeActive((t) => !t);
          }}
        />

        {viewMode === 'edit' && (
          <>
            <MemorialLocationModal
              open={memorialLocationModalOpen}
              memorialId={memorial.id}
              onClose={() => setMemorialLocationModalOpen(false)}
            />
            <DeleteMemorialModal
              open={deleteMemorialModalOpen}
              memorialId={memorial.id}
              onClose={() => setDeleteMemorialModalOpen(false)}
            />
          </>
        )}

        {hasMusic && viewMode !== 'edit' && (
          <audio ref={audioRef} loop muted={!soundOn} id="memorial-audio-player">
            <source src={`/music/${memorial.music}.mp3`} type="audio/mpeg" />
          </audio>
        )}
      </section>
    </>
  );
}

export default MemorialInfo;

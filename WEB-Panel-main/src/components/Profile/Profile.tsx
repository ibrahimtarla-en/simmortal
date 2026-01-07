'use client';
import { useUserStore } from '@/store';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import Button from '../Elements/Button/Button';
import ProfileTabs from './ProfileTabs/ProfileTabs';
import { getDashboardUrl } from '@/services/server/user';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useToast } from '@/hooks/useToast';

function Profile() {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Profile');
  const tError = useTranslations('Error');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();
  const { user } = useUserStore();
  const router = useRouter();
  const avatarString = useMemo(() => {
    const firstNameInitial = user?.firstName?.toUpperCase()[0];
    const lastNameInitial = user?.lastName?.toUpperCase()[0];
    if (!firstNameInitial && !lastNameInitial) return 'U'; // Return U for User
    return `${firstNameInitial}${lastNameInitial}`;
  }, [user]);

  const onDashboardClick = async () => {
    showLoading();
    try {
      const { url } = await getDashboardUrl();
      router.push(url);
    } catch {
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <h1 className="my-5 font-serif text-2xl font-medium">{tCommon('profile')}</h1>
      <section className={cn('rounded-lg bg-zinc-900 p-4', '2xl:rounded-2xl 2xl:p-6')}>
        <div className={cn('mb-10 flex flex-col gap-5', 'md:flex-row md:justify-between')}>
          <div className="flex gap-5">
            <div className="flex h-37 w-37 items-center justify-center rounded-sm bg-zinc-700 p-1">
              <div className="relative flex h-full w-full items-center justify-center bg-black">
                {user?.profilePictureUrl ? (
                  <Image
                    fill
                    src={user.profilePictureUrl}
                    alt="Profile Picture"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold">{avatarString}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-3xl">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
          <div className={cn('flex grow justify-between', 'md:grow-0 md:flex-col')}>
            <Button disabled={isLoading} role="link" href="/profile/edit">
              {t('editProfile')}
            </Button>
            <div
              className={cn(
                'text-mauveine-300 flex cursor-pointer flex-col items-end justify-end text-sm font-medium',
                '[&>button]:block [&>button]:cursor-pointer [&>button]:underline',
              )}>
              <button onClick={onDashboardClick} disabled={isLoading}>
                {t('invoices')}
              </button>
              <button onClick={onDashboardClick} disabled={isLoading}>
                {t('manageSubscriptions')}
              </button>
            </div>
          </div>
        </div>
        <ProfileTabs />
      </section>
    </div>
  );
}

export default Profile;

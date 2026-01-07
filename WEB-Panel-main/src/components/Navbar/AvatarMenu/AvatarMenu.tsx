'use client';
import React, { useCallback, useRef, useState } from 'react';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import { useRouter } from '@/i18n/navigation';
import Avatar from '../Avatar/Avatar';
import Logout from '@/assets/icons/logout.svg';
import Profile from '@/assets/icons/profile.svg';
import { useUserStore } from '@/store';
import { exists } from '@/utils/exists';
import { logout } from '@/services/server/auth/supertokens';
import { useTranslations } from 'next-intl';
import { nonbreakingText } from '@/utils/string';

function AvatarMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const tCommon = useTranslations('Common');
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (event: React.FocusEvent) => {
    // Check if the new focus target is still within our component
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setIsVisible(false);
    }
  };

  const handleLogout = useCallback(() => {
    setIsVisible(false);
    logout().then(() => {
      setUser(null);
      router.push('/');
    });
  }, [router, setUser]);

  if (!exists(user)) {
    return null;
  }
  return (
    <div
      className="relative"
      ref={containerRef}
      onFocus={() => setIsVisible(true)}
      onBlur={handleBlur}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}>
      <div
        tabIndex={0}
        className="flex cursor-pointer items-center justify-center gap-2"
        onFocus={() => setIsVisible(true)}>
        <Avatar user={user} />
        <ArrowDown width={20} height={20} />
      </div>
      {isVisible && (
        <div className="absolute top-full -right-2.5 min-w-45 p-2.5">
          <div className="border-shine-1 flex flex-col gap-4 rounded-lg bg-zinc-950 p-2.5 text-sm">
            <button
              className="flex cursor-pointer items-center gap-2.5 hover:underline"
              onClick={() => {
                router.push('/profile');
                setIsVisible(false);
              }}>
              <Profile height={24} width={24} />
              {nonbreakingText(tCommon('profile'))}
            </button>
            <button
              className="flex cursor-pointer items-center gap-2.5 hover:underline"
              onClick={handleLogout}>
              <Logout height={24} width={24} />
              {nonbreakingText(tCommon('logout'))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarMenu;

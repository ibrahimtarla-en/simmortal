'use client';
import { cn } from '@/utils/cn';
import Logo from '@/assets/brand/logo.colored.svg';
import HamburgerMenu from '@/assets/icons/hamburger-menu.svg';
import CloseMenu from '@/assets/icons/close.svg';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../Elements/Button/Button';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/store';
import { exists } from '@/utils/exists';
import { logout } from '@/services/server/auth/supertokens';
import { Nullable } from '@/types/util';
import { usePathname } from 'next/navigation';
import { SimmortalsUser } from '@/types/user';
import Avatar from './Avatar/Avatar';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useBreakpoints } from '@/hooks';
import LocaleSwitch from './LocaleSwitch/LocaleSwitch';
import AvatarMenu from './AvatarMenu/AvatarMenu';
import NotificationMenu from './NotificationMenu/NotificationMenu';
import Search from '@/assets/icons/search.svg';
import SearchMemorial, { SearchMemorialRef } from '../Memorial/SearchMemorial/SearchMemorial';
import { useLenis } from 'lenis/react';
interface NavbarClientProps {
  initialUser: Nullable<SimmortalsUser>;
}

function NavbarClient({ initialUser }: NavbarClientProps) {
  const tCommon = useTranslations('Common');
  const pathname = usePathname();
  const { breakpoint, isAbove } = useBreakpoints();
  const searchRef = useRef<SearchMemorialRef>(null);
  const isSearchFocused = useMotionValue(false);
  const router = useRouter();
  const {
    setInitialUser,
    user: storeUser,
    initialUserLoaded,
    setUser,
    refreshUser,
  } = useUserStore();
  const user = useMemo(
    () => (initialUserLoaded ? storeUser : initialUser),
    [initialUser, initialUserLoaded, storeUser],
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const searchWidth = useTransform(isSearchFocused, (v) => (v ? 400 : 0));
  const searchOpacity = useTransform(isSearchFocused, (v) => (v ? 1 : 0));

  const handleLogout = useCallback(() => {
    logout().then(() => {
      setUser(null);
      router.push('/');
      setMobileMenuOpen(false);
    });
  }, [router, setUser]);

  useEffect(() => {
    if (isAbove('xl')) {
      setMobileMenuOpen(false);
    }
  }, [isAbove, breakpoint]);

  useEffect(() => {
    setInitialUser(initialUser);
  }, [setInitialUser, initialUser]);

  useEffect(() => {
    setMobileMenuOpen(false);
    refreshUser();
  }, [pathname, refreshUser]);

  // Reset search when route changes
  useEffect(() => {}, [pathname]); // Triggers whenever the route changes

  return (
    <nav className="sticky top-0 z-9999999 h-18 w-full bg-zinc-900">
      <div className={cn('relative z-9999999 flex h-full w-full items-center bg-zinc-900')}>
        <div className="container flex items-center justify-between">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Logo className="h-6.25" />
          </Link>
          {/* Mobile Menu */}
          <div className="flex xl:hidden">
            {!mobileMenuOpen && exists(user) && <NotificationMenu />}
            <Button
              icon={mobileMenuOpen ? <CloseMenu /> : <HamburgerMenu />}
              variant="ghost"
              className="p-2.5"
              onClick={() => setMobileMenuOpen((current) => !current)}
            />
          </div>
          {/* Desktop Menu */}
          <div className="relative hidden items-center gap-8 font-light xl:flex">
            {!searchActive && (
              <>
                <Link href="/memorial" className="underline-offset-4 hover:underline">
                  {tCommon('memorials')}
                </Link>
                <Link href="/shop" className="underline-offset-4 hover:underline">
                  {tCommon('shop')}
                </Link>
              </>
            )}

            {!exists(user) && !searchActive && (
              <>
                <Button role="link" href="/signup">
                  {tCommon('signUp')}
                </Button>
                <Button role="link" variant="outline" href="/login">
                  {tCommon('login')}
                </Button>
              </>
            )}
            {exists(user) && (
              <>
                {!searchActive && (
                  <>
                    <Link href="/my-pages" className="underline-offset-4 hover:underline">
                      {tCommon('myPages')}
                    </Link>
                    <Button role="link" href="/memorial/create">
                      {tCommon('createMemorial')}
                    </Button>
                  </>
                )}
                {!searchActive && <div className="h-7 w-0.25 bg-zinc-500" />}

                <div className="order-2">
                  <NotificationMenu />
                </div>
                <div className="order-3">
                  <AvatarMenu />
                </div>
              </>
            )}
            <div className="order-1 flex">
              <motion.div
                className={cn('transition-all')}
                initial={{ width: 0, opacity: 0 }}
                style={{ width: searchWidth, opacity: searchOpacity }}>
                <SearchMemorial
                  ref={searchRef}
                  value={searchValue}
                  onTextChange={setSearchValue}
                  hideIcon
                  onResultClicked={(memorial) => {
                    router.push(`/memorial/${memorial.slug}`);
                    searchRef.current?.blur();
                  }}
                  onFocus={() => {
                    setSearchActive(true);
                    isSearchFocused.set(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(
                        `/memorial/search-results?query=${encodeURIComponent(searchValue)}`,
                      );
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchActive(false);
                      setSearchValue('');
                      isSearchFocused.set(false);
                    }, 100);
                  }}
                />
              </motion.div>
              <button
                className="relative aspect-square h-11 cursor-pointer p-2"
                tabIndex={-1}
                onClick={() => {
                  if (!searchActive) {
                    searchRef.current?.focus();
                  } else {
                    router.push(
                      `/memorial/search-results?query=${encodeURIComponent(searchValue)}`,
                    );
                  }
                }}>
                <Search />
              </button>
            </div>
            <div className="order-last">
              <LocaleSwitch />
            </div>
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={mobileMenuOpen}
        user={user}
        onLogout={handleLogout}
        closeMenu={() => setMobileMenuOpen(false)}
      />
    </nav>
  );
}

export default NavbarClient;

interface MobileMenuProps {
  isOpen: boolean;
  user: Nullable<SimmortalsUser>;
  onLogout: () => void;
  closeMenu: () => void;
}

function MobileMenu({ isOpen, user, onLogout, closeMenu }: MobileMenuProps) {
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const lenis = useLenis();
  const [searchValue, setSearchValue] = useState('');
  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
    } else {
      setSearchValue('');
      lenis?.start();
    }
    // Cleanup function
    return () => {
      lenis?.start();
    };
  }, [isOpen, lenis]);

  return (
    <motion.div
      initial={{ translateY: '-101%' }}
      animate={{ translateY: isOpen ? '0%' : '-101%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute top-0 left-0 z-8888888 flex h-screen w-full bg-zinc-900 pt-18 xl:hidden">
      <div className="flex h-[calc(100svh-4.5rem)] w-full flex-col justify-between overflow-y-auto px-8 py-12">
        <div className="flex shrink-0 grow-0 flex-col gap-10">
          <div className="relative z-9999">
            <SearchMemorial
              value={searchValue}
              onTextChange={setSearchValue}
              hideIcon
              onResultClicked={(memorial) => {
                closeMenu();
                router.push(`/memorial/${memorial.slug}`);
              }}
            />
          </div>
          {exists(user) && (
            <>
              <div className="flex flex-col items-start gap-10">
                <div className="flex items-center gap-5.5">
                  <Avatar user={user} />
                  {`${user.firstName} ${user.lastName}`}
                </div>
                <Link href={'/profile'}>{tCommon('profile')}</Link>
              </div>

              <hr className="w-full border-zinc-500" />
            </>
          )}
          {exists(user) && <Link href="/my-pages">{tCommon('myPages')}</Link>}
          <Link href="/memorial">{tCommon('memorials')}</Link>
          <Link href="/shop">{tCommon('shop')}</Link>
        </div>
        <div className="mt-10 flex shrink-0 grow-0">
          <div className="flex shrink-0 grow-0 flex-col gap-9">
            <LocaleSwitch reverse onLocaleChange={() => closeMenu()} />
            {!exists(user) && (
              <>
                <Button
                  onClick={() => {
                    router.push('/signup');
                    closeMenu();
                  }}>
                  {tCommon('signUp')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push('/login');
                    closeMenu();
                  }}>
                  {tCommon('login')}
                </Button>
              </>
            )}
            {exists(user) && (
              <div className="flex flex-col gap-8">
                <Button role="link" href="/memorial/create">
                  {tCommon('createMemorial')}
                </Button>
                <Button variant="outline" onClick={onLogout}>
                  {tCommon('logout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

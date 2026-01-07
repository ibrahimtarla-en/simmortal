'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '../Elements/Button/Button';
import Switch from '../Elements/Switch/Switch';
import { Link } from '@/i18n/navigation';
import Close from '@/assets/icons/close.svg';
import { nonbreakingText } from '@/utils/string';
import {
  CookieKey,
  getCookie,
  setCookie,
  dispatchCookieConsentEvent,
  OPEN_COOKIE_SETTINGS_EVENT,
} from '@/utils/cookie';

function CookieBanner() {
  const t = useTranslations('CookieBanner');
  const [showSettings, setShowSettings] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOnly, setIsSettingsOnly] = useState(false);

  useEffect(() => {
    const bannerShown = getCookie(CookieKey.COOKIE_BANNER_SHOWN);
    if (bannerShown === null) {
      setIsVisible(true);
    }

    // Listen for open settings event
    const handleOpenSettings = () => {
      const currentMarketingValue = getCookie(CookieKey.MARKETING_COOKIES_ALLOWED);
      setMarketingCookies(currentMarketingValue === true);
      setShowSettings(true);
      setIsSettingsOnly(true);
      setIsVisible(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  const handleAllowAll = () => {
    setCookie(CookieKey.COOKIE_BANNER_SHOWN, true);
    setCookie(CookieKey.MARKETING_COOKIES_ALLOWED, true);
    dispatchCookieConsentEvent(true);
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    setCookie(CookieKey.COOKIE_BANNER_SHOWN, true);
    setCookie(CookieKey.MARKETING_COOKIES_ALLOWED, false);
    dispatchCookieConsentEvent(false);
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    setCookie(CookieKey.COOKIE_BANNER_SHOWN, true);
    setCookie(CookieKey.MARKETING_COOKIES_ALLOWED, marketingCookies);
    dispatchCookieConsentEvent(marketingCookies);
    setIsVisible(false);
    setIsSettingsOnly(false);
  };

  const handleClose = () => {
    if (isSettingsOnly) {
      setIsVisible(false);
      setIsSettingsOnly(false);
    } else {
      setShowSettings(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-9999999 p-4">
      <div className="container">
        <div className="border-shine-1 rounded-2xl bg-zinc-900 p-6">
          {!showSettings ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-zinc-400">
                  {t('description')}{' '}
                  <Link
                    href={`/legal/cookie-policy.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mauveine-400 underline">
                    {nonbreakingText(t('cookiePolicy'))}
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="ghost" onClick={() => setShowSettings(true)}>
                  {nonbreakingText(t('cookieSettings'))}
                </Button>
                <Button variant="outline" onClick={handleEssentialOnly}>
                  {nonbreakingText(t('essentialOnly'))}
                </Button>
                <Button variant="outline" onClick={handleAllowAll}>
                  {nonbreakingText(t('allowAll'))}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('settingsTitle')}</h3>
                <button
                  onClick={handleClose}
                  className="cursor-pointer p-1 text-zinc-400 hover:text-white">
                  <Close className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{t('essentialCookies')}</span>
                    <span className="text-xs text-zinc-400">
                      {t('essentialCookiesDescription')}
                    </span>
                  </div>
                  <Switch checked disabled showLockIcon />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{t('marketingCookies')}</span>
                    <span className="text-xs text-zinc-400">
                      {t('marketingCookiesDescription')}
                    </span>
                  </div>
                  <Switch
                    checked={marketingCookies}
                    onCheckedChange={(checked) => setMarketingCookies(checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/legal/cookie-policy.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mauveine-400 text-sm underline">
                  {t('cookiePolicy')}
                </Link>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleSaveSettings}>{t('saveSettings')}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;

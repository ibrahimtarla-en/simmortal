'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import {
  CookieKey,
  getCookie,
  COOKIE_CONSENT_EVENT,
  CookieConsentEventDetail,
} from '@/utils/cookie';

interface ConditionalAnalyticsProps {
  gaId: string;
}

function deleteGACookies() {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('_ga')) {
      // Delete cookie for current domain and all parent domains
      const domain = window.location.hostname;
      const domainParts = domain.split('.');

      for (let i = 0; i < domainParts.length; i++) {
        const cookieDomain = domainParts.slice(i).join('.');
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${cookieDomain}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${cookieDomain}`;
      }
      // Also try without domain
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  }
}

function ConditionalAnalytics({ gaId }: ConditionalAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const bannerShown = getCookie(CookieKey.COOKIE_BANNER_SHOWN);
    const marketingAllowed = getCookie(CookieKey.MARKETING_COOKIES_ALLOWED);
    const initialConsent = bannerShown === true && marketingAllowed === true;
    setHasConsent(initialConsent);

    // If no consent on initial load, delete any existing GA cookies
    if (!initialConsent && bannerShown === true) {
      deleteGACookies();
    }

    // Listen for consent changes
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentEventDetail>;
      const newConsent = customEvent.detail.marketingAllowed;
      setHasConsent(newConsent);

      if (!newConsent) {
        deleteGACookies();
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  if (!hasConsent) return null;

  return <GoogleAnalytics gaId={gaId} />;
}

export default ConditionalAnalytics;

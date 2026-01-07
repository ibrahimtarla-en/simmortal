'use client';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import {
  CookieKey,
  getCookie,
  COOKIE_CONSENT_EVENT,
  CookieConsentEventDetail,
} from '@/utils/cookie';

function deleteMetaPixelCookies() {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const cookieName = cookie.split('=')[0].trim();
    // Delete Meta Pixel cookies (_fbp, _fbc, and any other fb-related cookies)
    if (cookieName.startsWith('_fb')) {
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

  // Clear fbq object if it exists
  if (typeof window !== 'undefined') {
    const win = window as Window & { fbq?: unknown; _fbq?: unknown };
    if (win.fbq) {
      delete win.fbq;
      delete win._fbq;
    }
  }
}

function MetaPixelProvider() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const bannerShown = getCookie(CookieKey.COOKIE_BANNER_SHOWN);
    const marketingAllowed = getCookie(CookieKey.MARKETING_COOKIES_ALLOWED);
    const initialConsent = bannerShown === true && marketingAllowed === true;
    setHasConsent(initialConsent);

    // If no consent on initial load, delete any existing Meta Pixel cookies
    if (!initialConsent && bannerShown === true) {
      deleteMetaPixelCookies();
    }

    // Listen for consent changes
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentEventDetail>;
      const newConsent = customEvent.detail.marketingAllowed;
      setHasConsent(newConsent);

      if (!newConsent) {
        deleteMetaPixelCookies();
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  if (!hasConsent) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1968176803741737');
fbq('track', 'PageView');`,
      }}
    />
  );
}

export default MetaPixelProvider;

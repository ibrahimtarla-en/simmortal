export enum CookieKey {
  COOKIE_BANNER_SHOWN = 'cookie_banner_shown',
  MARKETING_COOKIES_ALLOWED = 'marketing_cookies_allowed',
  NEXT_LOCALE = "NEXT_LOCALE"
}

export function setCookie(key: CookieKey, value: boolean, days: number = 365): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${key}=${value ? '1' : '0'};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(key: CookieKey): boolean | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.trim().split('=');
    if (cookieKey === key) {
      return cookieValue === '1';
    }
  }
  return null;
}

export function getCookieValue(key: CookieKey): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.trim().split('=');
    if (cookieKey === key) {
      return cookieValue;
    }
  }
  return null;
}

export function deleteCookie(key: CookieKey): void {
  document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Custom event for cookie consent changes
export const COOKIE_CONSENT_EVENT = 'cookieConsentChanged';

export interface CookieConsentEventDetail {
  marketingAllowed: boolean;
}

export function dispatchCookieConsentEvent(marketingAllowed: boolean): void {
  const event = new CustomEvent<CookieConsentEventDetail>(COOKIE_CONSENT_EVENT, {
    detail: { marketingAllowed },
  });
  window.dispatchEvent(event);
}

// Event to open cookie settings
export const OPEN_COOKIE_SETTINGS_EVENT = 'openCookieSettings';

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

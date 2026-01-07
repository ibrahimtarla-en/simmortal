/**
 * pickPreferredLocale
 *
 * Normalizes a language tag to a concrete locale for date/number formatting.
 * - If a language–region tag is provided (e.g., "en-GB", "sv-SE"), it is returned as-is.
 * - If a bare language tag is provided:
 *    • "en" resolves to "en-GB" when the client timezone is in Europe, otherwise "en-US".
 *    • Any other bare tag is returned unchanged (letting Intl resolve a default region).
 * - On the server, where browser APIs are unavailable, the function relies solely on `appLang`.
 *
 * @param appLang - The application’s current language tag (e.g., "en", "en-GB", "sv").
 * @returns A locale string suitable for Intl APIs (e.g., "en-GB", "en-US", "sv", "sv-SE").
 *
 * @example
 * // In Europe (e.g., Europe/Istanbul):
 * pickPreferredLocale("en") // "en-GB"
 *
 * @example
 * // In the U.S. or non-European timezones:
 * pickPreferredLocale("en") // "en-US"
 *
 * @example
 * pickPreferredLocale("en-GB") // "en-GB"
 * pickPreferredLocale("sv")    // "sv"
 */
export function pickPreferredLocale(appLang: string): string {
  const isClient = typeof window !== 'undefined';
  const raw = appLang ?? (isClient ? navigator.languages?.[0] || navigator.language : undefined);

  if (!raw) return appLang;
  if (raw.includes('-')) return raw;

  if (raw === 'en') {
    if (isClient) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/^Europe\//.test(tz)) return 'en-GB';
    }
    return 'en-US';
  }

  return raw;
}

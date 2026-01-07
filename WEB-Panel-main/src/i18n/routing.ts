import { defineRouting } from 'next-intl/routing';

export const LOCALES = ['en', 'tr'] as const;
export type SupportedLocale = (typeof LOCALES)[number];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALES,
  localePrefix: 'as-needed',
  // Used when no locale matches
  defaultLocale: 'en',
});

import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { formatDistanceToNowStrict, Locale } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { LOCALES, SupportedLocale } from '@/i18n/routing';

const localeMap: { [key in SupportedLocale]: Locale } = {
  en: enUS,
  tr: tr,
};

dayjs.extend(customParseFormat);

export function formatDate(
  dateStr: string,
  format: string = 'DD.MM.YYYY',
  locale: string = 'en',
): string {
  const localeToUse = LOCALES.includes(locale as SupportedLocale) ? locale : 'en';
  return dayjs(dateStr).locale(localeToUse).format(format);
}

export function formatFullMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}.${year}`;
}

export const formatRelativeTime = (date: string | number | Date, locale: string = 'en') => {
  const localeToUse = LOCALES.includes(locale as SupportedLocale)
    ? localeMap[locale as SupportedLocale]
    : enUS;
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: localeToUse,
  });
};

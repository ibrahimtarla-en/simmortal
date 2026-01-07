import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function formatDate(dateStr: string, format: string = 'DD.MM.YYYY'): string {
  return dayjs(dateStr).format(format);
}

export function formatFullMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}.${year}`;
}

export function formatDateToReadable(dateStr: string): string {
  const date = new Date(dateStr);
  const dayjsObj = dayjs(date);

  if (!dayjsObj.isValid()) {
    return '';
  }

  return dayjsObj.format('MMMM DD, YYYY');
}

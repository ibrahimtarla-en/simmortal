import { useTranslations } from 'next-intl';
import { MEMORIAL_DECORATIONS } from '@/types/memorial';

export function useMemorialDecorationText() {
  const t = useTranslations('Common.DecorationNames');
  return (decoration: string) => {
    if (MEMORIAL_DECORATIONS.some((name) => name === decoration)) {
      return t(decoration);
    }
    return '';
  };
}

'use client';
import { useLocale } from 'next-intl';
import React, { useRef, useState } from 'react';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import { LOCALES } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/utils/cn';

interface LocaleSwitchProps {
  reverse?: boolean;
  onLocaleChange?: () => void;
}

function LocaleSwitch({ reverse = false, onLocaleChange }: LocaleSwitchProps) {
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const currentLocale = useLocale();
  const router = useRouter();
  const pathName = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (locale: string) => {
    if (locale !== currentLocale) {
      router.push(pathName, { locale });
    }
    setLocaleMenuOpen(false);
    onLocaleChange?.();
  };

  const handleBlur = (event: React.FocusEvent) => {
    // Check if the new focus target is still within our component
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setLocaleMenuOpen(false);
    }
  };

  return (
    <div className="flex">
      <div
        className="relative"
        ref={containerRef}
        onBlur={handleBlur}
        onMouseEnter={() => setLocaleMenuOpen(true)}
        onMouseLeave={() => setLocaleMenuOpen(false)}>
        <div
          className="flex cursor-pointer items-center justify-center gap-5 p-2.5"
          tabIndex={0}
          onFocus={() => setLocaleMenuOpen(true)}>
          <p className="text-sm font-medium uppercase">{currentLocale}</p>
          <ArrowDown width={20} height={20} className={cn(reverse && 'rotate-180')} />
        </div>
        {localeMenuOpen && (
          <div className={cn('absolute', reverse ? 'bottom-full left-0' : 'top-full right-2.5')}>
            <div
              className={cn(
                'border-shine-1 flex min-w-16 flex-col gap-6 rounded-lg bg-zinc-950 p-2.5',
                '2xl:gap-4',
              )}>
              {LOCALES.map((locale) => (
                <button
                  key={locale}
                  className="cursor-pointer text-sm font-medium uppercase hover:underline"
                  onClick={() => handleLocaleChange(locale)}>
                  {locale}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocaleSwitch;

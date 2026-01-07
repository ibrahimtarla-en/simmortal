'use client';
import Button from '@/components/Elements/Button/Button';
import { PublishedMemorial } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { nonbreakingText } from '@/utils/string';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useRef } from 'react';
import SoundOn from '@/assets/icons/sound-on.svg';
import SoundOff from '@/assets/icons/sound-off.svg';

interface MemorialCoverProps {
  memorial: PublishedMemorial;
  setSoundOn: (soundOn: boolean) => void;
  soundOn: boolean;
  hasMusic?: boolean;
}

function MemorialCover({ memorial, setSoundOn, soundOn, hasMusic }: MemorialCoverProps) {
  const tCommon = useTranslations('Common');
  const t = useTranslations('VisitMemorial.MemorialCover');
  const locale = useLocale();
  const coverRef = useRef<HTMLDivElement>(null);

  function scrollToMemorialInfo() {
    if (!coverRef.current) {
      return;
    }
    const coverHeight = coverRef.current.getBoundingClientRect().height;
    window.scrollTo({
      top: coverHeight,
      behavior: 'smooth',
    });
  }

  return (
    <div
      className="relative h-[calc(100dvh-(18*var(--spacing)))] w-full overflow-clip"
      ref={coverRef}>
      <Image
        width={1024}
        height={720}
        sizes="100vw"
        src={memorial.coverImagePath}
        alt={`${memorial.name} Cover`}
        objectFit="cover"
        className="animate-cover-picture h-full w-full origin-[10%_20%] object-cover"
      />
      <div className="absolute inset-0 z-1000 bg-linear-0 from-black from-5% to-black/50 to-30%" />
      <div className="absolute inset-0 z-1001 container flex flex-col justify-end py-15">
        <div className={cn('flex flex-col justify-end gap-4', 'md:flex-row md:justify-between')}>
          <div className="flex flex-col gap-6">
            <p className="font-serif text-5xl">{memorial.name}</p>
            <div
              className={cn(
                'grid max-w-38 grid-cols-1 gap-6',
                'max-w-87 grid-cols-[1fr_minmax(auto,6rem)_1fr]',
                'md:mx-0 md:py-4',
                'lg:max-w-87 lg:grid-cols-[1fr_minmax(auto,6rem)_1fr]',
              )}>
              <div>
                <p className="text-2xs font-light uppercase">{tCommon('born')}</p>
                <p className="font-serif text-2xl">
                  {nonbreakingText(formatDate(memorial.dateOfBirth, 'DD MMM, YYYY', locale))}
                </p>
                <p className="text-2xs font-sans font-light">{memorial.placeOfBirth}</p>
              </div>
              <hr className={cn('my-auto grow')} />
              <div>
                <p className="text-2xs font-light uppercase">{tCommon('died')}</p>
                <p className="font-serif text-2xl">
                  {nonbreakingText(formatDate(memorial.dateOfDeath, 'DD MMM, YYYY', locale))}
                </p>
                <p className="text-2xs font-sans font-light">{memorial.placeOfDeath}</p>
              </div>
            </div>
          </div>
          <div className={cn('mt-10 flex justify-end gap-5', 'md:mt-auto')}>
            {hasMusic && (
              <Button
                icon={soundOn ? <SoundOn /> : <SoundOff />}
                onClick={() => setSoundOn(!soundOn)}
                className="mb-4"
              />
            )}
            <Button onClick={scrollToMemorialInfo}>{t('viewMemorial')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemorialCover;

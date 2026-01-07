'use client';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SearchMemorial from '@/components/Memorial/SearchMemorial/SearchMemorial';
import { useBreakpoints } from '@/hooks';

function BrowseMemorials() {
  const t = useTranslations('VisitMemorial.BrowseMemorials');
  const { isBelow } = useBreakpoints();
  const [input, setInput] = useState('');

  const router = useRouter();

  const redirectToSearchResults = () => {
    router.push(`/memorial/search-results?query=${encodeURIComponent(input)}`);
  };

  return (
    <section
      id="browse-memorials"
      className={cn(
        'relative flex h-[calc(100vh-(18*var(--spacing)))] w-full flex-col gap-5 pb-10 text-center',
        'md:flex-row-reverse',
      )}>
      <div className="relative h-full object-cover md:w-3/5 md:grow">
        <div className="absolute -inset-1 z-1000 bg-linear-90 from-black from-5% to-black/0 to-20%" />
        <div className="absolute -inset-1 z-1000 bg-linear-270 from-black from-5% to-black/0 to-20%" />
        <div className="absolute -inset-1 z-1000 bg-linear-180 from-black from-5% to-black/0 to-20%" />
        <div className="absolute -inset-1 z-1000 bg-linear-0 from-black from-5% to-black/0 to-20%" />
        <video
          className="h-full w-full object-cover"
          src="/memorials/browse.mp4"
          autoPlay
          loop
          playsInline
          muted
        />
      </div>
      <div
        className={cn(
          'flex w-full shrink-0 flex-col items-center justify-center gap-6',
          'md:h-full md:w-2/5 md:max-w-117 md:items-start md:text-left',
        )}>
        <h1 className={cn('font-serif text-3xl font-medium', 'lg:text-4xl', 'xl:text-5xl')}>
          {t('title')}
        </h1>
        <p className={cn('font-light', 'xl:text-lg', '2xl:text-xl')}>{t('description')}</p>
        <SearchMemorial
          compact
          wrapperClassName="max-w-100"
          value={input}
          resultDirection={isBelow('md') ? 'upwards' : 'downwards'}
          onTextChange={setInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              redirectToSearchResults();
            }
          }}
          onIconClicked={redirectToSearchResults}
          onResultClicked={(memorial) => router.push(`/memorial/${memorial.slug}`)}
        />
      </div>
    </section>
  );
}

export default BrowseMemorials;

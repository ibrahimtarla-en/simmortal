import { redirect } from '@/i18n/navigation';
import { getFeaturedMemorials, searchMemorials } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale, getTranslations } from 'next-intl/server';
import React from 'react';

import { cn } from '@/utils/cn';
import { MemorialCard } from '@/components';
import { PublishedMemorial } from '@/types/memorial';

async function MemorialSearchResultsPage({ searchParams }: DynamicRouteParams<null>) {
  const [{ query, showFeatured }, locale, t, tCommon] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations('SearchResults'),
    getTranslations('Common'),
  ]);

  const missingQuery = !query || Array.isArray(query) || query.trim().length === 0;

  let memorials, featuredMemorials: PublishedMemorial[];
  if (showFeatured === 'true') {
    featuredMemorials = await getFeaturedMemorials();
    memorials = featuredMemorials;
  } else if (!missingQuery) {
    [memorials, featuredMemorials] = await Promise.all([
      searchMemorials(query),
      getFeaturedMemorials(),
    ]);
  } else {
    return redirect({ href: '/memorial', locale });
  }

  return (
    <main className="container">
      <section className="w-full pb-5">
        {memorials.length > 0 && (
          <>
            <h1 className={cn('my-5 font-serif text-2xl font-medium')}>{t('matchingResults')}</h1>
            <div
              className={cn(
                'grid w-full grid-cols-1 gap-4',
                'md:grid-cols-2 md:gap-y-6',
                'lg:grid-cols-3 lg:gap-6',
                'xl:grid-cols-4',
              )}>
              {memorials.map((memorial) => (
                <div key={memorial.id} className="flex justify-center">
                  <MemorialCard
                    memorial={memorial}
                    href={`/memorial/${memorial.slug}`}
                    className={cn('max-w-100', 'md:max-w-full')}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {memorials.length === 0 && (
          <>
            <h1 className={cn('my-32 text-center font-sans text-4xl font-light', 'md:text-6xl')}>
              {tCommon('noResults')}
            </h1>
            <p className="mb-5 text-center font-sans text-xl font-light">{t('exploreFeatured')}</p>
            <div className="flex justify-center">
              <div
                className={cn(
                  'grid w-full grid-cols-1 gap-4',
                  'lg:w-auto lg:grid-cols-3 lg:gap-6',
                )}>
                {featuredMemorials.map((memorial) => (
                  <div key={memorial.id} className="flex justify-center">
                    <MemorialCard
                      memorial={memorial}
                      href={`/memorial/${memorial.slug}`}
                      className={cn('w-full max-w-100', 'lg:w-85')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default MemorialSearchResultsPage;

'use client';
import { MemorialStatus, OwnedMemorialPreview } from '@/types/memorial';
import React, { useMemo, useState } from 'react';
import MemorialCard from '../Memorial/MemorialCard/MemorialCard';
import { cn } from '@/utils/cn';
import MemorialStatusTag from '../Elements/MemorialStatusTag/MemorialStatusTag';
import { useLocale, useTranslations } from 'next-intl';
import Button from '../Elements/Button/Button';
import { formatRelativeTime } from '@/utils/date';

interface MyPagesProps {
  memorials: OwnedMemorialPreview[];
}

function MyPages({ memorials }: MyPagesProps) {
  const t = useTranslations('MyPages');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'published'>('all');

  const filteredMemorials = useMemo(() => {
    return memorials.filter((memorial) => {
      if (activeFilter === 'draft') {
        return memorial.status === MemorialStatus.DRAFT;
      } else if (activeFilter === 'published') {
        return memorial.status === MemorialStatus.PUBLISHED;
      } else {
        return true;
      }
    });
  }, [activeFilter, memorials]);

  return (
    <section className="w-full pb-5">
      <div className="my-5 flex justify-between">
        <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
        <div
          className={cn(
            'flex gap-2 font-light text-zinc-500 underline-offset-8',
            'md:gap-6',
            '[&>*]:decoration-mauveine-500 [&>*]:cursor-pointer [&>*]:px-2 [&>*]:last:pr-0',
            '[&>*]:data-[active=true]:font-semibold [&>*]:data-[active=true]:text-white [&>*]:data-[active=true]:underline',
          )}>
          <button
            data-active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            className="">
            {tCommon('all')}
          </button>
          <button
            data-active={activeFilter === 'draft'}
            onClick={() => setActiveFilter('draft')}
            className="data-[active]:text-red">
            {tCommon('draft')}
          </button>
          <button
            data-active={activeFilter === 'published'}
            onClick={() => setActiveFilter('published')}>
            {tCommon('published')}
          </button>
        </div>
      </div>
      {filteredMemorials.length > 0 && (
        <div
          className={cn(
            'grid w-full grid-cols-1 gap-4',
            'md:grid-cols-2 md:gap-y-6',
            'lg:grid-cols-3 lg:gap-6',
            'xl:grid-cols-4',
          )}>
          {filteredMemorials.map((memorial) => (
            <div
              key={memorial.id}
              className={cn(
                'flex justify-center',
                memorial.status === MemorialStatus.REMOVED && 'cursor-not-allowed',
              )}>
              <MemorialCard
                memorial={memorial}
                href={
                  memorial.status === MemorialStatus.PUBLISHED
                    ? `/memorial/${memorial.slug}`
                    : `/memorial/edit/${memorial.id}/identity`
                }
                className={cn('max-w-100', 'md:max-w-full')}
                decorator={<MemorialStatusTag status={memorial.status} />}
                decoratorPosition="top-left"
                infoText={formatRelativeTime(memorial.createdAt, locale)}
                disabled={memorial.status === MemorialStatus.REMOVED}
              />
            </div>
          ))}
        </div>
      )}
      {filteredMemorials.length === 0 && (
        <div className="mt-20 flex flex-col items-center justify-center gap-10 text-center">
          {activeFilter === 'all' && t('noPages')}
          {activeFilter === 'draft' && t('noDrafts')}
          {activeFilter === 'published' && t('noPublished')}
          <br />
          <Button role="link" href="/memorial/create" className="ml-3">
            {tCommon('createMemorial')}
          </Button>
        </div>
      )}
    </section>
  );
}

export default MyPages;

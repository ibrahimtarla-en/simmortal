'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import { Condolence } from '@/types/condolence';
import { cn } from '@/utils/cn';
import CondolenceCard from '../CondolenceCard/CondolenceCard';
import { getMockCondolences } from '@/mocks/condolence';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/components/Elements/Button/Button';
import loading from '@/assets/lottie/loading.json';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CondolenceOverlay from '../CondolenceOverlay/CondolenceOverlay';

interface MemorialCondolencesProps<T extends Condolence = Condolence> {
  controller: ReturnType<typeof usePaginatedFetch<T>>;
  previewMode?: boolean;
  memorialSlug?: string;
  showMemorialInfo?: boolean;
}

function MemorialCondolences<T extends Condolence = Condolence>({
  controller,
  previewMode,
  memorialSlug,
  showMemorialInfo = false,
}: MemorialCondolencesProps<T>) {
  const [highlightedCondolence, setHighlightedCondolence] = useState<T | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('VisitMemorial.MemorialInfo');
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const { items, fetchNext, isAllFetched, updateItem, removeItem } = controller;
  const condolences: T[] = useMemo(
    () => (previewMode ? (getMockCondolences(locale) as T[]) : items),
    [items, locale, previewMode],
  );

  // Set slug and fetch initial on mount or slug change
  useEffect(() => {
    if (previewMode) {
      return;
    }
    fetchNext();
  }, [fetchNext, previewMode]);

  // Infinite scroll
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (previewMode) {
      return;
    }
    if (latest > 0.8 && !isAllFetched) {
      fetchNext();
    }
  });

  return (
    <>
      <div ref={containerRef}>
        {condolences.length === 0 && memorialSlug && (
          <div className="flex w-full justify-center py-4">
            {!isAllFetched && <DotLottieReact data={loading} loop autoplay className="h-20" />}
            {isAllFetched && (
              <Button role="link" href={`/memorial/contribute/${memorialSlug}/condolence/create`}>
                {t('addCondolence')}
              </Button>
            )}
          </div>
        )}
        {condolences.length > 0 && (
          <>
            <div
              className={cn(
                'mb-4 grid w-full grid-cols-1 gap-6',
                'md:grid-cols-1',
                '2xl:grid-cols-2',
              )}>
              {condolences.map((condolence) => (
                <div key={`${condolence.id}-${condolence.totalLikes}-${condolence.isLikedByUser}`}>
                  <CondolenceCard
                    showMemorialInfo={showMemorialInfo}
                    condolence={condolence}
                    className={cn('h-full w-full')}
                    previewMode={previewMode}
                    onLike={() => {
                      updateItem(
                        {
                          ...condolence,
                          isLikedByUser: true,
                          totalLikes: condolence.totalLikes + 1,
                        },
                        (item) => item.id,
                      );
                    }}
                    onUnlike={() =>
                      updateItem(
                        {
                          ...condolence,
                          isLikedByUser: false,
                          totalLikes: condolence.totalLikes - 1,
                        },
                        (item) => item.id,
                      )
                    }
                    onDelete={() => {
                      removeItem(condolence, (item) => item.id);
                    }}
                  />
                </div>
              ))}
            </div>
            {!isAllFetched && !previewMode && (
              <DotLottieReact data={loading} loop autoplay className="h-30" />
            )}
          </>
        )}
      </div>
      <AnimatePresence>
        {highlightedCondolence && (
          <CondolenceOverlay
            condolence={highlightedCondolence}
            onClose={() => setHighlightedCondolence(null)}
            onLike={() => {
              updateItem(
                {
                  ...highlightedCondolence,
                  isLikedByUser: true,
                  totalLikes: highlightedCondolence.totalLikes + 1,
                },
                (item) => item.id,
              );
            }}
            onUnlike={() =>
              updateItem(
                {
                  ...highlightedCondolence,
                  isLikedByUser: false,
                  totalLikes: highlightedCondolence.totalLikes - 1,
                },
                (item) => item.id,
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default MemorialCondolences;

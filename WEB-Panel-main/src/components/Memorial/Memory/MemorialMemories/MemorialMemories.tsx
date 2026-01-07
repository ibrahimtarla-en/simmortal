'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isMemoryWithAsset, Memory } from '@/types/memory';
import { AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react';
import MemorialMasonryLayout from '@/components/Elements/MemorialMasonaryLayout/MemorialMasonaryLayout';
import MemoryCard from '../MemoryCard/MemoryCard';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import { useLocale, useTranslations } from 'next-intl';
import { getMockMemories } from '@/mocks/memory';
import Button from '@/components/Elements/Button/Button';
import loading from '@/assets/lottie/loading.json';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import MemoryOverlay from '../MemoryOverlay/MemoryOverlay';
interface MemorialMemoriesProps {
  controller: ReturnType<typeof usePaginatedFetch<Memory>>;
  previewMode?: boolean;
  memorialSlug?: string;
}

function MemorialMemories({
  controller,
  previewMode = false,
  memorialSlug,
}: MemorialMemoriesProps) {
  const [highlightedMemory, setHighlightedMemory] = useState<Memory | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const { items, fetchNext, isAllFetched, updateItem, removeItem } = controller;
  const t = useTranslations('VisitMemorial.MemorialInfo');

  const memories = useMemo(
    () => (previewMode ? getMockMemories(locale) : items),
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
        {memories.length === 0 && memorialSlug && (
          <div className="flex w-full justify-center py-4">
            {!isAllFetched && <DotLottieReact data={loading} loop autoplay className="h-20" />}
            {isAllFetched && (
              <Button role="link" href={`/memorial/contribute/${memorialSlug}/memory/create`}>
                {t('addMemory')}
              </Button>
            )}
          </div>
        )}
        {memories.length > 0 && (
          <>
            <MemorialMasonryLayout<Memory>
              items={memories}
              renderItem={(memory) => (
                <MemoryCard
                  memory={memory}
                  previewMode={previewMode}
                  onClick={
                    isMemoryWithAsset(memory) ? () => setHighlightedMemory(memory) : undefined
                  }
                  onLike={() => {
                    updateItem(
                      {
                        ...memory,
                        isLikedByUser: true,
                        totalLikes: memory.totalLikes + 1,
                      },
                      (item) => item.id,
                    );
                  }}
                  onUnlike={() =>
                    updateItem(
                      {
                        ...memory,
                        isLikedByUser: false,
                        totalLikes: memory.totalLikes - 1,
                      },
                      (item) => item.id,
                    )
                  }
                  onDelete={() => {
                    removeItem(memory, (item) => item.id);
                  }}
                />
              )}
              keyExtractor={(memory) => `${memory.id}-${memory.totalLikes}-${memory.isLikedByUser}`}
            />
            {!isAllFetched && !previewMode && (
              <DotLottieReact data={loading} loop autoplay className="h-30" />
            )}
          </>
        )}
      </div>
      <AnimatePresence>
        {highlightedMemory && (
          <MemoryOverlay
            memory={highlightedMemory}
            onClose={() => setHighlightedMemory(null)}
            assetOnly
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default MemorialMemories;

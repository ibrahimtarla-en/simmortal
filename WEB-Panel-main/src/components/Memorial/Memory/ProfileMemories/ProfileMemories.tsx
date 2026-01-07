'use client';
import React, { useEffect, useRef, useState } from 'react';
import { isMemoryWithAsset, isMemoryWithMemorialInfo, Memory, MemoryVariant } from '@/types/memory';
import { AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react';
import MemorialMasonryLayout from '@/components/Elements/MemorialMasonaryLayout/MemorialMasonaryLayout';
import MemoryCard from '../MemoryCard/MemoryCard';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import MemoryOverlay from '../MemoryOverlay/MemoryOverlay';

interface MemorialMemoriesProps {
  controller: ReturnType<typeof usePaginatedFetch<MemoryVariant>>;
  showMemorialInfo?: boolean;
}

function ProfileMemories({ controller }: MemorialMemoriesProps) {
  const [highlightedMemory, setHighlightedMemory] = useState<MemoryVariant | null>(null);
  const { items, fetchNext, isAllFetched, updateItem, removeItem } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.8 && !isAllFetched) {
      fetchNext();
    }
  });

  return (
    <>
      <div ref={containerRef}>
        <MemorialMasonryLayout<Memory>
          items={items}
          renderItem={(memory) => (
            <MemoryCard
              memory={memory}
              onClick={isMemoryWithAsset(memory) ? () => setHighlightedMemory(memory) : undefined}
              showMemorialInfo={true}
              memorial={isMemoryWithMemorialInfo(memory) ? memory.memorial : undefined}
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

export default ProfileMemories;

'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  interpolate,
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import { cn } from '@/utils/cn';
import { createIndicators, createPath, createYPositions, trimPath } from './Timeline.util';
import { HEIGHT_OFFSET, VIEWBOX_WIDTH } from './Timeline.config';
import { useLenis } from 'lenis/react';
import { TimelineMemory } from '@/types/memorial';
import MemoryOverlay from '../Memory/MemoryOverlay/MemoryOverlay';
import { Memory } from '@/types/memory';
import { createMemoryPreview } from '@/services/server/memory';
import { useLoadingModal } from '@/hooks/useLoadingModal';

interface TimelineProps {
  memories: TimelineMemory[];
  disabled?: boolean;
  memorialSlug?: string;
}

export default function Timeline({ memories, disabled, memorialSlug }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [heightSteps, setHeightSteps] = useState(0);
  const [highlightedMemory, setHighlightedMemory] = useState<Memory | null>(null);
  const { path, viewBoxHeight } = createPath(Math.ceil(memories.length / 2), heightSteps);
  const { showLoading, hideLoading } = useLoadingModal();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 65vh', 'end 90vh'],
  });
  const { scrollYProgress: exteriorProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end 50vh'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const activeIndex = useTransform(scrollYProgress, (value) => {
    if (value === 0) {
      return -1;
    }
    return Math.floor(value * (memories.length - 1));
  });
  const points = useMemo(() => {
    const barePositions = createYPositions(path);
    // If the number of memories is odd, we remove the last point to avoid an extra step
    if (memories.length % 2 === 0) {
      return barePositions;
    }
    return barePositions.slice(0, -1);
  }, [path, memories]);

  // Adjust the viewBox height to account for the height steps and the offset
  const correctedViewBoxHeight = useMemo(() => {
    const halfStepCorrection = memories.length % 2 === 0 ? 0 : -heightSteps / 2;
    const adjusted = viewBoxHeight - points[0].y + HEIGHT_OFFSET * 2 + halfStepCorrection;
    return adjusted;
  }, [heightSteps, memories, points, viewBoxHeight]);

  async function handleMemoryClick(memoryId: string) {
    try {
      showLoading();
      if (!memorialSlug) return;
      const memory = await createMemoryPreview(memorialSlug, memoryId);
      if (memory) {
        setHighlightedMemory(memory);
      }
    } finally {
      hideLoading();
    }
  }

  // Set configuration for height steps based on window width
  useEffect(() => {
    const onResize = () => {
      let newHeightSteps = 35;
      if (window.innerWidth < 496) {
        newHeightSteps = 100;
      } else if (window.innerWidth < 768) {
        newHeightSteps = 75;
      } else if (window.innerWidth < 1024) {
        newHeightSteps = 50;
      }
      setHeightSteps(newHeightSteps);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    lenis.options.virtualScroll = (e) => {
      e.deltaY = slowScroll(exteriorProgress.get()) * e.deltaY;
      return true;
    };
  }, [lenis, exteriorProgress]);

  return (
    <section
      className={cn('relative py-1', disabled && 'pointer-events-none overflow-clip')}
      id="timeline">
      <motion.div
        className={cn('container')}
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.25 }}>
        <div className={`relative mt-2 md:mt-4 lg:mt-24`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            className={`w-full`}
            viewBox={`0 ${-HEIGHT_OFFSET + points[0].y} ${VIEWBOX_WIDTH} ${correctedViewBoxHeight}`}>
            <defs>
              <filter id="neonGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="1" result="blur1" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {createIndicators(points.slice(0, memories.length), heightSteps / 4)}
            <g>
              <motion.path
                d={trimPath(path, points[0], points[points.length - 1])}
                fill="transparent"
                strokeWidth="0.25"
                stroke="white"
                pathLength="100"
              />
              <motion.path
                d={trimPath(path, points[0], points[points.length - 1])}
                fill="none"
                strokeWidth="0.5"
                stroke="var(--color-mauveine-400)"
                pathLength={disabled ? 1 : pathLength}
                style={{ filter: 'url(#neonGlow)' }}
              />
            </g>
          </svg>
          {memories.map((memory, index) => (
            <MemoryElement
              key={index}
              memory={memory}
              index={index}
              heightSteps={heightSteps}
              activeIndex={activeIndex}
              disabled={disabled}
              onContentClick={
                memory.memoryId ? () => handleMemoryClick(memory.memoryId as string) : undefined
              }
              style={{
                left: points[index].x + '%',
                top: ((points[index].y - points[0].y) / correctedViewBoxHeight) * 100 + '%',
              }}
            />
          ))}
        </div>
      </motion.div>
      {disabled && (
        <div className="pointer-events-none absolute -inset-100 z-99 backdrop-blur-xs" />
      )}
      <AnimatePresence>
        {highlightedMemory && (
          <MemoryOverlay memory={highlightedMemory} onClose={() => setHighlightedMemory(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

interface MemoryElementProps {
  memory: TimelineMemory;
  index: number;
  activeIndex: MotionValue<number>;
  heightSteps: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onContentClick?: () => void;
}

function MemoryElement({
  memory,
  index,
  activeIndex,
  className,
  style,
  disabled,
  onContentClick,
}: MemoryElementProps) {
  const [isActive, setIsActive] = useState<boolean>(index === activeIndex.get());

  const dateString = new Date(memory.date).getFullYear();

  useMotionValueEvent(activeIndex, 'change', (value) => {
    if (disabled) {
      return;
    }
    setIsActive(value === index);
  });

  return (
    <div
      className={cn(
        'absolute top-0 w-40 max-w-3/8 -translate-x-5 -translate-y-full font-serif',
        'sm:max-w-none sm:-translate-y-1/2',
        'md:w-50',
        'lg:w-60',
        'xl:w-70',
        className,
      )}
      style={style}>
      <motion.div
        className="text-xl font-bold text-white/60 lg:text-2xl xl:text-3xl"
        style={{
          color: isActive ? 'var(--color-mauveine-400)' : undefined,
        }}>
        {dateString}
      </motion.div>
      <motion.div
        className={cn(
          'absolute top-0 left-0 -translate-y-full overflow-clip',
          isActive && onContentClick && 'cursor-pointer',
        )}
        onClick={() => {
          if (isActive && onContentClick) {
            onContentClick();
          }
        }}>
        <motion.div
          className="rounded px-4"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          animate={{
            translateY: isActive ? '0%' : '100%',
          }}>
          <div className="absolute left-1/2 z-0 aspect-square h-full -translate-x-1/2 bg-radial-[at_50%_50%] from-black from-15% to-transparent to-80%"></div>
          <div
            className={cn(
              'from-mauveine-400 absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b to-transparent',
            )}
          />
          <div className="relative mb-1.5 font-semibold md:text-lg xl:text-xl 2xl:text-2xl">
            {memory.title}
          </div>
          <div className="relative font-sans text-xs font-light xl:text-sm 2xl:text-base">
            {memory.description}
          </div>
          <div className="relative h-11"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const slowScroll = interpolate([0, 0.25, 0.75, 1], [1, 0.4, 0.4, 1], { clamp: true });

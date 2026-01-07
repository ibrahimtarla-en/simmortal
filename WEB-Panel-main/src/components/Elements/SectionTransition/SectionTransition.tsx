'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '@/utils/cn';

function SectionTransition() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end 30vh'],
  });

  const scaleY = useTransform(
    useSpring(scrollYProgress, {
      damping: 20,
      stiffness: 100,
      restDelta: 0.001,
    }),
    [0, 0.9, 1],
    [0, 2, 3],
    { clamp: true },
  );
  const translateY = useTransform(scaleY, [0, 1], ['-70%', '-50%'], { clamp: true });

  return (
    <div
      className={cn(
        'relative mx-auto mt-[0lvh] mb-[10lvh] h-[5lvh] w-full max-w-[2500px] overflow-x-clip',
        'md:mt-[5lvh] md:mb-[10lvh] md:h-[3lvh]',
        'lg:mt-[3lvh] lg:mb-[10lvh]',
        'xl:mt-[10lvh] xl:mb-[20lvh]',
        '2xl:mb-[max(15vw,15lvh)] 2xl:h-[max(10lvh,10vw)]',
      )}
      ref={targetRef}>
      <motion.div
        className="relative top-0 z-9999 h-screen w-full origin-bottom"
        style={{ scaleY, translateY }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}>
        <div className="pointer-none absolute bottom-0 z-0 h-1/4 w-full bg-black select-none" />

        <Image
          loading="eager"
          alt="Transition"
          src="/transition.webp"
          width={2816}
          height={1776}
          className="relative z-1 h-full w-full object-cover object-top 2xl:object-cover"
        />
        <div className="absolute bottom-0 z-2 h-1/20 w-full bg-linear-0 from-black to-transparent" />
      </motion.div>
    </div>
  );
}

export default SectionTransition;

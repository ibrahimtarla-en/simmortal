'use client';
import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { PublishedMemorial } from '@/types/memorial';
import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { useRouter } from '@/i18n/navigation';

interface MemorialCarouselProps {
  memorials: PublishedMemorial[];
  clickable?: boolean;
  className?: string;
}

function MemorialCarousel({ memorials, clickable, className }: MemorialCarouselProps) {
  const router = useRouter();
  const slidesArray = useMemo(() => {
    if (memorials.length < 1) {
      return [];
    }
    let loopCount = 0;
    let finalArray: (PublishedMemorial & { key: string })[] = [];
    while (finalArray.length < 6) {
      finalArray = [
        ...finalArray,
        ...memorials.map((memorial) => ({ ...memorial, key: memorial.name + '-loop' + loopCount })),
      ];
      loopCount++;
    }
    return finalArray;
  }, [memorials]);
  return (
    <div className={cn('relative flex w-full px-1', className)}>
      <Swiper
        grabCursor={false}
        allowTouchMove={false}
        slidesPerView={2.5}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        }}
        speed={1000}
        centeredSlides={true}
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          modifier: 0,
        }}
        modules={[EffectCoverflow, Autoplay]}
        className="w-0 grow-1">
        {slidesArray.map((memorial) => (
          <SwiperSlide
            key={memorial.key}
            className="bg-black"
            onClick={() => clickable && router.push(`/memorial/${memorial.slug}`)}>
            {({ isActive }) => (
              <motion.div
                className={cn(
                  'border-shine-1 bg-gradient-card-fill relative w-full shrink-0 overflow-clip rounded-lg',
                  clickable ? 'cursor-pointer hover:brightness-105' : '',
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  transition: 'transform 1s ease-in-out',
                  scale: isActive ? 1 : 0.75,
                }}>
                <div className="relative aspect-square max-h-120 w-full">
                  {memorial.livePortraitPath ? (
                    <video
                      src={memorial.livePortraitPath}
                      poster={memorial.imagePath}
                      className="object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Image
                      src={memorial.imagePath}
                      alt={memorial.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="right-0 bottom-0 left-0 flex-col gap-2.5 bg-black px-1.5 py-2.5 text-center">
                  <p className={cn('font-serif text-sm font-medium', 'md:text-lg', 'xl:text-2xl')}>
                    {memorial.name}
                  </p>
                  <p className={cn('text-2xs font-light', 'md:text-sm')}>
                    {getImageDateLabel(memorial.dateOfBirth, memorial.dateOfDeath)}
                  </p>
                </div>
              </motion.div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute top-0 left-0.5 z-999 h-full w-1/8 bg-linear-to-r from-black from-0% to-transparent" />
      <div className="absolute top-0 right-0.5 z-999 h-full w-1/8 bg-linear-to-l from-black from-0% to-transparent" />
    </div>
  );
}

export default MemorialCarousel;

function getImageDateLabel(dateOfBirth: string, dateOfDeath: string): string {
  const birthYear = new Date(dateOfBirth).getFullYear();
  const deathYear = new Date(dateOfDeath).getFullYear();

  return `${birthYear} - ${deathYear}`;
}

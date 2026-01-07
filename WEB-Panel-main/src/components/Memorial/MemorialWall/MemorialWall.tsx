'use client';

import { cn } from '@/utils/cn';
import Image from 'next/image';
import React from 'react';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';

function MemorialWall() {
  return (
    <ParallaxProvider>
      <div className={cn('relative z-10000 h-180 w-full', 'sm:h-230', 'md:h-300')}>
        {memorialWallItems.map((item) => (
          <Parallax
            speed={item.speed}
            className={cn(
              'group absolute w-[calc(max(23%,100px))] origin-top hover:z-150',
              'sm:w-[calc(max(22%,110px))]',
              'md:w-[calc(max(25%,200px))]',
              'lg:w-[calc(max(20%,220px))]',
              'xl:w-[20%]',
              //   'xl:w-60',
              //   '2xl:w-64',
              item.positionClasses,
              item.scaleClass,
            )}
            key={item.name}>
            <div
              className={cn(
                'bg-mauveine-600 absolute -inset-3 rounded-2xl opacity-0 blur-xl transition-all duration-400',
                'group-hover:scale-110 group-hover:opacity-100',
              )}
            />
            <div
              className={cn(
                'border-shine-1 relative overflow-clip rounded-xl bg-black transition-all duration-400',
                'group-hover:scale-110',
              )}>
              <Image src={item.imageSrc} alt={item.name} width={288} height={331} priority />
              <div className="flex w-full flex-col items-center justify-center gap-1.5 p-2.5">
                <p
                  className={cn(
                    'text-center font-serif text-xs font-medium',
                    'sm:text-base',
                    'md:text-xl',
                  )}>
                  {item.name}
                </p>
                <p className={cn('text-2xs font-sans font-light', 'sm:text-xs', 'md:text-sm')}>
                  {item.years}
                </p>
              </div>
            </div>
          </Parallax>
        ))}
      </div>
    </ParallaxProvider>
  );
}

export default MemorialWall;

interface MemorialWallItem {
  name: string;
  years: string;
  imageSrc: string;
  speed: number;
  positionClasses: string;
  scaleClass?: string;
}

const memorialWallItems: MemorialWallItem[] = [
  {
    name: 'Selin Arman',
    years: '1986 - 2020',
    imageSrc: '/memorials/memorial-wall/1.png',
    speed: 5,
    positionClasses: cn('bottom-[0%] right-[5%] z-60', 'lg:top-[5%] lg:bottom-auto lg:right-[25%]'),
    scaleClass: 'scale-60',
  },
  {
    name: 'Nermin Ercan',
    years: '1962 - 2024',
    imageSrc: '/memorials/memorial-wall/2.png',
    speed: 10,
    positionClasses: 'top-[10%] left-[2%] z-80',
    scaleClass: 'scale-80',
  },
  {
    name: 'Murat Sezgin',
    years: '1989 - 2025',
    imageSrc: '/memorials/memorial-wall/3.png',
    speed: 20,
    positionClasses: cn(
      'top-[42%] left-[3%]  z-95',
      'sm:left-[10%]',
      'lg:top-[40%]',
      'xl:left-[22%]',
    ),
    scaleClass: 'scale-95',
  },
  {
    name: 'Gülsüm Özkan',
    years: '1979 - 2018',
    imageSrc: '/memorials/memorial-wall/4.png',
    speed: 5,
    positionClasses: cn('bottom-[0%] left-[1%] z-60'),
    scaleClass: 'scale-60',
  },
  {
    name: 'Aylin Soyer',
    years: '1933 - 2024',
    imageSrc: '/memorials/memorial-wall/5.png',
    speed: 10,
    positionClasses: cn('bottom-[15%] right-[40%] z-80', 'md:bottom-[0%]', 'lg:right-[30%]'),
    scaleClass: 'scale-80',
  },
  {
    name: 'Orhan Demirer',
    years: '1981 - 2024',
    imageSrc: '/memorials/memorial-wall/6.png',
    speed: 20,
    positionClasses: 'top-[40%] right-[4%] z-100',
  },
  {
    name: 'Berrin Yalçın',
    years: '1975 - 2001',
    imageSrc: '/memorials/memorial-wall/7.png',
    speed: 15,
    positionClasses: 'top-[10%] right-[2%] z-85',
    scaleClass: 'scale-85',
  },
  {
    name: 'Kemal Gür',
    years: '1965 - 2022',
    imageSrc: '/memorials/memorial-wall/8.png',
    speed: 5,
    positionClasses: cn('top-[10%] left-[35%] z-60', 'lg:left-[24%]'),
    scaleClass: 'scale-60',
  },
  {
    name: 'Melike Uğurlu',
    years: '1956 - 2022',
    imageSrc: '/memorials/memorial-wall/9.png',
    speed: 15,
    positionClasses: cn('top-[35%] left-[35%] z-85', 'sm:left-[38%]', 'xl:left-[45%] xl:top-[30%]'),
    scaleClass: 'scale-85',
  },
];

'use client';
import React, { useEffect } from 'react';
import ArrowRight from '@/assets/icons/browser-arrow.svg';
import Refresh from '@/assets/icons/browser-refresh.svg';
import Plus from '@/assets/icons/plus.svg';
import Cross from '@/assets/icons/close.svg';
import LogoIcon from '@/assets/brand/logo-icon.svg';
import Lock from '@/assets/icons/locked.svg';
import { cn } from '@/utils/cn';

interface CustomUrlPreviewProps {
  slug: string;
}

const CustomUrlPreview = ({ slug }: CustomUrlPreviewProps) => {
  const inputRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [slug]);
  return (
    <div className="mx-auto w-full max-w-200 overflow-hidden rounded-lg bg-zinc-800 shadow-2xl">
      {/* Browser Header */}
      <div className={cn('flex items-center justify-between bg-zinc-800 px-2', 'md:px-4')}>
        <div className={cn('flex items-center space-x-2', 'md:space-x-3')}>
          {/* Traffic Lights */}
          <div className={cn('flex space-x-1', 'md:space-x-2')}>
            <div className={cn('h-2 w-2 rounded-full bg-red-500', 'md:h-3 md:w-3')}></div>
            <div className={cn('h-2 w-2 rounded-full bg-yellow-500', 'md:h-3 md:w-3')}></div>
            <div className={cn('h-2 w-2 rounded-full bg-green-500', 'md:h-3 md:w-3')}></div>
          </div>
          {/* Tab */}
          <div
            className={cn(
              'mt-1 flex items-center space-x-2 rounded-t-lg bg-zinc-700 px-2 py-1',
              'md:mt-2 md:px-4 md:py-2',
            )}>
            <div
              className={cn('flex h-3 w-3 items-center justify-center rounded', 'md:h-4 md:w-4')}>
              <LogoIcon className="text-mauveine-400 h-full w-full" />
            </div>
            <span className={cn('text-2xs text-white', 'md:text-sm')}>Simmortals</span>
            <div>
              <Cross className={cn('h-3 w-3', 'md:h-4 md:w-4')} width={16} height={16} />
            </div>
          </div>
        </div>
        <Plus className={cn('mt-1 mr-auto ml-1.5 h-4 w-4', 'md:mt-2 md:ml-3 md:h-5 md:w-5')} />
      </div>

      {/* Navigation Bar */}
      <div
        className={cn(
          'flex items-center space-x-2 bg-zinc-700 px-2 py-1',
          'md:space-x-4 md:px-4 md:py-3',
        )}>
        <div className={cn('flex items-center space-x-1', 'md:space-x-3')}>
          <ArrowRight className={cn('h-2 w-2', 'md:h-4 md:w-4')} />
          <ArrowRight className={cn('h-2 w-2 rotate-180', 'md:h-4 md:w-4')} />
          <Refresh className={cn('h-2 w-2', 'md:h-4 md:w-4')} />
        </div>
        {/* Address Bar */}
        <div
          ref={inputRef}
          className={cn(
            'scrollbar-hide flex max-w-full flex-1 items-center space-x-1 overflow-x-scroll rounded-full bg-zinc-900 px-2 py-1',
            'md:space-x-2 md:px-4 md:py-2',
          )}>
          <Lock className={cn('h-3 w-3', 'md:h-5 md:w-5')} />
          <span className={cn('text-2xs max-w-full', 'md:text-sm')}>
            <span className="pl-2 text-zinc-400">https://simmortals.com/memorial/</span>
            {slug}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomUrlPreview;

'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { exists } from '@/utils/exists';
import { simmTags } from './SimmTag.config';
import PremiumTag from '../PremiumTag/PremiumTag';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import Location from '@/assets/icons/location.svg';
import { createLocationString } from '@/utils/geolocation';
import { SimmTagLocation } from '@/types/simmtag';

interface SimmTagProps {
  showPremiumTag?: boolean;
  className?: string;
  location?: SimmTagLocation;
  mapPinName?: string;
  onClick?: () => void;
  design?: number; // 0 - 3
  size?: 'default' | 'large';
}

function SimmTag({
  showPremiumTag = false,
  className,
  onClick,
  location,
  design,
  size = 'default',
  mapPinName,
}: SimmTagProps) {
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const latestDimensions = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const [qrCode, setQrCode] = useState<QRCodeStyling>();

  const t = useTranslations('SimmTag');
  const normalizeddesign = useMemo(() => {
    if (!exists(design) || design < 0 || design >= simmTags.length) {
      return 0;
    }
    return design;
  }, [design]);

  useEffect(() => {
    setQrCode(
      new QRCodeStyling({
        ...simmTags[normalizeddesign],
        data: createLocationString({ location, mapPinName }),
      }),
    );
  }, [location, mapPinName, normalizeddesign]);

  useEffect(() => {
    if (qrWrapperRef.current) {
      qrCode?.append(qrWrapperRef.current);
    }
  }, [qrCode, qrWrapperRef]);

  useEffect(() => {
    function handleResize() {
      if (!exists(qrCode) || !exists(qrWrapperRef.current)) {
        return;
      }
      const { width, height } = qrWrapperRef.current.getBoundingClientRect();
      if (latestDimensions.current.width !== width || latestDimensions.current.height !== height) {
        const dimension = Math.min(width, height);
        qrCode.update({
          ...simmTags[normalizeddesign],
          width: dimension,
          height: dimension,
        });
      }
      latestDimensions.current = { width, height };
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [normalizeddesign, qrCode]);

  return (
    <div
      className={cn(
        'border-shine-1 relative flex flex-col items-center justify-center',
        (onClick || location) && 'cursor-pointer',
        design === 3 ? 'bg-mauveine-800' : 'bg-gradient-card-fill',
        size === 'default' && 'w-37.5 gap-4 rounded-lg p-2.5',
        size === 'large' && 'w-47.5 gap-5 rounded-xl p-3',
        className,
      )}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        if (exists(location) && window) {
          window.open(createLocationString({ location, mapPinName }), '_blank');
          return;
        }
      }}>
      {showPremiumTag && (
        <PremiumTag
          isPremium={exists(design)}
          className="absolute top-0 left-3 z-10 -translate-y-1/2"
        />
      )}
      {exists(design) && (
        <>
          <div className="aspect-square w-full" ref={qrWrapperRef}></div>
          <div className="flex items-center justify-center gap-1">
            <Location className="h-5 w-5" width={20} height={20} />
            <p
              className={cn(
                'text-center text-sm font-medium',
                size === 'default' && 'text-2xs',
                size === 'large' && 'text-xs',
              )}>
              {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : t('assignLocation')}
            </p>
          </div>
        </>
      )}
      {!exists(design) && (
        <>
          <div className="aspect-square w-full"></div>
          <div className="flex items-center justify-center gap-1">
            <p>&nbsp;</p>
          </div>
          <p className="absolute text-sm font-medium">{t('noSimmTag')}</p>
        </>
      )}
    </div>
  );
}

export default SimmTag;

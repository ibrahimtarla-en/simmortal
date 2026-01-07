'use client';
import Button from '@/components/Elements/Button/Button';
import React from 'react';
import ArrowGo from '@/assets/icons/arrow-go.svg';
import { cn } from '@/utils/cn';
import { EventParams, trackEvent } from '@/utils/analytics';

interface StageControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextButtonType?: 'submit' | 'button';
  disabled?: boolean;
  nextButtonLabel?: string;
  previousButtonLabel?: string;
  preview?: {
    href: string;
    buttonLabel: string;
    analytics?: {
      eventName: string;
      params?: EventParams;
    };
  };
}

function StageControls({
  onPrevious,
  onNext,
  nextDisabled = false,
  nextButtonType = 'submit',
  disabled,
  nextButtonLabel,
  previousButtonLabel,
  preview,
}: StageControlsProps) {
  return (
    <div className={cn('grid w-full grid-cols-2 gap-y-10', preview && 'md:grid-cols-3')}>
      <div className="mr-auto">
        {onPrevious && (
          <Button
            icon={<ArrowGo className="rotate-180" />}
            onClick={onPrevious}
            type="button"
            disabled={disabled}>
            {previousButtonLabel}
          </Button>
        )}
      </div>
      {preview && (
        <div className={cn('col-span-2 row-start-1 mx-auto', 'md:col-span-1 md:row-auto')}>
          <Button
            role="link"
            href={preview.href}
            target="_blank"
            onClick={() => {
              if (preview.analytics) {
                trackEvent(preview.analytics.eventName, preview.analytics.params);
              }
            }}>
            {preview.buttonLabel}
          </Button>
        </div>
      )}
      <div className="ml-auto">
        {(onNext || nextButtonType === 'submit') && (
          <Button
            icon={<ArrowGo />}
            onClick={onNext}
            iconSide="right"
            disabled={nextDisabled || disabled}
            type={nextButtonType}>
            {nextButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default StageControls;

'use client';
import React from 'react';
import { unstable_OneTimePasswordField as OneTimePasswordField } from 'radix-ui';
import { cn } from '@/utils/cn';

interface OtpInputProps {
  length?: number;
  error?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const OtpInput = ({ length = 6, error, value, onChange }: OtpInputProps) => (
  <div className="inline-block">
    <OneTimePasswordField.Root
      className={cn('flex flex-nowrap gap-3.5', 'md:gap-4')}
      value={value}
      onValueChange={onChange}>
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'border-shine-1 h-16.5 w-10 overflow-clip rounded-lg',
            'md:h-18 md:w-12',
            error && 'border-mauveine-300 border-1',
          )}>
          <OneTimePasswordField.Input
            className={cn(
              'flex h-full w-full items-center justify-center bg-black text-center font-sans text-3xl font-semibold outline-none',
              'md:text-4xl',
            )}
          />
        </div>
      ))}
    </OneTimePasswordField.Root>
  </div>
);

export default OtpInput;

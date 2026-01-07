'use client';
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/cn';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none items-center select-none', className)}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}>
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-700">
        <SliderPrimitive.Range className="bg-mauveine-800 absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="ring-offset-background block h-4 w-4 rounded-full border-2 border-white bg-white transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}

export default Slider;

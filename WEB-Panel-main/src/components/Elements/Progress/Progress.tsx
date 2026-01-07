import { cn } from '@/utils/cn';
import React, { useMemo } from 'react';

interface ProgressProps {
  activeStep: number;
  totalSteps: number;
  label?: string;
  useZeroBasedIndex?: boolean;
  labelClassName?: string;
  subSteps?: { total: number; active: number };
}

function Progress({
  activeStep,
  totalSteps,
  label,
  useZeroBasedIndex,
  labelClassName,
  subSteps,
}: ProgressProps) {
  const barGrow = useMemo(() => {
    const fullStep = 1 / (totalSteps - 1);
    let total = fullStep * activeStep;
    if (subSteps) {
      const subStageProgress =
        fullStep * ((useZeroBasedIndex ? subSteps.active : subSteps.active - 1) / subSteps.total);
      total += subStageProgress;
    }
    return total;
  }, [totalSteps, activeStep, subSteps, useZeroBasedIndex]);

  return (
    <div className="flex flex-col justify-end gap-2.5">
      <div className="flex">
        <div className="h-0 w-0 grow-1" />
        <div className="relative flex h-3.5 shrink-0 flex-nowrap items-center gap-7.5">
          <div className="absolute top-1/2 left-0 z-0 flex h-0.25 w-full -translate-y-[0.5px] bg-zinc-500">
            <div className={`bg-mauveine-700 h-full w-0`} style={{ flexGrow: barGrow }} />
          </div>
          {Array.from({ length: totalSteps }, (_, index) => {
            return (
              <Dot
                key={index}
                isActive={index === (useZeroBasedIndex ? activeStep : activeStep - 1)}
                completed={index < (useZeroBasedIndex ? activeStep : activeStep - 1)}
              />
            );
          })}
        </div>
      </div>
      {label && <div className={cn('text-right font-serif text-sm', labelClassName)}>{label}</div>}
    </div>
  );
}

export default Progress;

interface DotProps {
  isActive: boolean;
  completed: boolean;
}

function Dot({ isActive, completed }: DotProps) {
  return (
    <div
      className={cn(
        'relative z-1 h-2 w-2 rounded-full transition-all duration-400',
        completed ? 'bg-mauveine-700' : 'bg-zinc-500',
        isActive ? 'bg-mauveine-300 scale-175' : 'scale-100',
      )}></div>
  );
}

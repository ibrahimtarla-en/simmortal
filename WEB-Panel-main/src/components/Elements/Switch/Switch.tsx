'use client';
import React from 'react';
import { Switch as RadixSwitch } from 'radix-ui';
import { cn } from '@/utils/cn';
import Locked from '@/assets/icons/locked.svg';
import Unlocked from '@/assets/icons/unlocked.svg';

interface SwitchProps extends RadixSwitch.SwitchProps {
  showLockIcon?: boolean;
}

function Switch({ showLockIcon = false, ...props }: SwitchProps) {
  return (
    <RadixSwitch.Root
      {...props}
      className={cn(
        'data-[state=checked]:bg-mauveine-400 full h-[24px] w-[44px] cursor-pointer rounded-full bg-zinc-400 p-[2px] transition-colors duration-200',
        props.disabled && 'data-[state=checked]:bg-mauveine-700 cursor-not-allowed bg-zinc-600',
        props.className,
      )}
      id="airplane-mode">
      <RadixSwitch.Thumb
        className={cn(
          'group block aspect-square h-full rounded-full bg-white text-zinc-400 transition-all duration-200',
          'data-[state=checked]:text-mauveine-400 data-[state=checked]:translate-x-full',
          props.disabled && 'bg-zinc-300',
        )}>
        {showLockIcon && (
          <>
            <span className="block group-data-[state=checked]:hidden">{<Unlocked />}</span>
            <span className="hidden group-data-[state=checked]:block">{<Locked />}</span>
          </>
        )}
      </RadixSwitch.Thumb>
    </RadixSwitch.Root>
  );
}

export default Switch;

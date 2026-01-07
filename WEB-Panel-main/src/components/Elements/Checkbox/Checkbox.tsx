import { cn } from '@/utils/cn';
import React from 'react';
import { Checkbox as RadixCheckbox } from 'radix-ui';
import Check from '@/assets/icons/check.svg';

function Checkbox(props: RadixCheckbox.CheckboxProps) {
  return (
    <RadixCheckbox.Root
      {...props}
      className={cn(
        'CheckboxRoot my-auto h-4 w-4 shrink-0 cursor-pointer rounded-sm',
        'data-[state=unchecked]:border-shine-1 data-[state=indeterminate]:border-shine-1',
        'data-[state=checked]:bg-mauveine-500',
      )}>
      <RadixCheckbox.Indicator className="CheckboxIndicator bg-mauveine-500">
        <Check />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export default Checkbox;

import React from 'react';
import { RadioGroup as RadixRadioGroup } from 'radix-ui';
import { cn } from '@/utils/cn';

interface RadioGroupProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

function RadioGroup({
  children,
  className,
  defaultValue,
  onValueChange,
  value,
  disabled,
}: RadioGroupProps) {
  return (
    <RadixRadioGroup.Root
      className={cn('RadioGroupRoot', className)}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      value={value}>
      {children}
    </RadixRadioGroup.Root>
  );
}

export default RadioGroup;

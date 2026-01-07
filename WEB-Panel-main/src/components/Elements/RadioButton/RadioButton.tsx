'use client';
import React from 'react';
import { RadioGroup } from 'radix-ui';

interface RadioButtonProps {
  value: string;
  id?: string;
}

function RadioButton({ value, id }: RadioButtonProps) {
  return (
    <RadioGroup.Item
      className="border-shine-1 flex h-4 w-4 shrink-0 cursor-pointer overflow-clip rounded-full"
      id={id}
      value={value}>
      <RadioGroup.Indicator className="data-[state=checked]:bg-mauveine-100 h-full w-full" />
    </RadioGroup.Item>
  );
}

export default RadioButton;

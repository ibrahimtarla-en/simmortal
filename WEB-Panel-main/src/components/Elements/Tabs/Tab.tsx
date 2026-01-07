'use client';
import React from 'react';
import { Tabs as RadixTabs } from 'radix-ui';

interface TabsProps {
  value: string;
  children?: React.ReactNode | React.ReactNode[];
}

function Tab({ value, children }: TabsProps) {
  return <RadixTabs.Content value={value}>{children}</RadixTabs.Content>;
}

export default Tab;

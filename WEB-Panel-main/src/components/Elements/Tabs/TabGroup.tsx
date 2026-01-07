'use client';
import React from 'react';
import { Tabs as RadixTabs } from 'radix-ui';

interface TabsProps {
  defaultValue?: string;
  activeTab?: string;
  children?: React.ReactNode;
  onTabChange?: (value: string) => void;
}

function TabGroup({ children, defaultValue, onTabChange, activeTab }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue} onValueChange={onTabChange} value={activeTab}>
      {children}
    </RadixTabs.Root>
  );
}

export default TabGroup;

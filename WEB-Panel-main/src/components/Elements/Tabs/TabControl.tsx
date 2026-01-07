'use client';
import React from 'react';
import { Tabs as RadixTabs } from 'radix-ui';
import { cn } from '@/utils/cn';
import { nonbreakingText } from '@/utils/string';
import { TabInfo } from '@/types/tabs';

interface TabControlProps {
  tabs?: TabInfo[];
}

function TabControl({ tabs }: TabControlProps) {
  return (
    <RadixTabs.List className="scrollbar-hide w-full overflow-x-auto py-2">
      <div className={cn('flex flex-wrap gap-x-6 gap-y-4 py-1', 'md:gap-x-10', 'lg:gap-x-16')}>
        {tabs?.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 text-lg font-light text-zinc-500',
              'data-[state=active]:decoration-mauveine-500 data-[state=active]:border-mauveine-500 data-[state=active]:border-b-2 data-[state=active]:font-semibold data-[state=active]:text-white',
            )}>
            {nonbreakingText(tab.label)}
            {tab.icon && <div className="aspect-square h-5">{tab.icon}</div>}
          </RadixTabs.Trigger>
        ))}
      </div>
    </RadixTabs.List>
  );
}

export default TabControl;

'use client';
import TabControl from '@/components/Elements/Tabs/TabControl';
import TabGroup from '@/components/Elements/Tabs/TabGroup';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Tab from '@/components/Elements/Tabs/Tab';
import Button from '@/components/Elements/Button/Button';
import Sort from '@/assets/icons/sort.svg';
import { cn } from '@/utils/cn';
import { nonbreakingText } from '@/utils/string';
import ProfileMemories from '@/components/Memorial/Memory/ProfileMemories/ProfileMemories';
import {
  getLikedCondolences,
  getLikedDonations,
  getLikedMemories,
  getOwnedCondolences,
  getOwnedDonations,
  getOwnedMemories,
} from '@/services/server/user';
import { MemorialContributionSortField } from '@/types/memorial';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import MemorialCondolences from '@/components/Memorial/Condolence/MemorialCondolences/MemorialCondolences';
import MemorialDonations from '@/components/Memorial/Donation/MemorialDonations/MemorialDonations';

interface ProfileTabsProps {
  onSortChange?: (sortBy: MemorialContributionSortField) => void;
}

function ProfileTabs({ onSortChange }: ProfileTabsProps) {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  //* active sort option can be passed to tab components for fetching operations and sorting
  const sortBy = useRef<MemorialContributionSortField>('date');
  const [activeTab, setActiveTab] = useState<string>('myMemories');
  const t = useTranslations('Profile.Tabs');
  const tCommon = useTranslations('Common');

  const likedMemoriesFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getLikedMemories(cursor, sortBy.current);
    },
    [sortBy],
  );

  const ownedMemoriesFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getOwnedMemories(cursor, sortBy.current);
    },
    [sortBy],
  );

  const likedCondolencesFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getLikedCondolences(cursor, sortBy.current);
    },
    [sortBy],
  );

  const ownedCondolencesFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getOwnedCondolences(cursor, sortBy.current);
    },
    [sortBy],
  );

  const ownedDonationsFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getOwnedDonations(cursor, sortBy.current);
    },
    [sortBy],
  );

  const likedDonationsFetchFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null) return;
      return getLikedDonations(cursor, sortBy.current);
    },
    [sortBy],
  );

  const likedMemoriesController = usePaginatedFetch({
    fetchFunction: likedMemoriesFetchFunction,
  });
  const ownedMemoriesController = usePaginatedFetch({
    fetchFunction: ownedMemoriesFetchFunction,
  });

  const likedCondolencesController = usePaginatedFetch({
    fetchFunction: likedCondolencesFetchFunction,
  });

  const ownedCondolencesController = usePaginatedFetch({
    fetchFunction: ownedCondolencesFetchFunction,
  });

  const ownedDonationsController = usePaginatedFetch({
    fetchFunction: ownedDonationsFetchFunction,
  });

  const likedDonationsController = usePaginatedFetch({
    fetchFunction: likedDonationsFetchFunction,
  });

  const handleSortChange = (option: MemorialContributionSortField) => {
    onSortChange?.(option);
    setIsSortMenuOpen(false);
    if (sortBy.current === option) return;
    sortBy.current = option;
    ownedCondolencesController.reset();
    ownedMemoriesController.reset();
    likedCondolencesController.reset();
    likedMemoriesController.reset();
    if (activeTab === 'myMemories') {
      ownedMemoriesController.fetchNext();
    } else if (activeTab === 'myCondolences') {
      ownedCondolencesController.fetchNext();
    } else if (activeTab === 'likedMemories') {
      likedMemoriesController.fetchNext();
    } else if (activeTab === 'likedCondolences') {
      likedCondolencesController.fetchNext();
    }
  };

  return (
    <section className="my-10">
      <TabGroup defaultValue="myMemories" onTabChange={setActiveTab} activeTab={activeTab}>
        <div
          className={cn(
            'mb-2.5 flex flex-col items-end justify-between gap-2.5',
            'mb-12.5 md:flex-row md:items-center',
          )}>
          <TabControl
            tabs={[
              { value: 'myMemories', label: t('myMemories') },
              { value: 'myCondolences', label: t('myCondolences') },
              { value: 'myWreaths', label: t('myWreaths') },
              { value: 'likedMemories', label: t('likedMemories') },
              { value: 'likedCondolences', label: t('likedCondolences') },
              { value: 'likedWreaths', label: t('likedWreaths') },
            ]}
          />

          <div className="relative">
            <Button icon={<Sort />} onClick={() => setIsSortMenuOpen((current) => !current)} />
            <div
              className={cn(
                'bg-mauveine-900 border-shine-1 absolute top-full right-0 z-10 mt-2 hidden min-w-30 flex-col rounded-lg p-3 font-light',
                isSortMenuOpen && 'flex',
              )}>
              <p className="mb-1.5 font-semibold">{tCommon('SortOptions.title')}</p>
              <Button
                variant="ghost"
                onClick={() => handleSortChange('date')}
                className="h-auto justify-start rounded-none px-0 py-1.5 text-left">
                {nonbreakingText(tCommon('SortOptions.recent'))}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSortChange('totalLikes')}
                className="h-auto justify-start px-0 py-1.5 text-left">
                {nonbreakingText(tCommon('SortOptions.likes'))}
              </Button>
            </div>
          </div>
        </div>

        <Tab value="myMemories">
          <ProfileMemories controller={ownedMemoriesController} showMemorialInfo />
        </Tab>
        <Tab value="myCondolences">
          <MemorialCondolences controller={ownedCondolencesController} showMemorialInfo />
        </Tab>
        <Tab value="myWreaths">
          <MemorialDonations controller={ownedDonationsController} showMemorialInfo />
        </Tab>

        <Tab value="likedMemories">
          <ProfileMemories controller={likedMemoriesController} showMemorialInfo />
        </Tab>
        <Tab value="likedCondolences">
          <MemorialCondolences controller={likedCondolencesController} showMemorialInfo />
        </Tab>
        <Tab value="likedWreaths">
          <MemorialDonations controller={likedDonationsController} showMemorialInfo />
        </Tab>
      </TabGroup>
    </section>
  );
}

export default ProfileTabs;

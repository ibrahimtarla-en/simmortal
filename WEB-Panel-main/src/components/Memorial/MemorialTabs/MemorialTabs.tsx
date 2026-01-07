'use client';
import TabControl from '@/components/Elements/Tabs/TabControl';
import TabGroup from '@/components/Elements/Tabs/TabGroup';
import Premium from '@/assets/icons/premium.svg';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Tab from '@/components/Elements/Tabs/Tab';
import Button from '@/components/Elements/Button/Button';
import Sort from '@/assets/icons/sort.svg';
import { nonbreakingText } from '@/utils/string';
import { MemorialContributionSortField, MemorialFlag, TimelineMemory } from '@/types/memorial';
import Timeline from '../Timeline/Timeline';
import { TabInfo } from '@/types/tabs';
import MemorialMessages from './MemorialMessages/MemorialMessages';
import MemorialMemories from '../Memory/MemorialMemories/MemorialMemories';
import usePaginatedFetch from '@/hooks/usePaginatedFetch';
import { Memory } from '@/types/memory';
import { getMemories } from '@/services/server/memory';
import { useUserStore } from '@/store';
import { UserAccountStatus } from '@/types/user';
import MemorialCondolences from '../Condolence/MemorialCondolences/MemorialCondolences';
import { Condolence } from '@/types/condolence';
import { getCondolences } from '@/services/server/condolence';
import { getMockTimeline } from '@/mocks/timeline';
import Lock from '@/assets/icons/locked.svg';
import { Donation } from '@/types/donation';
import { getDonations } from '@/services/server/donation';
import MemorialDonations from '../Donation/MemorialDonations/MemorialDonations';

interface MemorialTabsProps {
  memorialSlug?: string;
  onSortChange?: (sortBy: MemorialContributionSortField) => void;
  previewMode?: boolean;
  timeline?: TimelineMemory[];
  flags?: MemorialFlag[] | null;
  memorialName?: string;
  timelineDisabled?: boolean;
  wreathPrices?: Record<string, string>;
}

function MemorialTabs({
  onSortChange,
  previewMode,
  timeline,
  flags = null,
  memorialSlug,
  memorialName,
  timelineDisabled = false,
  wreathPrices,
}: MemorialTabsProps) {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('memories');
  const sortBy = useRef<MemorialContributionSortField>('date');
  const t = useTranslations('VisitMemorial.Tabs');
  const tCommon = useTranslations('Common');
  const { user } = useUserStore();
  const locale = useLocale();

  const fetchMemoryFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null || !memorialSlug) return null;
      return getMemories(memorialSlug, cursor, sortBy.current);
    },
    [memorialSlug, sortBy],
  );
  const memoryController = usePaginatedFetch<Memory>({
    fetchFunction: fetchMemoryFunction,
  });

  const fetchCondolenceFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null || !memorialSlug) return null;
      return getCondolences(memorialSlug, cursor, sortBy.current);
    },
    [memorialSlug, sortBy],
  );

  const fetchDonationFunction = useCallback(
    async (cursor: string | undefined | null) => {
      if (cursor === null || !memorialSlug) return null;
      return getDonations(memorialSlug, cursor, sortBy.current);
    },
    [memorialSlug, sortBy],
  );

  const condolenceController = usePaginatedFetch<Condolence>({
    fetchFunction: fetchCondolenceFunction,
  });

  const donationController = usePaginatedFetch<Donation>({
    fetchFunction: fetchDonationFunction,
  });

  const handleSortChange = (option: MemorialContributionSortField) => {
    onSortChange?.(option);
    setIsSortMenuOpen(false);
    if (sortBy.current === option) return;
    memoryController.reset();
    condolenceController.reset();
    sortBy.current = option;
    if (activeTab === 'memories') {
      memoryController.fetchNext();
    } else if (activeTab === 'condolences') {
      condolenceController.fetchNext();
    }
  };

  const hideFilter = useMemo(
    () => ['life-story', 'waitingApprovals'].includes(activeTab) && !previewMode,
    [activeTab, previewMode],
  );

  const tabs = useMemo(() => {
    const tabs: TabInfo[] = [
      { value: 'memories', label: t('memories') },
      { value: 'condolences', label: t('condolences') },
    ];
    if (timeline || previewMode) {
      tabs.push({
        value: 'life-story',
        label: t('lifeStory'),
        icon: <Premium height={20} width={20} />,
      });
    }
    tabs.push({ value: 'wreaths', label: t('wreaths') });
    if (flags) {
      tabs.push({
        value: 'waitingApprovals',
        label: t('waitingApprovals'),
        icon: <Lock height={20} width={20} />,
      });
    }
    return tabs;
  }, [flags, previewMode, t, timeline]);

  useEffect(() => {
    if (!window) {
      return;
    }
    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get('active_tab');
    if (tabParam) {
      setActiveTab(tabParam);
      const tabs = document.getElementById('memorial-tabs');
      if (tabs) {
        tabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <section className="my-10" id="memorial-tabs">
      {previewMode && (
        <div className="bg-mauveine-900 border-shine-1 mb-1.5 w-full px-3 py-1.5 text-center">
          {t('contributionPreviewInfo')}
        </div>
      )}
      <TabGroup defaultValue="memories" onTabChange={setActiveTab} activeTab={activeTab}>
        <div className="mb-5 flex flex-col items-end justify-between gap-2.5 md:flex-row md:items-center">
          <TabControl tabs={tabs} />
          {!hideFilter && (
            <div className="relative">
              <Button icon={<Sort />} onClick={() => setIsSortMenuOpen((current) => !current)} />
              <div
                className={`bg-mauveine-900 border-shine-1 absolute top-full right-0 z-10 mt-2 min-w-30 flex-col rounded-lg p-3 font-light ${isSortMenuOpen ? 'flex' : 'hidden'}`}>
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
          )}
        </div>

        <Tab value="memories">
          <MemorialMemories
            controller={memoryController}
            previewMode={previewMode}
            memorialSlug={memorialSlug}
          />
        </Tab>
        <Tab value="condolences">
          <MemorialCondolences
            controller={condolenceController}
            previewMode={previewMode}
            memorialSlug={memorialSlug}
          />
        </Tab>
        {previewMode && (
          <Tab value="life-story">
            {
              <Timeline
                memories={getMockTimeline(memorialName, locale)}
                disabled={timelineDisabled}
              />
            }
          </Tab>
        )}
        {timeline && !previewMode && (
          <Tab value="life-story">
            {<Timeline memories={timeline} memorialSlug={memorialSlug} />}
          </Tab>
        )}
        <Tab value="wreaths">
          <MemorialDonations
            controller={donationController}
            previewMode={previewMode}
            memorialSlug={memorialSlug}
            wreathPrices={wreathPrices}
          />
        </Tab>
        {flags && memorialSlug && user?.status === UserAccountStatus.ACTIVE && (
          <Tab value="waitingApprovals">
            <MemorialMessages initialFlags={flags} slug={memorialSlug} />
          </Tab>
        )}
      </TabGroup>
    </section>
  );
}

export default MemorialTabs;

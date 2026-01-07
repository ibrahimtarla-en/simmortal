'use client';

import React from 'react';
import ShopCarousel from '../Elements/Shop/ShopCarousel';
import { cn } from '@/utils/cn';
import ShopContent from '../Elements/Shop/ShopContent';
import { ShopListing } from '@/types/shop';

interface ShopListProps {
  initialShopList: ShopListing;
}

function Shop({ initialShopList }: ShopListProps) {
  const { items, featuredItems, categories } = initialShopList;
  return (
    <div className={cn('relative container w-full flex-col px-4', 'md:px-8', 'lg:px-32')}>
      <ShopCarousel featuredItems={featuredItems} className={cn('my-3.5', 'lg:my-10')} />
      <ShopContent categories={categories} shopItems={items} className={cn('lg:my-14')} />
    </div>
  );
}

export default Shop;

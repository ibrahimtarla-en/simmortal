'use client';
import { cn } from '@/utils/cn';
import { Nullable } from '@/types/util';
import Image from 'next/image';
import RadioGroup from '../RadioButton/RadioGroup';
import RadioButton from '../RadioButton/RadioButton';
import React from 'react';
import { useProductFilter } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ShopItem, ShopItemStatus } from '@/types/shop';

interface GridProps {
  categories: Nullable<string[]>;
  shopItems: Nullable<ShopItem[]>;
  className?: string;
}

function ShopContent({ categories, shopItems, className }: GridProps) {
  const tCommon = useTranslations('Common');
  const tShop = useTranslations('Shop');
  const router = useRouter();
  const { categoriesWithAll, filteredProducts, handleCategorySelect } = useProductFilter(
    categories,
    shopItems,
  );

  const handleProductClick = (shopItem: ShopItem) => {
    router.push(`/shop/${shopItem.slug}`);
  };

  return (
    <div className={cn('flex w-full flex-col space-y-14', 'lg:flex-row', className)}>
      <div className={cn('flex flex-col space-y-8', 'lg:w-1/5 lg:space-y-8')}>
        <h2 className={cn('w-full text-left font-serif text-xl font-medium', 'md:text-2xl')}>
          {tCommon('shop')}
        </h2>
        {/* Categories */}
        <RadioGroup defaultValue={tCommon('all')} onValueChange={handleCategorySelect}>
          <div className={cn('grid grid-cols-3 gap-4', 'md:grid-cols-3', 'lg:grid-cols-1')}>
            {categoriesWithAll?.map((category) => (
              <div key={category} className="flex w-full items-center space-x-4">
                <RadioButton value={category} id={category} />
                <label
                  htmlFor={category}
                  className={cn('cursor-pointer text-base font-normal', 'md:text-lg')}>
                  {category}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
      <div className={cn('grid w-full grid-cols-1 gap-16', 'md:grid-cols-2', 'lg:grid-cols-3')}>
        {/* Products */}
        {filteredProducts?.map((shopItem) => (
          <div key={shopItem.id} className="flex flex-col space-y-3">
            <div
              className={cn(
                'border-shine-1 relative aspect-[428/310] w-full cursor-pointer overflow-hidden rounded-lg',
                'hover:border-mauveine-300 hover:border-2',
              )}
              onClick={() => handleProductClick(shopItem)}>
              <Image src={shopItem.images[0]} alt={shopItem.name} fill className="object-cover" />
            </div>
            <span
              onClick={() => handleProductClick(shopItem)}
              className="cursor-pointer text-xl font-medium">
              {shopItem.name}
            </span>
            {shopItem.status === ShopItemStatus.COMING_SOON && (
              <p className="text-sm font-normal text-zinc-500">{tShop('comingSoon')}</p>
            )}
            {shopItem.status === ShopItemStatus.AVAILABLE && (
              <p className="text-lg font-bold">{shopItem.displayPrice}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopContent;

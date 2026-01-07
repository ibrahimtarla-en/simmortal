'use client';
import { ShopItem } from '@/types/shop';
import { Nullable } from '@/types/util';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

interface UseProductFilterReturn {
  categoriesWithAll: Nullable<string[]>;
  selectedCategory: string;
  filteredProducts: Nullable<ShopItem[]>;
  handleCategorySelect: (category: string) => void;
}

export const useProductFilter = (
  categories: Nullable<string[]>,
  products: Nullable<ShopItem[]>,
): UseProductFilterReturn => {
  const t = useTranslations('Common');
  const categoriesWithAll = categories ? [t('all'), ...categories] : [t('all')];
  const [selectedCategory, setSelectedCategory] = useState<string>(categoriesWithAll[0]);
  const filteredProducts = useMemo(() => {
    if (!products) return null;
    return products.filter((product) =>
      selectedCategory === t('all') ? true : product.category.includes(selectedCategory),
    );
  }, [products, selectedCategory, t]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return {
    categoriesWithAll,
    selectedCategory,
    filteredProducts,
    handleCategorySelect,
  };
};

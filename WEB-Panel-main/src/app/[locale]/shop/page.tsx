import React from 'react';
import { Shop } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getShopList } from '@/services/server/shop';
import { getLocale } from 'next-intl/server';

async function ShopPage() {
  const locale = await getLocale();
  const shopList = await getShopList(locale);
  if (!shopList) {
    return redirect({ href: '/', locale });
  }

  return <Shop initialShopList={shopList} />;
}

export default ShopPage;

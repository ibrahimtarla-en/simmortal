import { CreateEditMemorial } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getOwnedMemorial, getPremiumMemorialPrices } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditMemorialFramePage({ params }: DynamicRouteParams<{ id: string }>) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  if (!id) {
    return redirect({ href: '/', locale });
  }
  // used to validate ownership
  const [initialValues, prices] = await Promise.all([
    getOwnedMemorial(id).catch(() => null),
    getPremiumMemorialPrices().catch(() => null),
  ]);
  if (!initialValues || !prices) {
    return redirect({ href: '/', locale });
  }
  return (
    <CreateEditMemorial.Checkout
      id={initialValues.id}
      freePrice={prices.freePrice}
      monthlyPrice={prices.monthlyPrice}
      annualPrice={prices.yearlyPrice}
      status={initialValues.status}
    />
  );
}

export default EditMemorialFramePage;

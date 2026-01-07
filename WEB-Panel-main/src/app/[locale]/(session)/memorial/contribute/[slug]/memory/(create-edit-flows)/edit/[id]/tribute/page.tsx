import { CreateEditMemory } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createMemoryPreview } from '@/services/server/memory';
import { getDecorationPrices, getTributePrices } from '@/services/server/shop';
import { MemorialContributionStatus } from '@/types/contribution';

import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditMemoryTributePage({ params }: DynamicRouteParams<{ slug: string; id: string }>) {
  const [{ slug, id }, locale] = await Promise.all([params, getLocale()]);
  if (!slug) {
    return redirect({ href: '/', locale });
  }

  const [memory, tributePrices, decorationPrices] = await Promise.all([
    createMemoryPreview(slug, id).catch(() => null),
    getTributePrices(),
    getDecorationPrices(),
  ]);
  if (!memory) {
    return redirect({ href: '/', locale });
  }

  if (memory.status !== MemorialContributionStatus.DRAFT) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }

  return (
    <CreateEditMemory.Tribute
      initialValues={memory}
      slug={slug}
      tributePrices={tributePrices}
      decorationPrices={decorationPrices}
    />
  );
}

export default EditMemoryTributePage;

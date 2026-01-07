import { CreateEditCondolence } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createCondolencePreview } from '@/services/server/condolence';
import { getDecorationPrices } from '@/services/server/shop';
import { MemorialContributionStatus } from '@/types/contribution';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditCondolenceTributePage({
  params,
}: DynamicRouteParams<{ slug: string; id: string }>) {
  const [{ slug, id }, locale] = await Promise.all([params, getLocale()]);
  if (!slug) {
    return redirect({ href: '/', locale });
  }

  const [condolence, prices] = await Promise.all([
    createCondolencePreview(slug, id).catch(() => null),
    getDecorationPrices(),
  ]);
  if (!condolence) {
    return redirect({ href: '/', locale });
  }
  if (condolence.status !== MemorialContributionStatus.DRAFT) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }

  return <CreateEditCondolence.Tribute initialValues={condolence} slug={slug} prices={prices} />;
}

export default EditCondolenceTributePage;

import { CreateEditCondolence } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createCondolencePreview } from '@/services/server/condolence';
import { getPublishedMemorialBySlug } from '@/services/server/memorial';
import { MemorialContributionStatus } from '@/types/contribution';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function CondolenceAboutPage({ params }: DynamicRouteParams<{ slug: string; id: string }>) {
  const [{ slug, id }, locale] = await Promise.all([params, getLocale()]);
  if (!slug || !id) {
    return redirect({ href: '/', locale });
  }
  const condolence = await createCondolencePreview(slug, id).catch(() => null);
  if (!condolence) {
    return redirect({ href: '/', locale });
  }

  const memorial = await getPublishedMemorialBySlug(slug);
  if (!memorial) {
    return redirect({ href: '/', locale: locale });
  }

  if (
    condolence.status !== MemorialContributionStatus.DRAFT &&
    condolence.status !== MemorialContributionStatus.PUBLISHED
  ) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }

  return (
    <CreateEditCondolence.About
      initialValue={condolence}
      slug={slug}
      memorialName={memorial.name}
    />
  );
}

export default CondolenceAboutPage;

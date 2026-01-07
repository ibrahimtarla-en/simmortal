import { CreateEditMemory } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createMemoryPreview } from '@/services/server/memory';
import { MemorialContributionStatus } from '@/types/contribution';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function MemoryAboutPage({ params }: DynamicRouteParams<{ slug: string; id: string }>) {
  const [{ slug, id }, locale] = await Promise.all([params, getLocale()]);
  if (!slug || !id) {
    return redirect({ href: '/', locale });
  }
  const memory = await createMemoryPreview(slug, id).catch(() => null);
  if (!memory) {
    return redirect({ href: '/', locale });
  }

  if (
    memory.status !== MemorialContributionStatus.DRAFT &&
    memory.status !== MemorialContributionStatus.PUBLISHED
  ) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }

  return <CreateEditMemory.About initialValue={memory} slug={slug} />;
}

export default MemoryAboutPage;

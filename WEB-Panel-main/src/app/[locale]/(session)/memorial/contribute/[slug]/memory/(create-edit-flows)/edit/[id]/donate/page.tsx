import { CreateEditMemory } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createMemoryPreview } from '@/services/server/memory';
import { MemorialContributionStatus } from '@/types/contribution';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditMemoryDonatePage({ params }: DynamicRouteParams<{ slug: string; id: string }>) {
  const [{ slug, id }, locale] = await Promise.all([params, getLocale()]);
  if (!slug) {
    return redirect({ href: '/', locale });
  }

  const memory = await createMemoryPreview(slug, id).catch(() => null);
  if (!memory) {
    return redirect({ href: '/', locale });
  }
  if (memory.status !== MemorialContributionStatus.DRAFT) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }
  return <CreateEditMemory.Donate initialValues={memory} slug={slug} />;
}

export default EditMemoryDonatePage;

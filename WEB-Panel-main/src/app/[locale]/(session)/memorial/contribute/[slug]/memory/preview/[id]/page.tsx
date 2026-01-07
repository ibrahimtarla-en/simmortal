import { CreateEditMemory } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createMemoryPreview } from '@/services/server/memory';
import { DynamicRouteParams } from '@/types/util';
import { exists } from '@/utils/exists';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function PreviewMemoryPage({
  params,
  searchParams,
}: DynamicRouteParams<{
  slug: string;
  id: string;
}>) {
  const [{ slug, id }, queryParams, locale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);
  if (!id) {
    return redirect({ href: '/', locale });
  }

  const memory = await createMemoryPreview(slug, id, queryParams);
  if (!memory) {
    return redirect({ href: '/', locale });
  }
  if (!exists(memory)) {
    return redirect({ href: '/', locale });
  }

  return (
    <main className="container">
      <CreateEditMemory.Preview initialValues={memory} />
    </main>
  );
}

export default PreviewMemoryPage;

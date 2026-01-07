import MemorialInfo from '@/components/Memorial/MemorialInfo/MemorialInfo';
import { redirect } from '@/i18n/navigation';
import { createMemorialPreview } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function PreviewMemorialPage({
  params,
  searchParams,
}: DynamicRouteParams<{
  id: string;
}>) {
  const [{ id }, queryParams, locale] = await Promise.all([params, searchParams, getLocale()]);
  if (!id) {
    return redirect({ href: '/', locale });
  }
  const memorial = await createMemorialPreview(id, queryParams);
  if (!memorial) {
    return redirect({ href: '/', locale });
  }
  return <MemorialInfo memorial={memorial} viewMode="preview" showPreviewBanner showCover />;
}

export default PreviewMemorialPage;

import { CreateEditMemorial } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getMemorialPublishPreview } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function PreviewMemorialPage({ params }: DynamicRouteParams<{ id: string }>) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  if (!id) {
    return redirect({ href: '/', locale });
  }
  const memorial = await getMemorialPublishPreview(id);
  if (!memorial) {
    return redirect({ href: '/', locale });
  }
  return <CreateEditMemorial.Preview preview={memorial} />;
}

export default PreviewMemorialPage;

import { CreateEditCondolence } from '@/components';
import { redirect } from '@/i18n/navigation';
import { createCondolencePreview } from '@/services/server/condolence';
import { DynamicRouteParams } from '@/types/util';
import { exists } from '@/utils/exists';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function PreviewCondolencePage({
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

  const condolence = await createCondolencePreview(slug, id, queryParams);
  if (!condolence) {
    return redirect({ href: '/', locale });
  }
  if (!exists(condolence)) {
    return redirect({ href: '/', locale });
  }

  return (
    <main className="container">
      <CreateEditCondolence.Preview initialValues={condolence} />
    </main>
  );
}

export default PreviewCondolencePage;

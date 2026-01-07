import { CreateEditMemorial } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getOwnedMemorial } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditMemorialUrlPage({ params }: DynamicRouteParams<{ id: string }>) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  if (!id) {
    return redirect({ href: '/', locale });
  }
  const initialValues = await getOwnedMemorial(id, true).catch(() => null);
  if (!initialValues) {
    return redirect({ href: '/', locale });
  }
  return <CreateEditMemorial.Slug initialValues={initialValues} />;
}

export default EditMemorialUrlPage;

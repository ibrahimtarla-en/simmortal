import { EditPublishedMemorial } from '@/components';
import { redirect } from '@/i18n/navigation';
import {
  getOwnedMemorial,
  getPublishedMemorialById,
  validateSubscriptionResult,
} from '@/services/server/memorial';
import { getUser } from '@/services/server/user';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditPublishedMemorialPage({
  params,
  searchParams,
}: DynamicRouteParams<{ id: string }>) {
  const [{ id }, { session_id }, user, locale] = await Promise.all([
    params,
    searchParams,
    getUser(),
    getLocale(),
  ]);

  if (!id) {
    return redirect({ href: '/', locale });
  }
  if (session_id) {
    await validateSubscriptionResult(session_id as string, true);
  }
  const [memorial, ownedMemorial] = await Promise.all([
    getPublishedMemorialById(id),
    getOwnedMemorial(id),
  ]);
  if (!memorial || !ownedMemorial) {
    return redirect({ href: `/`, locale });
  }

  if (memorial.ownerId !== user?.userId) {
    return redirect({ href: `/memorial/${memorial.slug}`, locale });
  }

  return <EditPublishedMemorial publishedMemorial={memorial} isPremium={ownedMemorial.isPremium} />;
}

export default EditPublishedMemorialPage;

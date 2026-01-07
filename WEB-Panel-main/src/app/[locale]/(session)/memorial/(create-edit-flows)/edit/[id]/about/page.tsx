import { CreateEditMemorial } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getOwnedMemorial } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { exists } from '@/utils/exists';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function CreateMemorialPage({ params }: DynamicRouteParams<{ id: string }>) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  if (!id) {
    return redirect({ href: '/', locale });
  }
  const memorial = await getOwnedMemorial(id).catch(() => null);
  if (!memorial) {
    return redirect({ href: `/memorial/edit/${id}/identity`, locale });
  }
  const { dateOfBirth, dateOfDeath, name, imagePath, about } = memorial;
  const allRequiredValuesExist =
    exists(dateOfBirth) && exists(dateOfDeath) && exists(name) && exists(imagePath);
  if (!allRequiredValuesExist) {
    return redirect({ href: `/memorial/edit/${id}/identity`, locale });
  }
  return (
    <CreateEditMemorial.About
      dateOfBirth={dateOfBirth}
      dateOfDeath={dateOfDeath}
      name={name}
      imagePath={imagePath}
      id={id}
      initialValue={about}
      status={memorial.status}
    />
  );
}

export default CreateMemorialPage;

import { EditProfile } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getUser } from '@/services/server/user';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function EditProfilePage() {
  const [user, locale] = await Promise.all([getUser(), getLocale()]);

  if (!user) {
    return redirect({ href: '/login', locale });
  }

  return (
    <main className="container">
      <EditProfile initialUser={user} />
    </main>
  );
}

export default EditProfilePage;

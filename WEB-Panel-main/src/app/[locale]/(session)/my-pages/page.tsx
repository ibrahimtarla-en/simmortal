import MyPages from '@/components/MyPages/MyPages';
import { redirect } from '@/i18n/navigation';
import { getOwnedMemorialPreviews } from '@/services/server/memorial';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function MyPagesPage() {
  const [memorials, locale] = await Promise.all([getOwnedMemorialPreviews(), getLocale()]);
  if (!memorials) {
    return redirect({ href: '/', locale });
  }
  return (
    <main className="container">
      <MyPages memorials={memorials} />
    </main>
  );
}

export default MyPagesPage;

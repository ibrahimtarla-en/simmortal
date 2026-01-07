import ReportContent from '@/components/ReportContent/ReportContent';
import { redirect } from '@/i18n/navigation';
import { isReportableContent } from '@/types/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';

async function ReportContentPage({ params, searchParams }: DynamicRouteParams<{ id: string }>) {
  const [{ id }, { type, redirectTo }, locale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);

  if (!type || typeof type !== 'string' || isReportableContent(type) === false) {
    return redirect({ href: '/', locale });
  }
  return (
    <main className="container">
      <ReportContent
        contentId={id}
        contentType={type}
        redirectTo={redirectTo as string | undefined}
      />
    </main>
  );
}

export default ReportContentPage;

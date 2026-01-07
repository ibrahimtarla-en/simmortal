import { MemorialCarousel, ResetPassword } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getFeaturedMemorials } from '@/services/server/memorial';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import { getLocale } from 'next-intl/server';
import React from 'react';

interface ResetPasswordPageParams {
  searchParams: Promise<{
    token: string;
    tenantId: string;
  }>;
}

async function ResetPasswordPage({ searchParams }: ResetPasswordPageParams) {
  const [{ token, tenantId }, locale, featuredMemorials] = await Promise.all([
    searchParams,
    getLocale(),
    getFeaturedMemorials(),
  ]);

  if (!exists(token) || !exists(tenantId)) {
    redirect({ href: '/', locale });
    return;
  }

  return (
    <div className={cn('container py-27.5')}>
      <div
        className={cn(
          'relative flex w-full flex-row justify-center',
          'md:flex md:gap-22',
          'xl:gap-45',
        )}>
        <ResetPassword />
        {featuredMemorials.length > 0 && (
          <div className={cn('hidden max-w-180', 'md:flex md:grow md:flex-col md:justify-center')}>
            <MemorialCarousel memorials={featuredMemorials} className="w-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;

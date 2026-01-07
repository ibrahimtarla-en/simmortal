'use client';
import { Button } from '@/components';
import { logout } from '@/services/server/auth/supertokens';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';

function AccountSuspendedPage() {
  const t = useTranslations('Suspended');
  const tCommon = useTranslations('Common');

  return (
    <main className="container flex grow flex-col items-center justify-center gap-10 text-center">
      <h1 className="font-serif text-4xl font-bold">{t('title')}</h1>
      <p className="text-lg">{t('description')}</p>
      <div className={cn('grid grid-cols-1 gap-5', 'md:grid-cols-2')}>
        <Button role="link" href="/contact">
          {t('contactSupport')}
        </Button>
        <Button onClick={logout}>{tCommon('logout')}</Button>
      </div>
    </main>
  );
}

export default AccountSuspendedPage;

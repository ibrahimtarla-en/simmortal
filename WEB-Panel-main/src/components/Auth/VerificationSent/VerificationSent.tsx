'use client';
import { sendEmailPasswordVerificationEmail } from '@/services/server/auth/supertokens';
import { trackEvent } from '@/utils/analytics';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';

function VerificationSent() {
  const t = useTranslations('Auth');
  return (
    <div className={cn('w-full', 'md:w-64', 'lg:w-100')}>
      <div className={cn('flex flex-col gap-20', 'md:gap-7', 'lg:gap:12')}>
        <h1 className={cn('text-4xl font-light', 'md:mb-9 md:text-2xl', 'lg:text-6xl')}>
          {t('checkInbox')}
        </h1>
        <p className={cn('text-lg font-light', 'md:text-sm', 'lg:text-lg')}>{t('linkSent')}</p>
        <p>
          {t.rich('didntGetVerificationEmail', {
            resend: (chunks) => (
              <span
                role="button"
                className="text-mauveine-300 cursor-pointer underline"
                onClick={() => {
                  trackEvent('resendVerificationEmailClicked');
                  sendEmailPasswordVerificationEmail();
                }}>
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>
    </div>
  );
}

export default VerificationSent;

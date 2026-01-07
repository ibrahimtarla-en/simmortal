'use client';
import Button from '@/components/Elements/Button/Button';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useRouter } from '@/i18n/navigation';
import { useUserStore } from '@/store';
import { exists } from '@/utils/exists';
import { trackEvent } from '@/utils/analytics';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import {
  verifyEmail,
  sendVerificationEmail,
  isEmailVerified,
} from 'supertokens-web-js/recipe/emailverification';

function VerificationResult() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const { user } = useUserStore();
  const [status, setStatus] = useState<'OK' | 'ERROR' | 'LOADING'>('LOADING');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const handleFailedVerification = useCallback(async () => {
    if (!exists(user)) {
      trackEvent('emailVerificationLoginClicked');
      router.push('/login');
      return;
    }
    try {
      trackEvent('emailVerificationResendClicked');
      showLoading();
      await sendVerificationEmail().then((res) => {
        if (res.status === 'EMAIL_ALREADY_VERIFIED_ERROR') {
          setStatus('OK');
        }
      });
      hideLoading();
    } catch {
      hideLoading();
    }
  }, [user, router, showLoading, hideLoading]);

  useEffect(() => {
    verifyEmail().then(async (response) => {
      if (response.status === 'OK') {
        setStatus('OK');
        return;
      }
      const isAlreadyVerified = await isEmailVerified();
      if (isAlreadyVerified) {
        setStatus('OK');
        return;
      }
      setStatus('ERROR');
    });
  }, []);

  if (status === 'LOADING') {
    return <div>loading...</div>;
  }

  return (
    <section className="flex w-full flex-col items-center justify-center gap-16 py-40 text-center">
      {status === 'OK' && (
        <>
          <h1 className="font-serif text-6xl font-medium whitespace-pre-line">
            {t('verificationSuccess')}
          </h1>
          <Button role="link" href="/" onClick={() => trackEvent('emailVerificationHomeClicked')}>
            {tCommon('homePage')}
          </Button>
        </>
      )}
      {status !== 'OK' && (
        <>
          <h1 className="font-serif text-6xl font-medium">{t('verificationFailed')}</h1>
          <div>
            <p className="text-lg">{t('verificationFailedDescription')}</p>
            {!exists(user) && <p>{t('loginToRequestNewLink')}</p>}
          </div>
          <Button onClick={handleFailedVerification} disabled={isLoading}>
            {exists(user) ? t('resendVerificationEmail') : tCommon('login')}
          </Button>
        </>
      )}
    </section>
  );
}

export default VerificationResult;

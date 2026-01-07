'use client';
import Button from '@/components/Elements/Button/Button';
import Input from '@/components/Elements/Input/Input';
import { useBreakpoints } from '@/hooks';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { Link } from '@/i18n/navigation';
import { sendEmailPasswordResetEmail } from '@/services/server/auth/supertokens';
import { cn } from '@/utils/cn';
import { trackEvent } from '@/utils/analytics';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ForgotPasswordForm {
  email: string;
}

function ForgotPassword() {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const tPlaceholder = useTranslations('Placeholder');
  const [stage, setStage] = useState<'form' | 'sent'>('form');
  const { breakpoint } = useBreakpoints();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const handleFormSubmit = async (data: ForgotPasswordForm) => {
    try {
      showLoading();
      await sendEmailPasswordResetEmail(data.email);
      setStage('sent');
    } catch {
    } finally {
      hideLoading();
    }
  };

  return (
    <div className={cn('w-full', 'md:w-64', 'lg:w-100')}>
      <div className={cn('flex flex-col gap-16', 'md:gap-9', 'lg:gap-16')}>
        <h1 className={cn('text-5xl font-light', 'md:text-3xl', 'lg:text-6xl')}>
          {t('resetPassword')}
        </h1>
        {stage === 'form' && (
          <>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className={cn('flex w-full flex-col gap-7', 'md:gap-3.5', 'lg:gap-11')}>
              <Input
                type="text"
                placeholder={tPlaceholder('email')}
                id="email"
                label={tCommon('email')}
                size={breakpoint === 'md' ? 'small' : 'default'}
                {...register('email', {
                  required: t('invalidEmail'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('invalidEmail'),
                  },
                })}
                error={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <Button
                size={breakpoint === 'md' ? 'small' : 'default'}
                onClick={() => {
                  trackEvent('resetPasswordButtonClicked');
                }}
                disabled={isLoading}>
                {t('resetPassword')}
              </Button>
            </form>
            <div className={cn('text-sm', 'md:text-xs', 'lg:text-sm')}>
              {t('dontHaveAccount')}
              <Link
                href="/signup"
                className="text-mauveine-300 ml-2 underline"
                onClick={() => trackEvent('forgotPasswordCreateAccountLinkClicked')}>
                {t('createAccount')}
              </Link>
            </div>
          </>
        )}
        {stage === 'sent' && (
          <>
            <p className={cn('text-lg font-light whitespace-pre-line', 'md:text-sm', 'lg:text-lg')}>
              {t('resetPasswordSent', { email: getValues('email') })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

'use client';
import Button from '@/components/Elements/Button/Button';
import Input from '@/components/Elements/Input/Input';
import { useBreakpoints } from '@/hooks';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import { trackEvent } from '@/utils/analytics';

interface ResetPasswordForm {
  newPassword: string;
}

function ResetPassword() {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const [stage, setStage] = useState<'form' | 'changed'>('form');
  const { breakpoint } = useBreakpoints();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const handleFormSubmit = async (data: ResetPasswordForm) => {
    try {
      showLoading();
      const res = await EmailPassword.submitNewPassword({
        formFields: [
          {
            id: 'password',
            value: data.newPassword,
          },
        ],
      });
      if (res.status === 'OK') {
        setStage('changed');
      } else {
        setError('newPassword', { message: t('invalidPassword') });
      }
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
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className={cn('flex w-full flex-col gap-7', 'md:gap-3.5', 'lg:gap-11')}>
            <Input
              type="password"
              placeholder={'********'}
              id="password"
              {...register('newPassword', { required: t('invalidPassword') })}
              label={t('newPassword')}
              size={breakpoint === 'md' ? 'small' : 'default'}
              error={!!errors.newPassword}
              errorMessage={errors.newPassword?.message}
              allowReveal
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
        )}
        {stage === 'changed' && (
          <div className={cn('flex flex-col gap-7', 'md:gap-3.5', 'lg:gap-11')}>
            <p className={cn('text-lg font-light', 'md:text-sm', 'lg:text-lg')}>
              {t('passwordChanged')}
            </p>
            <Button
              size={breakpoint === 'md' ? 'small' : 'default'}
              role="link"
              href="/login"
              onClick={() => {
                trackEvent('resetPasswordLoginButtonClicked');
              }}
              disabled={isLoading}>
              {tCommon('login')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;

'use client';
import React, { useMemo } from 'react';
import GoogleButton from '../../Elements/GoogleButton/GoogleButton';
import { cn } from '@/utils/cn';
import Input from '../../Elements/Input/Input';
import { Link, useRouter } from '@/i18n/navigation';
import Button from '../../Elements/Button/Button';
import { useTranslations } from 'next-intl';
import Checkbox from '../../Elements/Checkbox/Checkbox';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  loginWithEmailPassword,
  loginWithGoogle,
  signUpWithEmailPassword,
} from '@/services/server/auth/supertokens';
import { useUserStore } from '@/store';
import { useBreakpoints } from '@/hooks';
import { useSearchParams, useRouter as useNextRouter } from 'next/navigation';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface SignUp {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  privacy: boolean;
}

interface SignUpProps {
  redirectTo?: string;
}

function SignUp({ redirectTo }: SignUpProps) {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const searchParams = useSearchParams();
  const params = useMemo(() => searchParams.toString(), [searchParams]);
  const router = useRouter();
  const nextRouter = useNextRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { breakpoint } = useBreakpoints();
  const { refreshUser } = useUserStore();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<SignUp>();

  const handleSignUp: SubmitHandler<SignUp> = async (data) => {
    try {
      showLoading();
      const result = await signUpWithEmailPassword({
        ...data,
      });
      if (result.status === 'FIELD_ERROR') {
        const errorFields = result.formFields.map((field) => field.id);
        if (errorFields.includes('email')) {
          setError('email', {
            type: 'manual',
            message: t('invalidEmail'),
          });
        }
        if (errorFields.includes('password')) {
          setError('password', {
            type: 'manual',
            message: t('passwordFormatError'),
          });
        }
        trackEvent('signUpWithEmailFailed', {
          reason: 'server_validation_error',
        });
      }
      if (result.status === 'OK') {
        trackEvent('signUpWithEmailSuccess');
        await loginWithEmailPassword(data.email, data.password);
        await refreshUser();
        router.push('/verification-sent');
      }
    } catch {
      return;
    } finally {
      hideLoading();
    }
  };

  const handleSignUpError = () => {
    trackEvent('signUpWithEmailFailed', {
      reason: 'client_validation_error',
    });
  };

  const handleGoogleLogin = async () => {
    trackEvent('signUpWithGoogleButtonClicked');
    try {
      showLoading();
      await loginWithGoogle();
      await refreshUser();
      if (redirectTo) {
        nextRouter.push(redirectTo);
      } else {
        router.push('/');
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="h-[calc(100lvh-4.5rem)] w-full">
      <div className="absolute inset-0">
        <video muted playsInline autoPlay loop className="h-full w-full object-cover">
          <source src="/login/bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="container flex h-full items-center justify-center">
        <form
          onSubmit={handleSubmit(handleSignUp, handleSignUpError)}
          className={cn(
            'relative flex w-full max-w-126 flex-col gap-4 rounded-lg border-1 border-white/30 px-6 py-8 backdrop-blur-md',
            'md:gap-6 md:px-13 md:py-11',
          )}>
          <h1 className={cn('text-center text-3xl')}>{t('createAccount')}</h1>
          <GoogleButton
            size={breakpoint === 'md' ? 'small' : 'default'}
            onClick={handleGoogleLogin}
          />
          <div
            className={cn(
              'flex w-full items-center justify-center gap-3',
              'md:text-2xs',
              'lg:text-base',
            )}>
            <hr className="h-[0.5px] grow border-0 bg-white" />
            {tCommon('or')}
            <hr className="h-[0.5px] grow border-0 bg-white" />
          </div>
          <div className={cn('grid grid-cols-2 gap-x-5 gap-y-2.5', 'md:gap-x-11')}>
            <Input
              type="text"
              variant="transparent"
              {...register('firstName', {
                required: t('noFirstName'),
                minLength: { value: 2, message: t('noFirstName') },
              })}
              placeholder={tCommon('firstName')}
              id="name"
              size={breakpoint === 'md' ? 'small' : 'default'}
              error={!!errors.firstName}
              errorMessage={errors.firstName?.message}
            />
            <Input
              type="text"
              variant="transparent"
              {...register('lastName', {
                required: t('noLastName'),
                minLength: { value: 2, message: t('noLastName') },
              })}
              placeholder={tCommon('lastName')}
              id="surname"
              size={breakpoint === 'md' ? 'small' : 'default'}
              error={!!errors.lastName}
              errorMessage={errors.lastName?.message}
            />
            <Input
              type="text"
              variant="transparent"
              placeholder={tCommon('email')}
              id="email"
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
            <Input
              {...register('password', { required: t('invalidPassword') })}
              type="password"
              variant="transparent"
              placeholder={tCommon('password')}
              id="password"
              size={breakpoint === 'md' ? 'small' : 'default'}
              error={!!errors.password}
              errorMessage={errors.password?.message}
              allowReveal
            />
          </div>
          <div>
            <div className={cn('flex justify-between text-xs', 'md:text-2xs', 'lg:text-sm')}>
              <div className="flex items-center justify-center">
                <Controller
                  name="privacy"
                  control={control}
                  rules={{
                    validate: (v) => v || t('missingConsent'),
                  }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      checked={!!value}
                      id="privacy"
                      onCheckedChange={(v) => onChange(v === true)}
                    />
                  )}
                />

                <label htmlFor="privacy" className="ml-2">
                  {t.rich('consent', {
                    terms: (chunks) => (
                      <Link
                        href={`/legal/terms-of-service.pdf`}
                        className="underline"
                        target="_blank">
                        {chunks}
                      </Link>
                    ),
                    community: (chunks) => (
                      <Link
                        href={`/legal/community-guidelines.pdf`}
                        className="underline"
                        target="_blank">
                        {chunks}
                      </Link>
                    ),
                    gdpr: (chunks) => (
                      <Link href={`/legal/gdpr-member.pdf`} className="underline" target="_blank">
                        {chunks}
                      </Link>
                    ),
                  })}
                </label>
              </div>
            </div>
            {errors.privacy && (
              <div className="text-mauveine-100 mt-1 text-xs">{errors.privacy.message}</div>
            )}
          </div>
          <Button
            size={breakpoint === 'md' ? 'small' : 'default'}
            disabled={isLoading}
            onClick={() => trackEvent('signUpWithEmailButtonClicked')}>
            {tCommon('signUp')}
          </Button>
          <span className={cn('text-center text-sm', 'md:text-xs', 'lg:text-sm')}>
            {t('haveAccount')}
            <Link
              href={'/login' + (params ? `?${params}` : '')}
              className="ml-2 underline"
              onClick={() => trackEvent('signUpLoginLinkClicked')}>
              {tCommon('login')}
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

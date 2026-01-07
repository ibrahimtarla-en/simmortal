'use client';
import React, { useMemo } from 'react';
import GoogleButton from '../../Elements/GoogleButton/GoogleButton';
import { cn } from '@/utils/cn';
import Input from '../../Elements/Input/Input';
import { Link, useRouter } from '@/i18n/navigation';
import { useRouter as useNextRouter } from 'next/navigation';
import Button from '../../Elements/Button/Button';
import { useTranslations } from 'next-intl';
import { useForm, SubmitHandler } from 'react-hook-form';
import { loginWithEmailPassword, loginWithGoogle } from '@/services/server/auth/supertokens';
import { useUserStore } from '@/store';
import { useBreakpoints } from '@/hooks';
import { useSearchParams } from 'next/navigation';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  redirectTo?: string;
}

function Login({ redirectTo }: LoginProps) {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const searchParams = useSearchParams();
  const params = useMemo(() => searchParams.toString(), [searchParams]);
  const router = useRouter();
  const nextRouter = useNextRouter();
  const { breakpoint } = useBreakpoints();
  const { refreshUser } = useUserStore();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>();

  const handleLogin: SubmitHandler<LoginForm> = async (data) => {
    try {
      showLoading();
      const result = await loginWithEmailPassword(data.email, data.password);
      if (result.status === 'WRONG_CREDENTIALS_ERROR') {
        trackEvent('loginWithEmailFailed', { reason: 'server_validation_error' });
        setError('email', {
          type: 'manual',
          message: t('wrongCredentials'),
        });
        setError('password', {
          type: 'manual',
          message: t('wrongCredentials'),
        });
        return;
      }
      await refreshUser();
      if (redirectTo) {
        nextRouter.push(redirectTo);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      hideLoading();
    }
  };

  const handleLoginError = () => {
    trackEvent('loginWithEmailFailed', {
      reason: 'client_validation_error',
    });
  };

  const handleGoogleLogin = async () => {
    try {
      trackEvent('loginWithGoogleButtonClicked');
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
        <video muted autoPlay playsInline loop className="h-full w-full object-cover">
          <source src="/login/bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="container flex h-full items-center justify-center">
        <form
          onSubmit={handleSubmit(handleLogin, handleLoginError)}
          className={cn(
            'relative flex w-full max-w-126 flex-col gap-4 rounded-lg border-1 border-white/30 px-6 py-8 backdrop-blur-md',
            'md:gap-6 md:px-13 md:py-11',
          )}>
          <h1 className={cn('text-center text-3xl')}>{t('welcomeBack')}</h1>
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
          <div className={cn('flex flex-col gap-5', 'md:gap-11')}>
            <Input
              type="email"
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
              type="password"
              variant="transparent"
              placeholder={tCommon('password')}
              id="password"
              {...register('password', { required: t('invalidPassword') })}
              size={breakpoint === 'md' ? 'small' : 'default'}
              error={!!errors.password}
              errorMessage={errors.password?.message}
              allowReveal
            />
            <div className={cn('flex justify-end text-sm', 'md:text-xs', 'lg:text-sm')}>
              <Link
                href="/forgot-password"
                className="font-medium underline"
                onClick={() => trackEvent('loginForgotPasswordLinkClicked')}>
                {t('forgotPassword')}
              </Link>
            </div>
          </div>
          <Button
            size={breakpoint === 'md' ? 'small' : 'default'}
            onClick={() => {
              trackEvent('loginWithEmailButtonClicked');
            }}
            disabled={isLoading}>
            {tCommon('login')}
          </Button>
          <span className={cn('text-center text-sm', 'md:text-xs', 'lg:text-sm')}>
            {t('dontHaveAccount')}
            <Link
              href={'/signup' + (params ? `?${params}` : '')}
              className="ml-2 underline"
              onClick={() => trackEvent('loginCreateAccountLinkClicked')}>
              {t('createAccount')}
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Login;

'use client';
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import SquareModal from '@/components/Modals/SquareModal/SquareModal';
import PhoneInput from '@/components/Elements/PhoneInput/PhoneInput';
import Button from '@/components/Elements/Button/Button';
import Trash from '@/assets/icons/trash.svg';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@/utils/cn';
import OtpInput from '@/components/Elements/OtpInput/OtpInput';
import {
  consumePhoneNumberValidationCode,
  sendPhoneNumberValidationCode,
} from '@/services/server/user';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { useLocale } from 'next-intl';
import { SupportedLocale } from '@/i18n/routing';
import { EventParams, trackEvent } from '@/utils/analytics';

// Map supported locales to country codes
const localeToCountryMap: Record<SupportedLocale, CountryCode> = {
  en: 'US',
  tr: 'TR',
};

type PhoneValidationStep = 'initial' | 'otp' | 'success';

interface PhoneValidationModalProps {
  onSuccess: () => void;
  onClose: () => void;
  hideDescription?: boolean;
  sendButtonAnalytics?: {
    eventName: string;
    params?: EventParams;
  };
}

interface PhoneNumberForm {
  phoneNumber: string;
  country: CountryCode;
}

interface OtpCodeForm {
  code: string;
}

function PhoneValidationModal({
  onSuccess,
  onClose,
  hideDescription = false,
  sendButtonAnalytics,
}: PhoneValidationModalProps) {
  const [step, setStep] = useState<PhoneValidationStep>('initial');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations('PhoneNumberValidation');
  const tCommon = useTranslations('Common');
  const tPlaceholder = useTranslations('Placeholder');
  const tError = useTranslations('Error');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  // Map locale to country code using the locale mapping
  const defaultCountry = useMemo(() => {
    return localeToCountryMap[locale as SupportedLocale] || 'US';
  }, [locale]);

  const phoneNumberForm = useForm<PhoneNumberForm>({
    defaultValues: { phoneNumber: '', country: defaultCountry },
  });
  const otpCodeForm = useForm<OtpCodeForm>({ defaultValues: { code: '' } });
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const wrapperClass = useMemo(() => {
    return cn(
      'flex h-full w-full flex-col items-center justify-center gap-10 px-4',
      'md:gap-20 md:px-0',
    );
  }, []);

  const handlePhoneNumber = async (data: PhoneNumberForm) => {
    try {
      showLoading();
      if (sendButtonAnalytics) {
        trackEvent(sendButtonAnalytics.eventName, sendButtonAnalytics.params);
      }
      // Format the phone number with country calling code
      const callingCode = getCountryCallingCode(data.country);
      const formattedNumber = `+${callingCode}${data.phoneNumber}`;

      await sendPhoneNumberValidationCode(formattedNumber);
      setStep('otp');
      setPhoneNumber(formattedNumber);
    } catch {
      phoneNumberForm.setError('phoneNumber', { message: t('failedToSendCode') });
    } finally {
      hideLoading();
    }
  };

  const handleOtpCode = async (data: OtpCodeForm) => {
    if (!phoneNumber) {
      setStep('initial');
      return;
    }
    try {
      showLoading();
      await consumePhoneNumberValidationCode(phoneNumber, data.code);
      setStep('success');
      throw new Error('Not implemented');
    } catch {
      otpCodeForm.setError('code', { message: t('invalidCode') });
    } finally {
      hideLoading();
    }
  };

  return (
    <SquareModal open closable preventsPageScroll onCloseClicked={onClose}>
      <div className="h-full w-full">
        {step === 'initial' && (
          <form onSubmit={phoneNumberForm.handleSubmit(handlePhoneNumber)} className={wrapperClass}>
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className={cn('text-lg font-semibold', 'md:text-2xl')}>
                {t('enterPhoneNumberTitle')}
              </h1>
              <p className={cn('text-sm', 'md:text-lg')}>{t('enterPhoneNumberDescription')}</p>
            </div>
            <Controller
              name="phoneNumber"
              control={phoneNumberForm.control}
              rules={{
                required: t('phoneNumberIsRequired'),
                validate: () => {
                  if (!isPhoneValid) {
                    return tError('invalidPhoneNumber');
                  }
                  return true;
                },
              }}
              render={({ field: { value, onChange } }) => (
                <PhoneInput
                  wrapperClassName="w-full"
                  placeholder={tPlaceholder('phoneNumber')}
                  phoneNumber={value}
                  onPhoneNumberChange={onChange}
                  selectedCountry={phoneNumberForm.watch('country')}
                  onCountryChange={(country) => phoneNumberForm.setValue('country', country)}
                  onValidationChange={setIsPhoneValid}
                  error={!!phoneNumberForm.formState.errors.phoneNumber}
                  errorMessage={phoneNumberForm.formState.errors.phoneNumber?.message}
                  disabled={isLoading}
                  icon={
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        phoneNumberForm.setValue('phoneNumber', '');
                      }}>
                      <Trash />
                    </button>
                  }
                />
              )}
            />
            <Button disabled={isLoading}>{tCommon('send')}</Button>
          </form>
        )}
        {step === 'otp' && (
          <form
            onSubmit={otpCodeForm.handleSubmit(handleOtpCode)}
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-10 px-4',
              'md:gap-20 md:px-0',
            )}>
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className={cn('text-lg font-semibold', 'md:text-2xl')}>
                {t('enterPhoneNumberTitle')}
              </h1>
              <p className={cn('text-sm', 'md:text-lg')}>{t('enterYourCode')}</p>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-5">
              <Controller
                name="code"
                control={otpCodeForm.control}
                defaultValue=""
                rules={{ required: t('invalidCode'), minLength: 6, maxLength: 6 }}
                render={({ field: { value, onChange, ...field } }) => (
                  <OtpInput
                    value={value}
                    onChange={onChange}
                    {...field}
                    error={!!otpCodeForm.formState.errors.code}
                  />
                )}
              />
              <div className="h-4.5 text-sm">
                {!!otpCodeForm.formState.errors.code?.message ? (
                  <span className="text-mauveine-300">
                    {otpCodeForm.formState.errors.code?.message}
                  </span>
                ) : (
                  <div>
                    {t.rich('resendCode', {
                      resend: (chunks) => (
                        <button
                          className="text-mauveine-300 cursor-pointer"
                          onClick={() => {
                            if (phoneNumber) {
                              sendPhoneNumberValidationCode(phoneNumber);
                            }
                          }}>
                          {chunks}
                        </button>
                      ),
                    })}
                  </div>
                )}
              </div>
            </div>
            <Button disabled={isLoading}>{tCommon('verify')}</Button>
          </form>
        )}

        {step === 'success' && (
          <div
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-10 px-4',
              'md:gap-20 md:px-0',
            )}>
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className={cn('text-lg font-semibold', 'md:text-2xl')}>
                {t('verificationDoneTitle')}
              </h1>
              {!hideDescription && (
                <p className={cn('text-sm', 'md:text-lg')}>{t('verificationDoneMessage')}</p>
              )}
            </div>
            <Button disabled={isLoading} onClick={onSuccess}>
              {tCommon('continue')}
            </Button>
          </div>
        )}
      </div>
    </SquareModal>
  );
}

export default PhoneValidationModal;

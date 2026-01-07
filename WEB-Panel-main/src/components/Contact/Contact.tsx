'use client';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Input from '../Elements/Input/Input';
import TextArea from '../Elements/TextArea/TextArea';
import Button from '../Elements/Button/Button';
import { useUserStore } from '@/store';
import { Controller, useForm } from 'react-hook-form';
import { exists } from '@/utils/exists';
import { ContactForm } from '@/types/contact';
import { submitContactForm } from '@/services/server/contact';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useToast } from '@/hooks/useToast';
import { Link } from '@/i18n/navigation';
import Checkbox from '../Elements/Checkbox/Checkbox';

function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const tCommon = useTranslations('Common');
  const tPlaceholder = useTranslations('Placeholder');
  const tError = useTranslations('Error');
  const t = useTranslations('Contact');
  const { user } = useUserStore();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactForm) => {
    showLoading();
    try {
      await submitContactForm(data);
      setIsSubmitted(true);
      reset();
    } catch {
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
  }, [reset, user]);

  return (
    <section className="flex flex-col gap-5 py-5">
      <h1 className="font-serif text-2xl font-medium">{tCommon('contact')}</h1>
      <div className="mb-20 flex w-full gap-14">
        {!isSubmitted && (
          <form className="flex grow flex-col gap-9" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label={tCommon('firstName')}
              disabled={exists(user?.firstName) || isLoading}
              placeholder={tPlaceholder('firstName')}
              error={!!errors.firstName}
              errorMessage={errors.firstName?.message}
              {...register('firstName', {
                required: tError('invalidName'),
                validate: (value) => {
                  const trimmed = value.trim();
                  const tooShort = trimmed.length < 2;
                  const hasNumbers = /\d/.test(trimmed);
                  const lacksSpace = !/\s/.test(trimmed);
                  // Check minimum length
                  const isValid = !tooShort || !hasNumbers || !lacksSpace;
                  return isValid;
                },
              })}
            />
            <Input
              label={tCommon('lastName')}
              placeholder={tPlaceholder('lastName')}
              disabled={exists(user?.lastName) || isLoading}
              error={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              {...register('lastName', {
                required: tError('invalidName'),
                validate: (value) => {
                  const trimmed = value.trim();
                  const tooShort = trimmed.length < 2;
                  const hasNumbers = /\d/.test(trimmed);
                  const lacksSpace = !/\s/.test(trimmed);
                  // Check minimum length
                  const isValid = !tooShort || !hasNumbers || !lacksSpace;
                  return isValid;
                },
              })}
            />
            <Input
              label={tCommon('email')}
              placeholder={tPlaceholder('email')}
              disabled={exists(user?.email) || isLoading}
              error={!!errors.email}
              errorMessage={errors.email?.message}
              type="email"
              {...register('email', {
                required: tError('invalidEmail'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: tError('invalidEmail'),
                },
              })}
            />
            <Input
              label={tCommon('phoneNumber')}
              placeholder={tPlaceholder('phoneNumber')}
              disabled={exists(user?.phoneNumber) || isLoading}
              error={!!errors.phoneNumber}
              errorMessage={errors.phoneNumber?.message}
              type="tel"
              {...register('phoneNumber', {
                required: tError('invalidPhoneNumber'),
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: tError('invalidPhoneNumber'),
                },
              })}
            />
            <Controller
              control={control}
              name="message"
              rules={{
                validate: (v) => {
                  if (!v || v.trim().length < 10) {
                    return tError('messageTooShort');
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <div>
                  <TextArea
                    placeholder={tPlaceholder('message')}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.message}
                    disabled={isLoading}
                  />
                  {errors.message && (
                    <p className="text-mauveine-300 mt-2 text-xs">{errors.message.message}</p>
                  )}
                </div>
              )}
            />
            <div className="flex flex-col text-sm md:col-span-2">
              <div className="flex">
                <Controller
                  name="gdpr"
                  control={control}
                  rules={{
                    validate: (v) => v || t('missingGdpr'),
                  }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      checked={!!value}
                      id="gdpr"
                      onCheckedChange={(v) => onChange(v === true)}
                    />
                  )}
                />
                <label htmlFor="gdpr" className="ml-2">
                  {t.rich('gdpr', {
                    gdpr: (chunks) => (
                      <Link href={`/legal/gdpr-contact.pdf`} className="underline" target="_blank">
                        {chunks}
                      </Link>
                    ),
                  })}
                </label>
              </div>
              {errors.gdpr && (
                <div className="text-mauveine-100 mt-2 text-xs">{errors.gdpr.message}</div>
              )}
            </div>

            <Button className={cn('mt-11 self-start')} disabled={isLoading}>
              {tCommon('submit')}
            </Button>
          </form>
        )}
        {isSubmitted && (
          <div className="flex min-h-100 grow flex-col items-center justify-center gap-12 text-center">
            <h2 className="font-serif text-3xl font-medium">{t('success')}</h2>
            <Button role="link" href="/">
              {tCommon('homePage')}
            </Button>
          </div>
        )}
        <div className={cn('hidden w-130', '2xl:block')}>
          <Image
            src="/contact.jpg"
            alt={tCommon('contact')}
            width={776}
            height={750}
            sizes="520px"
            priority
          />
        </div>
      </div>
    </section>
  );
}

export default Contact;

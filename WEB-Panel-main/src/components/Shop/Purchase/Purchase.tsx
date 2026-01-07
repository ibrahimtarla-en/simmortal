'use client';
import Input from '@/components/Elements/Input/Input';
import { Order, ShopItem } from '@/types/shop';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import SearchMemorial from '@/components/Memorial/SearchMemorial/SearchMemorial';
import { PublishedMemorial } from '@/types/memorial';
import { exists } from '@/utils/exists';
import MemorialPortrait from '@/components/Memorial/MemorialPortrait/MemorialPortrait';
import Button from '@/components/Elements/Button/Button';
import Image from 'next/image';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';
import { Controller, useForm } from 'react-hook-form';
import Select from '@/components/Elements/Select/Select';
import { getLocalizedCountries } from '@/utils/localization/countries';
import { createOrder } from '@/services/server/shop';
import { Link, useRouter } from '@/i18n/navigation';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import Checkbox from '@/components/Elements/Checkbox/Checkbox';

interface PurchaseProps {
  product: ShopItem;
  quantity: number;
  order?: Order | null;
  memorial?: PublishedMemorial | null;
}

interface CreateOrderForm {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postCode: string;
  country: string;
  email: string;
  phoneNumber: string;
  memorialId: string;
  message: string;
  terms: boolean;
  gdpr: boolean;
}

function Purchase({ product, quantity, order, memorial }: PurchaseProps) {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Shop.Purchase');
  const tPlaceholder = useTranslations('Placeholder');
  const tError = useTranslations('Error');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const locale = useLocale();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [selectedMemorial, setSelectedMemorial] = useState<PublishedMemorial | null>(
    memorial ?? null,
  );

  const countries = useMemo(() => getLocalizedCountries(locale), [locale]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    resetField,
  } = useForm<CreateOrderForm>({
    defaultValues: { ...order },
  });

  const onSubmit = async (data: CreateOrderForm) => {
    try {
      showLoading();
      const { checkoutUrl } = await createOrder({
        itemId: product.id,
        quantity,
        ...data,
      });
      router.push(checkoutUrl);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (exists(selectedMemorial)) {
      setValue('memorialId', selectedMemorial.id);
    } else {
      resetField('memorialId');
    }
  }, [selectedMemorial, resetField, setValue]);
  return (
    <div className="flex flex-col gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('finalizeOrder')}</h1>

      <form className="rounded-lg bg-zinc-900 p-8" onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('grid gap-10', 'lg:grid-cols-[1fr_2.5fr]', 'xl:gap-20')}>
          <div className={cn('flex w-full flex-col gap-10', 'md:flex-row', 'lg:flex-col lg:gap-4')}>
            <div
              className={cn(
                'relative !aspect-[734/526] overflow-hidden rounded-lg',
                'md:h-40',
                'lg:h-auto lg:w-full',
              )}>
              {product.images.length > 0 && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  objectFit="cover"
                  priority
                  sizes="(min-width: 640px) 100vw, (min-width: 768px) 20rem, 28rem"
                />
              )}
            </div>
            <div className="flex flex-col justify-between gap-1 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="line-clamp-1 font-serif text-lg">{product.name}</p>
                <p className="text-sm">x&nbsp;{quantity}</p>
              </div>
              <hr className="mt-6 mb-2 text-zinc-600" />
              <div className="flex items-center justify-between">
                <p className="font-serif text-lg">{tCommon('total')}:</p>
                <p>{quantity * product.price}$</p>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-4 flex flex-col gap-4">
              <input
                type="hidden"
                {...register('memorialId', {
                  required: tError('missingRelation'),
                  validate: (value) => exists(value) || tError('missingMemorial'),
                })}
              />
              <h2 className="mb-3 font-serif text-xl">{t('memorialInfo')}</h2>
              {!exists(selectedMemorial) && (
                <div className="h-20">
                  <SearchMemorial
                    value={input}
                    onTextChange={setInput}
                    label={t('selectMemorial')}
                    onResultClicked={setSelectedMemorial}
                    error={!!errors.memorialId}
                    errorMessage={errors.memorialId?.message}
                    disabled={isLoading}
                  />
                </div>
              )}
              {exists(selectedMemorial) && (
                <div
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-10',
                    'md:h-20 md:w-full md:flex-row md:justify-between md:gap-4',
                  )}>
                  <div
                    className={cn(
                      'flex flex-col items-center gap-4',
                      'md:h-full md:flex-row md:gap-6',
                    )}>
                    <div className={cn('relative h-40', 'md:h-full')}>
                      <div className={cn('aspect-square h-full shrink-0')}>
                        <MemorialPortrait
                          imageUrl={selectedMemorial.imagePath}
                          name={selectedMemorial.name}
                          className="h-full shrink-0"
                        />
                      </div>
                    </div>
                    <div className={cn('flex flex-col')}>
                      <h3 className="font-serif text-xl">{selectedMemorial.name}</h3>
                      <p className="text-sm text-zinc-400">
                        {formatDate(selectedMemorial.dateOfBirth, 'YYYY', locale)} -{' '}
                        {formatDate(selectedMemorial.dateOfDeath, 'YYYY', locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      size="small"
                      variant="ghost"
                      role="link"
                      target="_blank"
                      href={`/memorial/${selectedMemorial.slug}`}>
                      {t('showMemorial')}
                    </Button>
                    <Button size="small" onClick={() => setSelectedMemorial(null)}>
                      {t('changeMemorial')}
                    </Button>
                  </div>
                </div>
              )}
              <hr className="text-zinc-600" />
              <h2 className="mb-3 font-serif text-xl">{t('addressInfo')}</h2>
              <div className={cn('flex flex-col gap-x-4 gap-y-8', 'md:grid md:grid-cols-2')}>
                <Input
                  label={tCommon('firstName')}
                  error={!!errors.firstName}
                  errorMessage={errors.firstName?.message}
                  placeholder={tPlaceholder('firstName')}
                  disabled={isLoading}
                  {...register('firstName', {
                    required: tError('invalidName'),
                    validate: (value) => {
                      const trimmed = value.trim();
                      const tooShort = trimmed.length < 5;
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
                  error={!!errors.lastName}
                  errorMessage={errors.lastName?.message}
                  placeholder={tPlaceholder('lastName')}
                  disabled={isLoading}
                  {...register('lastName', {
                    required: tError('invalidLastName'),
                    validate: (value) => {
                      const trimmed = value.trim();
                      const tooShort = trimmed.length < 5;
                      const hasNumbers = /\d/.test(trimmed);
                      const lacksSpace = !/\s/.test(trimmed);
                      // Check minimum length
                      const isValid = !tooShort || !hasNumbers || !lacksSpace;
                      return isValid;
                    },
                  })}
                />
                <Controller
                  name="country"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (!exists(v) || v.length === 0) {
                        return tError('missingCountry');
                      }
                      return true;
                    },
                  }}
                  render={({ field: { value, ...field } }) => (
                    <Select
                      id="country"
                      label={tCommon('country')}
                      options={countries}
                      placeholder={tPlaceholder('select')}
                      error={!!errors.country}
                      disabled={isLoading}
                      errorMessage={errors.country?.message}
                      value={value ?? ''}
                      {...field}
                    />
                  )}
                />
                <Input
                  label={tCommon('city')}
                  placeholder={tPlaceholder('city')}
                  error={!!errors.city}
                  errorMessage={errors.city?.message}
                  disabled={isLoading}
                  {...register('city', {
                    required: tError('invalidCity'),
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
                <div className="md:col-span-2">
                  <Input
                    label={tCommon('address')}
                    placeholder={tPlaceholder('address')}
                    error={!!errors.address}
                    errorMessage={errors.address?.message}
                    disabled={isLoading}
                    {...register('address', {
                      required: tError('invalidAddress'),
                      validate: (value) => {
                        const trimmed = value.trim();
                        const tooShort = trimmed.length < 10;
                        const lacksSpace = !/\s/.test(trimmed);
                        // Check minimum length
                        const isValid = !tooShort || !lacksSpace;
                        return isValid;
                      },
                    })}
                  />
                </div>
                <Input
                  label={tCommon('postCode')}
                  placeholder={tPlaceholder('postCode')}
                  error={!!errors.postCode}
                  errorMessage={errors.postCode?.message}
                  disabled={isLoading}
                  {...register('postCode', {
                    required: tError('invalidPostCode'),
                    validate: (value) => {
                      const trimmed = value.trim();
                      const tooShort = trimmed.length < 2;
                      const lacksSpace = !/\s/.test(trimmed);
                      // Check minimum length
                      const isValid = !tooShort || !lacksSpace;
                      return isValid;
                    },
                  })}
                />
                <Input
                  label={tCommon('state')}
                  placeholder={tPlaceholder('state')}
                  error={!!errors.state}
                  errorMessage={errors.state?.message}
                  disabled={isLoading}
                  {...register('state', {
                    required: tError('invalidState'),
                    validate: (value) => {
                      const trimmed = value.trim();
                      const tooShort = trimmed.length < 3;
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
                  type="email"
                  placeholder={tPlaceholder('email')}
                  error={!!errors.email}
                  errorMessage={errors.email?.message}
                  disabled={isLoading}
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
                  type="tel"
                  error={!!errors.phoneNumber}
                  errorMessage={errors.phoneNumber?.message}
                  disabled={isLoading}
                  placeholder={tPlaceholder('phoneNumber')}
                  {...register('phoneNumber', {
                    required: tError('invalidPhoneNumber'),
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: tError('invalidPhoneNumber'),
                    },
                  })}
                />
                <Input
                  label={tCommon('message')}
                  wrapperClassName="md:col-span-2"
                  error={!!errors.message}
                  errorMessage={errors.message?.message}
                  disabled={isLoading}
                  placeholder={tPlaceholder('message')}
                  {...register('message', {
                    required: false,
                    maxLength: {
                      value: 50,
                      message: tError('messageTooLong'),
                    },
                  })}
                />
              </div>
              <div className="mt-6 flex flex-col text-sm md:col-span-2">
                <div className="flex">
                  <Controller
                    name="terms"
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
                          href={`/legal/preliminary-information.pdf`}
                          className="underline"
                          target="_blank">
                          {chunks}
                        </Link>
                      ),
                      contract: (chunks) => (
                        <Link
                          href={`/legal/distance-sales.pdf`}
                          className="underline"
                          target="_blank">
                          {chunks}
                        </Link>
                      ),
                    })}
                  </label>
                </div>
                {errors.terms && (
                  <div className="text-mauveine-100 mt-2 text-xs">{errors.terms.message}</div>
                )}
              </div>
              <div className="mb-6 flex flex-col text-sm md:col-span-2">
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
                    {t.rich('gdprSales', {
                      gdpr: (chunks) => (
                        <Link href={`/legal/gdpr-sales.pdf`} className="underline" target="_blank">
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

              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {tCommon('continue')}
                </Button>
              </div>
              <div className="mt-2 flex justify-end">
                <Link
                  href="/legal/cancellation-policy.pdf"
                  target="_blank"
                  className="text-xs text-zinc-300 underline">
                  {t('cancellationTerms')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Purchase;

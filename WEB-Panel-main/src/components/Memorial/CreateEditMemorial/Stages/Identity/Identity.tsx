'use client';
import { Button, Input, DatePicker, FileUpload, Select } from '@/components';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MemorialPortrait from '../../../MemorialPortrait/MemorialPortrait';
import { useLocale } from 'next-intl';
import { useTranslations } from 'use-intl';
import { useSingleImageUpload } from '@/hooks';
import { getLocalizedCountries } from '@/utils/localization/countries';
import Close from '@/assets/icons/close.svg';
import {
  Memorial,
  MemorialIdentityForm,
  MemorialStatus,
  RELATION_TO_DECEASED,
} from '@/types/memorial';
import StageControls from '../../../StageControls';
import StageProgress from '../../StageProgress';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from '@/i18n/navigation';
import PhoneValidationModal from '../../../../PhoneValidationModal/PhoneValidationModal';
import { createMemorial, updateMemorialWithFile } from '@/services/client/memorial';
import { getUser } from '@/services/server/user';
import { usePathname } from 'next/navigation';
import { getOwnedMemorial } from '@/services/server/memorial';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import ImageCropModal from '@/components/Modals/ImageCropModal/ImageCropModal';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface IdentityProps {
  initialValues?: Memorial;
}

function Identity({ initialValues }: IdentityProps) {
  const locale = useLocale();
  const t = useTranslations('CreateMemorial.Stages.Identity');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const tPlaceholder = useTranslations('Placeholder');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [phoneNumberValidationActive, setPhoneValidationActive] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const upload = useSingleImageUpload({ requireCrop: true });
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const countries = useMemo(() => getLocalizedCountries(locale), [locale]);
  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
    setValue,
    reset,
    setError,
  } = useForm<MemorialIdentityForm>({
    defaultValues: mapInitialToDefaults(initialValues),
  });

  const onSubmit = async (data: MemorialIdentityForm) => {
    try {
      showLoading();
      const user = await getUser();
      if (!exists(user)) {
        router.push('/login');
        return;
      }

      if (data.dateOfBirth.getTime() >= data.dateOfDeath.getTime()) {
        setError('dateOfBirth', {
          type: 'manual',
          message: tError('birthAfterDeath'),
        });
        setError('dateOfDeath', {
          type: 'manual',
          message: tError('birthAfterDeath'),
        });
        return;
      }

      const requiresValidation = !exists(user.phoneNumber) || user?.phoneNumberVerified !== true;
      if (requiresValidation) {
        trackEvent('memorialIdentityPhoneValidationModalShown', { editingPublishedMemorial });
        setPhoneValidationActive(true);
        return;
      }

      // Prepare form data - use uploaded file or keep existing image
      const formData = {
        ...data,
        image: upload.file || undefined, // If no new file uploaded, this will be undefined
      };
      const isCreated = !exists(initialValues);
      if (isCreated) {
        const result = await createMemorial(formData);
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', `/memorial/edit/${result.id}/identity`);
        }
        router.push(`/memorial/edit/${result.id}/cover`);
      } else {
        await updateMemorialWithFile(initialValues.id, {
          ...formData,
          dateOfBirth: data.dateOfBirth?.toISOString(),
          dateOfDeath: data.dateOfDeath?.toISOString(),
        });
        trackEvent('memorialIdentityStageCompleted', { editingPublishedMemorial });
        if (editingPublishedMemorial) {
          toast({
            title: tCommon('updatesSavedTitle'),
            message: tCommon('updatesSavedDescription'),
          });
          router.push(`/memorial/edit/${initialValues.id}`);
        } else {
          router.push(`/memorial/edit/${initialValues.id}/cover`);
        }
      }
    } catch {
      trackEvent('memorialIdentityStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  // Helper function to determine if we have any image (uploaded or existing)
  const hasImage = upload.file || existingImageUrl;
  const displayImageUrl = upload.previewUrl || existingImageUrl;

  const handleRemoveImage = () => {
    upload.clearFiles();
    setExistingImageUrl(null);
    clearErrors('image');
  };

  // handle redirected with query param for name (from quick create)
  useEffect(() => {
    if (initialValues) {
      // Handle existing image
      if (initialValues.imagePath) {
        setExistingImageUrl(initialValues.imagePath);
      }
    } else {
      // If no initial values (creating new), check for name in query params
      const nameFromQuery = window?.location?.search
        ? new URLSearchParams(window.location.search).get('name') || ''
        : '';
      if (nameFromQuery) {
        setValue('name', nameFromQuery);
      }
    }
  }, [initialValues, reset, setValue]);

  useEffect(() => {
    if (initialValues) {
      return;
    }
    if (pathname.includes('/memorial/edit/')) {
      const idMatch = pathname.match(/\/memorial\/edit\/([^/]+)/);
      const id = idMatch ? idMatch[1] : null;
      if (!id) {
        return;
      }
      // Fetch the memorial data
      getOwnedMemorial(id).then((data) => {
        if (data) {
          reset(mapInitialToDefaults(data));
          if (data.imagePath) {
            setExistingImageUrl(data.imagePath);
          }
        }
      });
    }
  }, [pathname, initialValues, reset]);

  useEffect(() => {
    if (exists(upload.file)) {
      clearErrors('image');
      setExistingImageUrl(null); // Clear existing image when new one is uploaded
    }
    setValue('image', upload.file);
  }, [upload.file, clearErrors, setValue]);

  return (
    <>
      <StageProgress stage="identity" isEditing={editingPublishedMemorial} />
      <form
        ref={formRef}
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('flex grow flex-col gap-4', 'md:flex-row md:gap-6', '2xl:gap-17.5')}>
          <div className="relative">
            <Controller
              name="image"
              control={control}
              rules={{
                validate: () => {
                  if (!hasImage) {
                    return tError('missingPicture');
                  }
                  return true;
                },
              }}
              render={(field) => (
                <FileUpload
                  upload={upload}
                  className={cn('aspect-square', 'md:w-81', '2xl:w-107')}
                  {...field}
                  error={!!errors.image}
                  errorMessage={errors.image?.message}
                  disabled={!!hasImage || isLoading}
                  analytics={{
                    eventName: 'memorialIdentityPhotoUploadButtonClicked',
                    params: { editingPublishedMemorial },
                  }}>
                  {hasImage && displayImageUrl && (
                    <div className="relative">
                      <MemorialPortrait
                        imageUrl={displayImageUrl}
                        priority
                        sizes="(min-width: 640px) 100vw, (min-width: 768px) 20rem, 28rem"
                        name={upload.file?.name || initialValues?.name || ''}
                        className={cn(
                          'aspect-square shrink-0',
                          'md:h-81 md:w-81',
                          '2xl:h-107 2xl:w-107',
                        )}
                      />
                      <Button
                        icon={<Close />}
                        className="absolute top-1.5 right-1.5 z-9"
                        size="small"
                        onClick={handleRemoveImage}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </FileUpload>
              )}
            />
          </div>

          <div className="grid grow grid-cols-2 gap-x-5 gap-y-6">
            <Input
              id="memorial-name"
              label={t('whoIsMemorialFor')}
              wrapperClassName="col-span-2"
              error={!!errors.name}
              disabled={isLoading}
              errorMessage={errors.name?.message}
              placeholder={tPlaceholder('memorialPersonNamePlaceholder')}
              {...register('name', {
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
            <Controller
              name="dateOfBirth"
              control={control}
              rules={{
                validate: (v) => {
                  if (!exists(v)) {
                    return tError('invalidDateOfBirth');
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="dob"
                  label={tCommon('dateOfBirth')}
                  placeholder={tPlaceholder('dateOfBirthPlaceholder')}
                  popperPosition="left"
                  popperWrapperClassName="max-w-[calc(100vw-4rem)]"
                  error={!!errors.dateOfBirth}
                  errorMessage={errors.dateOfBirth?.message}
                  disabled={isLoading}
                  pastOnly
                  onDateChange={onChange}
                  date={value}
                />
              )}
            />
            <Controller
              name="dateOfDeath"
              control={control}
              rules={{
                validate: (v) => {
                  if (!exists(v)) {
                    return tError('invalidDateOfPassing');
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="dod"
                  label={tCommon('dateOfPassing')}
                  placeholder={tPlaceholder('dateOfPassingPlaceholder')}
                  popperPosition="right"
                  popperWrapperClassName="max-w-[calc(100vw-4rem)]"
                  error={!!errors.dateOfDeath}
                  errorMessage={errors.dateOfDeath?.message}
                  disabled={isLoading}
                  onDateChange={onChange}
                  date={value}
                  pastOnly
                />
              )}
            />
            <Input
              id="placeOfBirth"
              label={t('placeOfBirth')}
              error={!!errors.placeOfBirth}
              disabled={isLoading}
              errorMessage={errors.placeOfBirth?.message}
              placeholder={tPlaceholder('placeOfBirthPlaceholder')}
              {...register('placeOfBirth', {
                required: tError('invalidPlaceOfBirth'),
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
              id="placeOfDeath"
              label={t('placeOfDeath')}
              error={!!errors.placeOfDeath}
              disabled={isLoading}
              errorMessage={errors.placeOfDeath?.message}
              placeholder={tPlaceholder('placeOfDeathPlaceholder')}
              {...register('placeOfDeath', {
                required: tError('invalidPlaceOfDeath'),
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
            <Controller
              name="originCountry"
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
                  wrapperClassName={cn('col-span-2', '2xl:col-span-1')}
                  label={tCommon('nationality')}
                  options={countries}
                  placeholder={tPlaceholder('select')}
                  error={!!errors.originCountry}
                  disabled={isLoading}
                  errorMessage={errors.originCountry?.message}
                  value={value ?? ''}
                  {...field}
                />
              )}
            />
            <Controller
              name="ownerRelation"
              control={control}
              rules={{
                validate: (v) => {
                  if (!exists(v) || v.length === 0) {
                    return tError('missingRelation');
                  }
                  return true;
                },
              }}
              render={({ field: { value, ...field } }) => (
                <Select
                  id="relation"
                  wrapperClassName={cn('col-span-2', '2xl:col-span-1')}
                  label={t('relation')}
                  options={RELATION_TO_DECEASED.map((relation) => ({
                    value: relation,
                    label: t(`Relation.${relation}`),
                  }))}
                  error={!!errors.ownerRelation}
                  errorMessage={errors.ownerRelation?.message}
                  disabled={isLoading}
                  placeholder={tPlaceholder('select')}
                  value={value ?? ''}
                  {...field}
                />
              )}
            />
            <p className="col-span-2 text-sm leading-4.5 text-zinc-400 italic">{t('disclaimer')}</p>
          </div>
        </div>
        <StageControls
          disabled={isLoading}
          previousButtonLabel={editingPublishedMemorial ? tCommon('back') : undefined}
          onPrevious={
            editingPublishedMemorial && initialValues
              ? () => {
                  router.push(`/memorial/edit/${initialValues.id}`);
                }
              : undefined
          }
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('save')}
          onNext={() =>
            trackEvent('memorialIdentityNextButtonClicked', { editingPublishedMemorial })
          }
        />
      </form>
      {upload.pendingCropUrl && upload.pendingCropFile && (
        <ImageCropModal
          imageUrl={upload.pendingCropUrl}
          fileName={upload.pendingCropFile.name}
          onCropComplete={upload.handleCropComplete}
          onClose={upload.handleCropCancel}
          onCropCancel={upload.clearFiles}
        />
      )}
      {phoneNumberValidationActive && (
        <PhoneValidationModal
          onSuccess={() => {
            trackEvent('memorialIdentityPhoneValidationModalSuccess', { editingPublishedMemorial });
            setPhoneValidationActive(false);
            formRef.current?.requestSubmit();
          }}
          onClose={() => {
            trackEvent('memorialIdentityPhoneValidationModalClosed', { editingPublishedMemorial });
            setPhoneValidationActive(false);
          }}
          sendButtonAnalytics={{
            eventName: 'memorialIdentityPhoneValidationSendButtonClicked',
            params: { editingPublishedMemorial },
          }}
        />
      )}
    </>
  );
}

export default Identity;

function mapInitialToDefaults(initialValues?: Memorial): Partial<MemorialIdentityForm> {
  if (!initialValues) return {};
  return {
    name: initialValues.name ?? '',
    dateOfBirth: initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth) : undefined,
    dateOfDeath: initialValues.dateOfDeath ? new Date(initialValues.dateOfDeath) : undefined,
    originCountry: initialValues.originCountry ?? undefined,
    ownerRelation: initialValues.ownerRelation ?? undefined,
    placeOfBirth: initialValues.placeOfBirth ?? '',
    placeOfDeath: initialValues.placeOfDeath ?? '',
    image: undefined,
  };
}

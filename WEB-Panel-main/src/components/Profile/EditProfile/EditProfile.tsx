'use client';
import Button from '@/components/Elements/Button/Button';
import DatePicker from '@/components/Elements/Datepicker/Datepicker';
import FileUpload from '@/components/Elements/FileUpload/FileUpload';
import Input from '@/components/Elements/Input/Input';
import Select from '@/components/Elements/Select/Select';
import { useSingleImageUpload } from '@/hooks';
import { SimmortalsUser } from '@/types/user';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import { getLocalizedCountries } from '@/utils/localization/countries';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Close from '@/assets/icons/close.svg';
import { updateUserWithFile } from '@/services/client/user';
import { useRouter } from '@/i18n/navigation';
import PhoneValidationModal from '@/components/PhoneValidationModal/PhoneValidationModal';
import DeleteAccountModal from './DeleteAccountModal/DeleteAccountModal';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { useToast } from '@/hooks/useToast';
import ImageCropModal from '@/components/Modals/ImageCropModal/ImageCropModal';

interface EditProfileForm {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  location: string;
  profileImage: File;
}

interface EditProfileProps {
  initialUser: SimmortalsUser;
}

function EditProfile({ initialUser }: EditProfileProps) {
  const tCommon = useTranslations('Common');
  const tPlaceholder = useTranslations('Placeholder');
  const tError = useTranslations('Error');
  const t = useTranslations('Profile');
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [phoneNumberValidationActive, setPhoneValidationActive] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  const upload = useSingleImageUpload({ requireCrop: true });
  const locale = useLocale();
  const router = useRouter();

  const hasImage = upload.file || existingImageUrl;
  const displayImageUrl = upload.previewUrl || existingImageUrl;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileForm>({
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      location: initialUser.location || undefined,
      dateOfBirth: initialUser.dateOfBirth ? new Date(initialUser.dateOfBirth) : undefined,
    },
  });

  const countries = useMemo(() => getLocalizedCountries(locale), [locale]);

  const handleRemoveImage = () => {
    upload.clearFiles();
    setExistingImageUrl(null);
  };

  const onSubmit = async (data: EditProfileForm) => {
    try {
      showLoading();
      await updateUserWithFile({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth?.toISOString().split('T')[0],
        location: data.location,
        image: upload.file,
        deleteAsset: !upload.file && existingImageUrl === null,
      });
      toast({ title: t('changesSavedTitle'), message: t('changesSavedDescription') });
      router.push('/profile');
    } catch {
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  // handle redirected with query param for name (from quick create)
  useEffect(() => {
    // Handle existing image
    if (initialUser.profilePictureUrl) {
      setExistingImageUrl(initialUser.profilePictureUrl);
    }
  }, [initialUser]);

  return (
    <div>
      <h1 className="my-5 font-serif text-2xl font-medium">{tCommon('profile')}</h1>
      <form
        className={cn('rounded-lg bg-zinc-900 p-4', '2xl:rounded-2xl 2xl:p-12')}
        onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('flex flex-col gap-10', 'md:flex-row md:gap-6', '2xl:gap-14')}>
          <div className={cn('aspect-square', 'md:w-81', '2xl:w-107')}>
            <FileUpload upload={upload} className={cn('aspect-square')} disabled={isLoading}>
              {hasImage && displayImageUrl && (
                <div className="aspect-square rounded-lg bg-zinc-600 p-3.5">
                  <div className="relative h-full w-full bg-black">
                    <Image
                      fill
                      src={displayImageUrl}
                      alt="Profile Picture"
                      className="object-cover"
                    />
                    <Button
                      icon={<Close />}
                      className="absolute -top-2 -right-2 z-9"
                      size="small"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </FileUpload>
          </div>
          <div className={cn('grid grow grid-cols-1 gap-6', '2xl:grid-cols-2 2xl:gap-y-12')}>
            <Input
              label={tCommon('firstName')}
              placeholder={tPlaceholder('firstName')}
              disabled={isLoading}
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
              disabled={isLoading}
              error={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              {...register('lastName', {
                required: tError('invalidLastName'),
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
              name="dateOfBirth"
              control={control}
              disabled={isLoading}
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
                  popperPosition="right"
                  popperWrapperClassName="max-w-[calc(100vw-4rem)]"
                  error={!!errors.dateOfBirth}
                  errorMessage={errors.dateOfBirth?.message}
                  disabled={isLoading}
                  onDateChange={onChange}
                  date={value}
                  pastOnly
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              disabled={isLoading}
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
                  id="location"
                  label={tCommon('location')}
                  options={countries}
                  placeholder={tPlaceholder('select')}
                  error={!!errors.location}
                  disabled={isLoading}
                  errorMessage={errors.location?.message}
                  value={value ?? ''}
                  {...field}
                />
              )}
            />
            <Input value={initialUser.email} disabled label={tCommon('email')} />
            <div className="flex items-center gap-5">
              <div className="grow">
                <Input
                  placeholder={tPlaceholder('phoneNumber')}
                  label={tCommon('phoneNumber')}
                  disabled
                  className="block"
                  value={initialUser.phoneNumber ?? ''}
                />
              </div>
              <Button
                size="small"
                type="button"
                className="mt-4.5"
                onClick={() => setPhoneValidationActive(true)}>
                {tCommon('change')}
              </Button>
            </div>
            <div
              className={cn(
                'mt-10 flex items-center justify-center',
                'md: md:justify-end',
                '2xl:col-span-2',
              )}>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={() => {
                  setDeleteAccountModalOpen(true);
                }}>
                {t('deleteAccount')}
              </Button>
              <Button disabled={isLoading}>{tCommon('save')}</Button>
            </div>
          </div>
        </div>
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
          hideDescription
          onSuccess={() => {
            router.refresh();
            setPhoneValidationActive(false);
          }}
          onClose={() => {
            setPhoneValidationActive(false);
          }}
        />
      )}
      <DeleteAccountModal
        open={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
      />
    </div>
  );
}

export default EditProfile;

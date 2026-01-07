'use client';
import { Button, DatePicker, FileUpload, TextArea } from '@/components';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import MemorialPortrait from '../../../../MemorialPortrait/MemorialPortrait';
import { useTranslations } from 'use-intl';
import { useSingleMediaUpload } from '@/hooks';
import Close from '@/assets/icons/close.svg';

import { Controller, useForm } from 'react-hook-form';
import { useRouter } from '@/i18n/navigation';
import { getUser } from '@/services/server/user';
import StageControls from '../../../../StageControls';
import PhoneValidationModal from '@/components/PhoneValidationModal/PhoneValidationModal';
import { isMemoryWithAsset, Memory, MemoryAboutForm } from '@/types/memory';
import { createMemory, updateMemoryWithFile } from '@/services/client/memory';
import { AssetType } from '@/types/asset';
import { useMemoryAsset } from '@/hooks/useMemoryAsset';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import ImageCropModal from '@/components/Modals/ImageCropModal/ImageCropModal';
import { MemorialContributionStatus } from '@/types/contribution';

interface AboutProps {
  initialValue?: Memory;
  slug: string;
}

function About({ initialValue, slug }: AboutProps) {
  const t = useTranslations('CreateMemory.Stages.About');
  const tError = useTranslations('Error');
  const tCommon = useTranslations('Common');
  const tPlaceholder = useTranslations('Placeholder');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [phoneNumberValidationActive, setPhoneValidationActive] = useState(false);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [existingAssetType, setExistingAssetType] = useState<AssetType | null>(null);

  const upload = useSingleMediaUpload({ requireCrop: true });
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<MemoryAboutForm>({
    defaultValues: mapInitialToDefaults(initialValue),
  });

  const isEditing = useMemo(() => {
    return initialValue?.status === MemorialContributionStatus.PUBLISHED;
  }, [initialValue]);

  const { withAsset } = useMemoryAsset(initialValue);

  useEffect(() => {
    if (withAsset) {
      setExistingMediaUrl(withAsset.assetPath);
      setExistingAssetType(withAsset.assetType);
    }
  }, [withAsset]);

  const onSubmit = async (data: MemoryAboutForm) => {
    try {
      showLoading();
      const user = await getUser();
      if (!exists(user)) {
        router.push('/login');
        return;
      }

      const requiresValidation = !exists(user.phoneNumber) || user?.phoneNumberVerified !== true;
      if (requiresValidation) {
        trackEvent('memoryAboutPhoneValidationModalShown', { isEditing });
        setPhoneValidationActive(true);
        return;
      }

      const isCreated = !exists(initialValue);
      if (isCreated) {
        const result = await createMemory(slug, {
          ...data,
          asset: upload.file || undefined,
        });
        trackEvent('memoryAboutStageCompleted', {
          isEditing: false,
          hasAsset: !!upload.file,
        });
        if (typeof window !== 'undefined') {
          window.history.replaceState(
            {},
            '',
            `/memorial/contribute/${slug}/memory/edit/${result.id}/about`,
          );
        }
        router.push(`/memorial/contribute/${slug}/memory/edit/${result.id}/tribute`);
      } else {
        const deleteAsset =
          upload.previewUrl || (existingMediaUrl === null && isMemoryWithAsset(initialValue));
        await updateMemoryWithFile(slug, initialValue.id, {
          content: data.content,
          date: data.date?.toString(),
          asset: upload.file || undefined,
          deleteAsset: deleteAsset === true ? true : undefined,
        });
        trackEvent('memoryAboutStageCompleted', {
          isEditing,
          hasAsset: !!upload.file || !!existingMediaUrl,
        });
        if (isEditing) {
          router.push(`/memorial/${slug}`);
        } else {
          router.push(`/memorial/contribute/${slug}/memory/edit/${initialValue.id}/tribute`);
        }
      }
    } catch (error) {
      trackEvent('memoryAboutStageFailed', {
        isEditing,
        hasAsset: !!upload.file || !!existingMediaUrl,
      });
      throw error;
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    if (exists(upload.file)) {
      clearErrors('asset');
      setExistingMediaUrl(null); // Clear existing image when new one is uploaded
    }
    setValue('asset', upload.file);
  }, [upload.file, clearErrors, setValue]);

  // Helper function to determine if we have any image (uploaded or existing)
  const hasMedia = upload.file || existingMediaUrl;
  const displayMediaUrl = upload.previewUrl || existingMediaUrl;
  const fileType = upload.type || existingAssetType;

  const handleRemoveImage = () => {
    upload.clearFiles();
    setExistingMediaUrl(null);
    clearErrors('asset');
  };

  return (
    <div>
      <form
        ref={formRef}
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('flex grow flex-col gap-10', '2xl:gap-17.5')}>
          <div
            className={cn(
              'flex grow flex-col gap-10',
              'xl:mx-10 xl:my-3.5 xl:flex-row',
              '2xl:mx-6',
            )}>
            {(!isEditing || (hasMedia && displayMediaUrl)) && (
              <div className={cn('mx-auto', 'xl:mx-0')}>
                <Controller
                  name="asset"
                  control={control}
                  disabled={isLoading || isEditing}
                  render={(field) => (
                    <FileUpload
                      upload={upload}
                      className={cn('aspect-square w-81', '2xl:w-107')}
                      {...field}
                      error={!!errors.asset}
                      errorMessage={errors.asset?.message}
                      disabled={!!hasMedia || isLoading || isEditing}>
                      {hasMedia && displayMediaUrl && (
                        <div className="relative">
                          <MemorialPortrait
                            imageUrl={displayMediaUrl}
                            priority
                            fileType={fileType ?? undefined}
                            name={upload.file?.name || initialValue?.date || ''}
                            className={cn(
                              'aspect-square h-81 w-81 shrink-0',
                              '2xl:h-107 2xl:w-107',
                            )}
                          />
                          {!isEditing && (
                            <Button
                              icon={<Close />}
                              className="absolute top-1.5 right-1.5 z-11"
                              size="small"
                              onClick={handleRemoveImage}
                              disabled={isLoading}
                            />
                          )}
                          {upload.error && (
                            <div
                              className={cn('w-81 px-[5.62%] text-sm text-red-500', '2xl:w-107')}>
                              {upload.error}
                            </div>
                          )}
                        </div>
                      )}
                    </FileUpload>
                  )}
                />
              </div>
            )}

            <div className={cn('flex w-full flex-col', '2xl:my-10')}>
              <Controller
                name="date"
                control={control}
                rules={{
                  validate: (v) => {
                    if (!exists(v)) {
                      return t('invalidDateOfMemory');
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    id="dod"
                    placeholder={tPlaceholder('dateOfMemory')}
                    popperPosition="right"
                    popperWrapperClassName="max-w-[calc(100vw-4rem)]"
                    error={!!errors.date}
                    errorMessage={errors.date?.message}
                    disabled={isLoading}
                    onDateChange={onChange}
                    date={value}
                    pastOnly
                    wrapperClassName="mb-6"
                  />
                )}
              />
              <Controller
                name="content"
                control={control}
                rules={{
                  required: tError('messageTooShort'),
                  validate: (value) => {
                    if (value.trim().length < 3) {
                      return tError('messageTooShort');
                    }
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextArea
                      className="flex h-full w-full flex-col justify-between"
                      placeholder={tPlaceholder('userPromptMemory')}
                      value={value}
                      onChange={onChange}
                      maxChars={2000}
                      error={!!errors.content}
                    />

                    <p className="text-mauveine-300 mt-2 text-xs">
                      {errors?.content ? errors.content.message : ''}
                    </p>
                  </>
                )}
              />
            </div>
          </div>
          <p className="text-center text-xs text-zinc-300">{tCommon('contributionDisclaimer')}</p>
          <StageControls
            disabled={isLoading}
            nextButtonLabel={isEditing ? tCommon('save') : tCommon('continue')}
            onNext={() => {
              trackEvent('memoryAboutNextButtonClicked', {
                isEditing,
              });
            }}
            onPrevious={() => {
              trackEvent('memoryAboutBackButtonClicked', { isEditing });
              router.replace(`/memorial/${slug}`);
            }}
            previousButtonLabel={tCommon('back')}
          />
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
          onSuccess={() => {
            trackEvent('memoryAboutPhoneValidationModalSuccess', { isEditing });
            setPhoneValidationActive(false);
            formRef.current?.requestSubmit();
          }}
          onClose={() => {
            trackEvent('memoryAboutPhoneValidationModalClosed', { isEditing });
            setPhoneValidationActive(false);
          }}
          sendButtonAnalytics={{
            eventName: 'memoryAboutPhoneValidationSendButtonClicked',
            params: { isEditing },
          }}
        />
      )}
    </div>
  );
}

export default About;

function mapInitialToDefaults(initialValue?: Memory): Partial<MemoryAboutForm> {
  if (!initialValue) return {};
  return {
    date: initialValue.date ? new Date(initialValue.date) : undefined,
    content: initialValue.content,
    asset: undefined,
  };
}

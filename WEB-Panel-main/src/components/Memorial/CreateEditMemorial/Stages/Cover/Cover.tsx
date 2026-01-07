'use client';
import { Button, FileUpload } from '@/components';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'use-intl';
import { useSingleImageUpload } from '@/hooks';
import Close from '@/assets/icons/close.svg';
import { Memorial, MemorialStatus } from '@/types/memorial';
import StageControls from '../../../StageControls';
import StageProgress from '../../StageProgress';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from '@/i18n/navigation';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import ImageCropModal from '@/components/Modals/ImageCropModal/ImageCropModal';
import Image from 'next/image';
import { updateMemorialWithFile } from '@/services/client/memorial';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface MemorialCoverForm {
  coverImage: File;
}

interface CoverProps {
  initialValues: Memorial;
}

function Cover({ initialValues }: CoverProps) {
  const t = useTranslations('CreateMemorial.Stages.Cover');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const upload = useSingleImageUpload({ requireCrop: true });
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const {
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MemorialCoverForm>({});

  const onSubmit = async (data: MemorialCoverForm) => {
    try {
      showLoading();
      trackEvent('memorialCoverNextButtonClicked', { editingPublishedMemorial });
      if (upload.file) {
        await updateMemorialWithFile(initialValues.id, data);
      }
      trackEvent('memorialCoverStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        if (upload.file) {
          toast({
            title: tCommon('updatesSavedTitle'),
            message: tCommon('updatesSavedDescription'),
          });
        }
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/about`);
      }
    } catch {
      trackEvent('memorialCoverStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  const hasImage = upload.file || existingImageUrl;
  const displayImageUrl = upload.previewUrl || existingImageUrl;

  const handleRemoveImage = () => {
    upload.clearFiles();
    setExistingImageUrl(null);
    clearErrors('coverImage');
  };

  // handle redirected with query param for name (from quick create)
  useEffect(() => {
    if (initialValues) {
      // Handle existing image
      if (initialValues.coverImagePath) {
        setExistingImageUrl(initialValues.coverImagePath);
      }
    }
  }, [initialValues, reset, setValue]);

  useEffect(() => {
    if (exists(upload.file)) {
      clearErrors('coverImage');
      setExistingImageUrl(null); // Clear existing image when new one is uploaded
    }
    setValue('coverImage', upload.file);
  }, [upload.file, clearErrors, setValue]);
  return (
    <>
      <StageProgress stage="cover" isEditing={editingPublishedMemorial} />
      <form
        ref={formRef}
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <p className="text-center text-lg">{t('stageDescription')}</p>
        <div className="relative mx-auto mb-4 aspect-video w-full max-w-208 p-0">
          <Controller
            name="coverImage"
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
                className={cn('mx-auto aspect-video w-full')}
                {...field}
                error={!!errors.coverImage}
                errorMessage={errors.coverImage?.message}
                disabled={!!hasImage || isLoading}
                analytics={{
                  eventName: 'memorialCoverPhotoUploadClicked',
                  params: { editingPublishedMemorial },
                }}>
                {hasImage && displayImageUrl && (
                  <div className="relative aspect-video">
                    <Image
                      src={displayImageUrl}
                      alt="cover-image"
                      fill
                      className="rounded-md object-cover"
                    />
                    <Button
                      icon={<Close />}
                      className="absolute -top-1.5 -right-1.5 z-9"
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
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
        />
      </form>
      {upload.pendingCropUrl && upload.pendingCropFile && (
        <ImageCropModal
          imageUrl={upload.pendingCropUrl}
          fileName={upload.pendingCropFile.name}
          onCropComplete={upload.handleCropComplete}
          onClose={upload.handleCropCancel}
          onCropCancel={upload.clearFiles}
          aspectRatio={16 / 9}
        />
      )}
    </>
  );
}

export default Cover;

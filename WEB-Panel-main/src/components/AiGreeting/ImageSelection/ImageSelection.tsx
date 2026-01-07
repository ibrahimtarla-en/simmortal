'use client';
import AudioPlayer from '@/components/Elements/AudioPlayer/AudioPlayer';
import Button from '@/components/Elements/Button/Button';
import FileUpload from '@/components/Elements/FileUpload/FileUpload';
import { useSingleImageUpload } from '@/hooks';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import Close from '@/assets/icons/close.svg';
import { resetAiMemorialGreetingCreation } from '@/services/server/memorial';
import { PublishedMemorial } from '@/types/memorial';
import { useToast } from '@/hooks/useToast';
import { uploadAiGreetingImage } from '@/services/client/memorial';
import ImageCropModal from '@/components/Modals/ImageCropModal/ImageCropModal';

interface ImageSelectionProps {
  audioPath: string;
  memorial: PublishedMemorial;
  onComplete?: () => Promise<void>;
}

interface AiGreetingImageForm {
  image: File;
}

function ImageSelection({ audioPath, onComplete, memorial }: ImageSelectionProps) {
  const t = useTranslations('AiGreeting.ImageSelection');
  const tError = useTranslations('Error');
  const tCommon = useTranslations('Common');
  const upload = useSingleImageUpload({ requireCrop: true });
  const { toast } = useToast();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const {
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<AiGreetingImageForm>({});

  const handleRemoveImage = () => {
    upload.clearFiles();
    clearErrors('image');
  };

  const handleReset = async () => {
    showLoading();
    try {
      await resetAiMemorialGreetingCreation(memorial.id);
      upload.clearFiles();
      await onComplete?.();
    } catch (err) {
      console.log(err);
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  const onSubmit = async () => {
    try {
      showLoading();
      await uploadAiGreetingImage(memorial.id, upload.file);
      await onComplete?.();
    } catch {
      toast({ message: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  return (
    <section className="flex flex-col justify-around gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
      <form
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="image"
          control={control}
          rules={{
            validate: () => {
              if (!upload.file) {
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
              error={!!errors.image}
              errorMessage={errors.image?.message}
              disabled={isLoading}>
              {upload.previewUrl && (
                <div className="relative aspect-video">
                  <Image
                    src={upload.previewUrl}
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
        <AudioPlayer audioUrl={audioPath} />
        <div className="my-5 flex justify-center gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleReset} type="button">
              {tCommon('reset')}
            </Button>
            <Button type="submit">{tCommon('continue')}</Button>
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
          aspectRatio={16 / 9}
        />
      )}
    </section>
  );
}

export default ImageSelection;

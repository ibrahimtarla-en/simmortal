'use client';
import { Memorial, MemorialStatus } from '@/types/memorial';
import React, { useEffect, useMemo, useState } from 'react';
import StageProgress from '../../StageProgress';
import { cn } from '@/utils/cn';
import StageControls from '../../../StageControls';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Input from '@/components/Elements/Input/Input';
import PremiumTag from '@/components/Elements/PremiumTag/PremiumTag';
import { Controller, useForm } from 'react-hook-form';
import Switch from '@/components/Elements/Switch/Switch';
import RadioButton from '@/components/Elements/RadioButton/RadioButton';
import RadioGroup from '@/components/Elements/RadioButton/RadioGroup';
import { checkSlugAvailability, updateMemorial } from '@/services/server/memorial';
import CustomUrlPreview from '@/components/Memorial/CustomUrlPreview/CustomUrlPreview';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { trackEvent } from '@/utils/analytics';
import { useToast } from '@/hooks/useToast';

interface SlugProps {
  initialValues: Memorial;
}

interface UrlForm {
  premiumSlug: string;
  unlisted: boolean;
}

function Slug({ initialValues }: SlugProps) {
  const [slugMode, setSlugMode] = useState<'default' | 'premium'>(
    initialValues.premiumSlug ? 'premium' : 'default',
  );
  const tCommon = useTranslations('Common');
  const t = useTranslations('CreateMemorial.Stages.Url');
  const router = useRouter();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();
  const { toast } = useToast();

  const editingPublishedMemorial = useMemo(() => {
    return initialValues?.status === MemorialStatus.PUBLISHED;
  }, [initialValues]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<UrlForm>({
    defaultValues: {
      premiumSlug: initialValues.premiumSlug || initialValues.recommendedSlug || '',
      unlisted: initialValues.unlisted || false,
    },
  });

  const onSubmit = async (data: UrlForm) => {
    try {
      showLoading();
      trackEvent('memorialSlugNextButtonClicked', { editingPublishedMemorial });
      trackEvent('memorialSlugUrlSelected', {
        editingPublishedMemorial,
        urlType: slugMode,
        isUnlisted: data.unlisted,
      });
      if (slugMode === 'default') {
        await updateMemorial(initialValues.id, {
          premiumSlug: null,
          unlisted: data.unlisted,
        });
      } else {
        const { isAvailable } = await checkSlugAvailability(
          data.premiumSlug.trim(),
          initialValues.id,
        );

        if (!isAvailable) {
          setError('premiumSlug', { message: t('urlNotAvailable') });
          return;
        }
        await updateMemorial(initialValues.id, {
          premiumSlug: data.premiumSlug.trim(),
          unlisted: data.unlisted,
        });
      }
      trackEvent('memorialSlugStageCompleted', { editingPublishedMemorial });
      if (editingPublishedMemorial) {
        toast({ title: tCommon('updatesSavedTitle'), message: tCommon('updatesSavedDescription') });
        router.push(`/memorial/edit/${initialValues.id}`);
      } else {
        router.push(`/memorial/edit/${initialValues.id}/live-portrait`);
      }
    } catch {
      trackEvent('memorialSlugStageFailed', { editingPublishedMemorial });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (slugMode === 'default') {
      setValue('unlisted', false);
    }
  }, [setValue, slugMode]);

  return (
    <>
      <StageProgress stage="url" isEditing={editingPublishedMemorial} />
      <form
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col items-center justify-center">
          <p className="mb-5 text-center text-lg">{t('stageDescription')}</p>
          <CustomUrlPreview
            slug={slugMode === 'default' ? initialValues.defaultSlug : watch('premiumSlug')}
          />
          <RadioGroup
            className={cn('w-full px-8 py-13', 'md:max-w-92 md:py-21', 'xl:max-w-130 xl:py-23')}
            defaultValue="default"
            value={slugMode}
            onValueChange={(value) => setSlugMode(value as 'default' | 'premium')}>
            <div className="flex w-full flex-col gap-16">
              <div className={cn('flex items-start gap-2.5')}>
                <div
                  className={cn(
                    'mt-4 flex items-center gap-4 text-left font-light',
                    'md:mt-0 md:mb-0 md:h-11',
                  )}>
                  <RadioButton value="default" id="default" />
                </div>
                <div className="relative grow">
                  <PremiumTag
                    isPremium={false}
                    className="absolute top-0 left-1.5 z-99 -translate-y-2/3"
                  />
                  <label
                    className="flex h-11 items-center rounded-lg bg-zinc-800 px-4 font-light"
                    htmlFor="default">
                    {initialValues.defaultSlug}
                  </label>
                </div>
              </div>
              <div className={cn('flex items-start gap-2.5')}>
                <div
                  className={cn(
                    'mt-4 flex items-center gap-4 text-left font-light',
                    'md:mt-0 md:mb-0 md:h-11',
                  )}>
                  <RadioButton value="premium" id="premium" />
                </div>
                <div className="relative flex grow flex-col gap-3">
                  <PremiumTag
                    isPremium={true}
                    className="absolute top-0 left-1.5 z-99 -translate-y-2/3"
                  />
                  <Input
                    error={!!errors.premiumSlug}
                    errorMessage={errors.premiumSlug?.message}
                    placeholder={initialValues.defaultSlug}
                    autoComplete="off"
                    disabled={isLoading}
                    onFocus={() => {
                      if (slugMode !== 'premium') {
                        setSlugMode('premium');
                      }
                    }}
                    {...register('premiumSlug', {
                      validate: (value) => {
                        const trimmed = value.trim();
                        if (slugMode === 'default') {
                          return true;
                        }

                        // URL slug validation rules
                        if (trimmed.length < 3) {
                          return t('urlTooShort');
                        }

                        if (trimmed.length > 50) {
                          return t('urlTooLong');
                        }
                        // URL slug pattern: lowercase letters, numbers, hyphens only
                        // Must start and end with alphanumeric, no consecutive hyphens
                        const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

                        if (!slugPattern.test(trimmed)) {
                          return t('urlInvalid');
                        }
                        return true; // Valid
                      },
                    })}
                  />
                  <p className="text-2xs italic">{t('urlRules')}</p>
                  <Controller
                    name="unlisted"
                    control={control}
                    defaultValue={false}
                    render={({ field: { value, onChange, ...field } }) => (
                      <div className="flex items-center gap-2.5">
                        <Switch
                          showLockIcon
                          id="visibility"
                          className="shrink-0"
                          onCheckedChange={(checked) => onChange(checked)}
                          {...field}
                          checked={value}
                          disabled={isLoading || slugMode === 'default'}
                        />
                        <label
                          htmlFor="visibility"
                          className={cn('grow text-sm', slugMode === 'default' && 'text-zinc-600')}>
                          {t('visibilityInfo')}
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
        <StageControls
          disabled={isLoading}
          onPrevious={() => {
            trackEvent('memorialSlugBackButtonClicked', { editingPublishedMemorial });
            if (editingPublishedMemorial) {
              router.push(`/memorial/edit/${initialValues.id}`);
            } else {
              router.push(`/memorial/edit/${initialValues.id}/about`);
            }
          }}
          nextButtonLabel={editingPublishedMemorial ? tCommon('save') : tCommon('continue')}
          previousButtonLabel={tCommon('back')}
        />
      </form>
    </>
  );
}

export default Slug;

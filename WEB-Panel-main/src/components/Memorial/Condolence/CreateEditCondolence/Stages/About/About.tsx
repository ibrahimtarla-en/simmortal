'use client';
import { Select, TextArea } from '@/components';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import React, { useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import { useTranslations } from 'use-intl';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from '@/i18n/navigation';
import { getUser } from '@/services/server/user';
import StageControls from '../../../../StageControls';
import { Condolence, CondolenceAboutForm } from '@/types/condolence';
import { createCondolence, updateCondolence } from '@/services/server/condolence';
import PhoneValidationModal from '@/components/PhoneValidationModal/PhoneValidationModal';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { MemorialContributionStatus } from '@/types/contribution';

interface AboutProps {
  initialValue?: Condolence;
  memorialName: string;
  slug: string;
}

function About({ initialValue, slug, memorialName }: AboutProps) {
  const isEditing = useMemo(() => {
    return initialValue?.status === MemorialContributionStatus.PUBLISHED;
  }, [initialValue]);
  const hasDecoration = useMemo(() => {
    return (
      initialValue &&
      initialValue.decoration !== null &&
      initialValue.decoration !== 'no-decoration'
    );
  }, [initialValue]);
  const t = useTranslations('CreateCondolence.Stages.About');
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const tPlaceholder = useTranslations('Placeholder');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [phoneNumberValidationActive, setPhoneValidationActive] = useState(false);
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const questions = [
    t('questionList.firstImpression', { name: memorialName }),
    t('questionList.sensReminds', { name: memorialName }),
    t('questionList.passionateAbout', { name: memorialName }),
    t('questionList.wereHere', { name: memorialName }),
    t('questionList.usedToSay', { name: memorialName }),
    t('questionList.believedIn'),
    t('questionList.knownFor'),
    t('questionList.strongestSide'),
    t('questionList.mostImportantValue'),
    t('questionList.viewOnLife'),
    t('questionList.firstMemory'),
    t('questionList.firstRecall'),
    t('questionList.leftBehind'),
    t('questionList.threeWords'),
    t('questionList.strongestFeeling'),
    t('questionList.ifHereToday'),
    t('questionList.whenHurt'),
    t('questionList.buildingTrust'),
    t('questionList.empathy'),
    t('questionList.characterLegacy'),
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CondolenceAboutForm>({
    defaultValues: mapInitialToDefaults(initialValue),
  });

  const onSubmit = async (data?: CondolenceAboutForm) => {
    try {
      showLoading();
      const user = await getUser();
      if (!exists(user)) {
        router.push('/login');
        return;
      }

      const requiresValidation = !exists(user.phoneNumber) || user?.phoneNumberVerified !== true;
      if (requiresValidation) {
        trackEvent('condolenceAboutPhoneValidationModalShown', { isEditing });
        setPhoneValidationActive(true);
        return;
      }

      const isCreated = !exists(initialValue);
      if (isCreated) {
        const result = await createCondolence(slug, {
          content: data?.content ?? '',
        });
        console.log('result', result.id);
        trackEvent('condolenceAboutStageCompleted', {
          isEditing: false,
          questionTitle: data?.question || '',
        });
        if (typeof window !== 'undefined') {
          window.history.replaceState(
            {},
            '',
            `/memorial/contribute/${slug}/condolence/edit/${result.id}/about`,
          );
        }
        router.push(`/memorial/contribute/${slug}/condolence/edit/${result.id}/tribute`);
      } else {
        await updateCondolence(slug, initialValue.id, {
          content: data?.content ?? '',
        });
        trackEvent('condolenceAboutStageCompleted', {
          isEditing,
          questionTitle: data?.question || '',
        });
        if (isEditing) {
          router.push(`/memorial/${slug}`);
        } else {
          router.push(`/memorial/contribute/${slug}/condolence/edit/${initialValue.id}/tribute`);
        }
      }
    } catch {
      trackEvent('condolenceAboutStageFailed', { isEditing });
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <form
        ref={formRef}
        className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:gap-16 2xl:p-6')}
        onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('flex grow flex-col gap-10', '2xl:gap-16')}>
          <div
            className={cn(
              'mx-auto flex w-full max-w-[512px] flex-col items-center justify-center gap-y-10',
              '2xl:mt-10',
            )}>
            <span className="w-full text-center text-xl font-light">{t('thoughtPrayers')}</span>
            <Controller
              name="question"
              control={control}
              render={({ field: { value, ...field } }) => (
                <Select
                  id="question"
                  wrapperClassName={cn('col-span-2 w-full ', '2xl:col-span-1')}
                  options={questions.map((q) => ({ label: q, value: q }))}
                  placeholder={t('questionListHint')}
                  disabled={isLoading}
                  value={value ?? ''}
                  {...field}
                />
              )}
            />
            <Controller
              name="content"
              control={control}
              rules={{
                required: tError('messageTooShort'),
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TextArea
                    className="flex h-full w-full flex-col justify-between"
                    placeholder={tPlaceholder('userPromptMemory')}
                    value={value}
                    error={!!errors.content}
                    onChange={onChange}
                    maxChars={130}
                  />
                  {errors.content && (
                    <p className="text-mauveine-300 mt-2 text-xs">{errors.content.message}</p>
                  )}
                </>
              )}
            />
            {(!isEditing || hasDecoration) && (
              <span
                className="text-medium text-mauveine-300 cursor-pointer text-center font-light underline"
                onClick={() => {
                  trackEvent('condolenceAboutWithoutWritingClicked', { isEditing });
                  onSubmit();
                }}>
                {t('condolenceWithoutWriting')}
              </span>
            )}
            <p className="text-center text-xs text-zinc-300">{tCommon('contributionDisclaimer')}</p>
          </div>
          <StageControls
            disabled={isLoading}
            nextButtonLabel={isEditing ? tCommon('save') : tCommon('continue')}
            previousButtonLabel={tCommon('back')}
            onNext={() => {
              trackEvent('condolenceAboutNextButtonClicked', { isEditing });
            }}
            onPrevious={() => {
              trackEvent('condolenceAboutBackButtonClicked', { isEditing });
              router.replace(`/memorial/${slug}`);
            }}
          />
        </div>
      </form>
      {phoneNumberValidationActive && (
        <PhoneValidationModal
          onSuccess={() => {
            trackEvent('condolencePhoneValidationModalSuccess', { isEditing });
            setPhoneValidationActive(false);
            formRef.current?.requestSubmit();
          }}
          onClose={() => {
            trackEvent('condolencePhoneValidationModalClosed', { isEditing });
            setPhoneValidationActive(false);
          }}
          sendButtonAnalytics={{
            eventName: 'condolencePhoneValidationSendButtonClicked',
            params: { isEditing },
          }}
        />
      )}
    </div>
  );
}

export default About;

function mapInitialToDefaults(initialValue?: Condolence): Partial<CondolenceAboutForm> {
  if (!initialValue) return {};
  return {
    question: undefined,
    content: initialValue.content ?? '',
  };
}

'use client';
import { MemorialFlagableContent, MemorialFlagReason } from '@/types/memorial';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import RadioButton from '../Elements/RadioButton/RadioButton';
import RadioGroup from '../Elements/RadioButton/RadioGroup';
import Button from '../Elements/Button/Button';
import { reportMemorialContent } from '@/services/server/memorial';
import { useToast } from '@/hooks/useToast';
import { useLoadingModal } from '@/hooks/useLoadingModal';

interface ReportContentProps {
  contentId: string;
  contentType: MemorialFlagableContent;
  redirectTo?: string;
}

function ReportContent({ contentId, contentType, redirectTo }: ReportContentProps) {
  const [selectedOption, setSelectedOption] = useState<MemorialFlagReason | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations('Report');
  const tError = useTranslations('Error');
  const { toast } = useToast();
  const { isLoading, showLoading, hideLoading } = useLoadingModal();

  const handleSubmit = async () => {
    if (selectedOption === '') {
      toast({ title: tError('generic') });
      return;
    }
    showLoading();
    try {
      await reportMemorialContent(contentId, contentType, selectedOption || undefined);
      setSelectedOption('');
      setSubmitted(true);
    } catch {
      toast({ title: tError('generic') });
    } finally {
      hideLoading();
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col justify-around gap-10 py-10">
        <h1 className={cn('font-serif text-2xl font-medium')}>{t('successTitle')}</h1>
        <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:p-6')}>
          <p className="font-medium">{t('successMessage')}</p>
        </div>
        <div className="flex items-center justify-center">
          <Button href={redirectTo || '/'} role="link">
            {t('continueBrowsing')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-around gap-10 py-10">
      <h1 className={cn('font-serif text-2xl font-medium')}>{t('title')}</h1>
      <div className={cn('flex flex-col gap-10 rounded-lg bg-zinc-900 p-4', '2xl:p-6')}>
        <p className="font-medium">{t('reasonPrompt')}</p>
        <RadioGroup
          value={selectedOption}
          className="flex flex-col gap-5"
          onValueChange={(value) => setSelectedOption(value as MemorialFlagReason)}>
          {Object.values(MemorialFlagReason).map((reason) => (
            <div className="flex items-center gap-3" key={reason}>
              <RadioButton value={reason} id={reason} />
              <label htmlFor={reason}>{t(`Options.${reason.toLowerCase()}`)}</label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-end">
          <Button disabled={selectedOption === '' || isLoading} onClick={handleSubmit}>
            {t('buttonLabel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReportContent;

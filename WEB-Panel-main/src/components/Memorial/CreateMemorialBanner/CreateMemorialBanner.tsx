'use client';
import Button from '@/components/Elements/Button/Button';
import Input from '@/components/Elements/Input/Input';
import { cn } from '@/utils/cn';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

function CreateMemorialBanner() {
  const t = useTranslations('CreateMemorialBanner');
  const [input, setInput] = useState('');
  const router = useRouter();
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center justify-center gap-6 py-9',
        'md:py-16',
        'lg:gap-8',
        'xl:py-20',
        '2xl:gap-9',
      )}>
      <div
        className={cn('flex flex-col items-center justify-center gap-6', 'lg:gap-8', '2xl:gap-9')}>
        <h2 className={cn('font-serif text-3xl font-medium', 'md:text-4xl', 'xl:text-5xl')}>
          {t('title')}
        </h2>
        <p className={cn('font-light', 'lg:text-lg', '2xl:text-xl')}>{t('description')}</p>
      </div>
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-6',
          'sm:w-auto sm:flex-row sm:gap-4',
        )}>
        <Input
          placeholder={t('namePlaceholder')}
          value={input}
          onTextChange={setInput}
          wrapperClassName={cn('max-w-80.5 w-full', 'sm:w-80.5')}
        />
        <div>
          <Button
            className="mx-auto"
            onClick={() => router.push(`/memorial/create?name=${encodeURIComponent(input)}`)}>
            {t('getStarted')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CreateMemorialBanner;

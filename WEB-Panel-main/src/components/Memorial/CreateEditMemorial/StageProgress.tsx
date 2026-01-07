'use client';
import Progress from '@/components/Elements/Progress/Progress';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import React from 'react';

const stages = [
  'identity',
  'cover',
  'about',
  'url',
  'livePortrait',
  'frame',
  'tribute',
  'simmTag',
  'music',
  'preview',
  'checkout',
] as const;

type CreateMemorialStage = (typeof stages)[number];

interface StageProgressProps {
  stage: CreateMemorialStage;
  isEditing?: boolean;
}

function StageProgress({ stage, isEditing }: StageProgressProps) {
  const t = useTranslations('CreateMemorial');
  return (
    <div className={cn('flex flex-col items-center justify-between gap-4', ',gap-16 md:flex-row')}>
      <h1 className={cn('font-serif text-2xl font-medium')}>
        {isEditing ? t(`Stages.${stage}`) : t(`title`)}
      </h1>
      {!isEditing && (
        <Progress
          activeStep={stages.indexOf(stage)}
          totalSteps={stages.length}
          useZeroBasedIndex
          label={t(`Stages.${stage}`)}
          labelClassName={cn('text-center', 'md:text-right')}
        />
      )}
    </div>
  );
}

export default StageProgress;

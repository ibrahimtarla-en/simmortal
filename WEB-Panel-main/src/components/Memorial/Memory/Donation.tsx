import { cn } from '@/utils/cn';
import React from 'react';
import TemaIcon from '@/assets/icons/tema.png';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const sizeVariants = {
  sm: 'w-12 h-4',
  md: 'w-15 h-5.5',
} as const;

type Size = keyof typeof sizeVariants;

interface DonationProps {
  count: number;
  className?: string;
  size?: Size;
}

function Donation({ count, className, size = 'md' }: DonationProps) {
  const t = useTranslations('Donation');
  return (
    <div className={cn('relative text-sm', className)}>
      <div className="flex flex-row items-center gap-2.5">
        <Image src={TemaIcon} alt="Tema Icon" className={cn(sizeVariants[size])} />
        <span>{t('treesToTema', { count })}</span>
      </div>
    </div>
  );
}

export default Donation;

'use client';
import React from 'react';
import GoogleLogo from '@/assets/icons/google-logo.colored.svg';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
type GoogleButtonSize = 'default' | 'small';
type GoogleButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  size?: GoogleButtonSize;
};

function GoogleButton({ size = 'default', ...props }: GoogleButtonProps) {
  const t = useTranslations('Elements.GoogleButton');

  return (
    <button
      className={cn(
        'flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-white p-2.25 text-sm text-black',
        size === 'small' && 'text-2xs h-8',
        props.className,
      )}
      type="button"
      {...props}>
      <GoogleLogo width={size === 'default' ? 16 : 12} height={size === 'default' ? 16 : 12} />
      {t('label')}
    </button>
  );
}

export default GoogleButton;

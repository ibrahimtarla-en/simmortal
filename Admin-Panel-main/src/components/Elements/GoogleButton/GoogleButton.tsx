'use client';
import React from 'react';
import GoogleLogo from '@/assets/icons/google-logo.colored.svg';
import { cn } from '@/lib/utils';

type GoogleButtonSize = 'default' | 'small';
type GoogleButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  size?: GoogleButtonSize;
};

function GoogleButton({ size = 'default', ...props }: GoogleButtonProps) {

  return (
    <button
      className={cn(
        'flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-lg border-1 border-zinc-500 bg-zinc-950 p-2.25 text-sm',
        size === 'small' && 'text-2xs h-8',
        props.className,
      )}
      type="button"
      {...props}>
      <GoogleLogo width={size === 'default' ? 16 : 12} height={size === 'default' ? 16 : 12} />
      <span>Sign in with Google</span>
    </button>
  );
}

export default GoogleButton;

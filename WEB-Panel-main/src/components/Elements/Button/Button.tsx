import { Link } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import React from 'react';
import PremiumTag from '../PremiumTag/PremiumTag';

type ButtonPropsVariant = 'filled' | 'outline' | 'ghost';
type ButtonPropsSize = 'default' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonPropsSize;
  variant?: ButtonPropsVariant;
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  role?: 'button';
  showPremiumTag?: boolean;
}

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: ButtonPropsSize;
  variant?: ButtonPropsVariant;
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  role: 'link';
  href: string;
  disabled?: boolean;
  showPremiumTag?: boolean;
}

function Button({
  children,
  size = 'default',
  variant = 'filled',
  className,
  icon,
  iconSide = 'left',
  showPremiumTag = false,
  ...props
}: ButtonProps | ButtonLinkProps) {
  const isIconOnly = !children && !!icon;
  return (
    <>
      {props.role === 'link' ? (
        <Link
          {...props}
          className={cn(
            'relative flex items-center justify-center gap-3 rounded-full text-center font-medium',
            getWrapperClass(variant, size, isIconOnly, props.disabled),
            icon && !isIconOnly && (iconSide === 'left' ? 'flex-row' : 'flex-row-reverse'),
            props.disabled && 'pointer-events-none',
            className,
          )}>
          {icon && <div className="aspect-square h-full">{icon}</div>}
          {children}
          {showPremiumTag && (
            <PremiumTag isPremium className="absolute top-0 left-3 z-99 -translate-y-2/3" />
          )}
        </Link>
      ) : (
        <button
          {...props}
          className={cn(
            'relative flex items-center justify-center gap-3 rounded-full text-center font-medium',
            getWrapperClass(variant, size, isIconOnly, props.disabled),
            icon && !isIconOnly && (iconSide === 'left' ? 'flex-row' : 'flex-row-reverse'),
            className,
          )}>
          {icon && <div className="aspect-square h-full">{icon}</div>}
          {children}
          {showPremiumTag && (
            <PremiumTag isPremium className="absolute top-0 left-3 z-99 -translate-y-2/3" />
          )}
        </button>
      )}
    </>
  );
}

export default Button;

function getWrapperClass(
  variant: ButtonPropsVariant,
  size: ButtonPropsSize,
  isIconOnly: boolean,
  disabled?: boolean,
) {
  const baseClass = disabled ? 'text-zinc-500 cursor-not-allowed' : 'text-white cursor-pointer';
  const sizeClass = size === 'default' ? 'text-sm py-3 px-8 h-11' : 'text-xs py-2 px-6 h-8';
  const borderClass = variant === 'ghost' ? '' : 'border-shine-1';

  let variantClass = '';
  switch (variant) {
    case 'filled':
      variantClass = disabled ? 'bg-zinc-900' : 'bg-mauveine-900 hover:bg-mauveine-800';
      break;
    case 'outline':
      variantClass = disabled ? 'bg-transparent' : 'bg-transparent hover:bg-zinc-800';
      break;
    case 'ghost':
      variantClass = disabled ? '' : 'hover:underline';
      break;
  }
  const buttonClass = cn(baseClass, sizeClass, variantClass, borderClass);
  if (isIconOnly) {
    const iconOnlyClass = size === 'default' ? 'px-3 py-3' : 'p-2';
    return cn(buttonClass, iconOnlyClass);
  }
  return buttonClass;
}

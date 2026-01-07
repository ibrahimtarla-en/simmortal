'use client';
import { cn } from '@/utils/cn';
import React, { useMemo, useState } from 'react';
import HidePassword from '@/assets/icons/hide-password.svg';
import RevealPassword from '@/assets/icons/reveal-password.svg';
import { cva } from 'class-variance-authority';

type InputSize = 'default' | 'small';
type InputVariant = 'default' | 'transparent';

export interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'size'> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  allowReveal?: boolean;
  size?: InputSize;
  wrapperClassName?: string;
  icon?: React.ReactNode;
  onIconClicked?: () => void;
  onTextChange?: (text: string) => void;
  variant?: InputVariant;
}

function Input({
  label,
  allowReveal,
  error,
  errorMessage,
  size = 'default',
  wrapperClassName,
  icon,
  onIconClicked,
  onTextChange,
  variant = 'default',
  ...props
}: InputProps) {
  const [revealed, setRevealed] = useState(false);
  const showRevealButton = useMemo(
    () => (props.type === 'password' && allowReveal) ?? false,
    [props.type, allowReveal],
  );

  return (
    <div className={cn(wrapperClassName)}>
      {label && (
        <label
          htmlFor={props.id}
          style={{ lineHeight: 1 }}
          className={labelClass({
            variant,
            size,
            disabled: !!props.disabled,
            error: !!error,
          })}>
          {label}
        </label>
      )}
      <div
        className={inputWrapperClass({
          variant,
          size,
          disabled: !!props.disabled,
          error: !!error,
        })}>
        <input
          {...props}
          type={revealed && props.type === 'password' ? 'text' : props.type || 'text'}
          className={cn(
            inputClass({
              variant,
              size,
              disabled: !!props.disabled,
              error: !!error,
            }),
            props.className,
          )}
          onChange={(e) => {
            onTextChange?.(e.target.value);
            props.onChange?.(e);
          }}
        />
        {showRevealButton && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            disabled={props.disabled}
            className={iconClass({ variant, size, disabled: !!props.disabled, error: !!error })}>
            {revealed ? <HidePassword /> : <RevealPassword />}
          </button>
        )}
        {icon &&
          (onIconClicked ? (
            <button
              onClick={onIconClicked}
              className={cn(
                'pointer-events-auto shrink-0 cursor-pointer',
                iconClass({ variant, size, disabled: !!props.disabled, error: !!error }),
              )}>
              {icon}
            </button>
          ) : (
            <div
              className={iconClass({ variant, size, disabled: !!props.disabled, error: !!error })}>
              {icon}
            </div>
          ))}
      </div>
      {error && errorMessage && (
        <div
          className={cn(
            'text-2xs mt-0.5 leading-none font-light',
            variant === 'transparent' ? 'text-mauveine-100' : 'text-mauveine-300',
          )}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default Input;

const inputWrapperClass = cva(
  'pointer-events-none relative box-content flex w-full items-center font-sans',
  {
    variants: {
      variant: {
        default: 'rounded-lg bg-black',
        transparent: 'bg-transparent text-white border-b-1',
      },
      size: {
        default: null,
        small: null,
      },
      error: {
        false: null,
        true: null,
      },
      disabled: {
        false: null,
        true: 'cursor-not-allowed pointer-events-none',
      },
    },
    compoundVariants: [
      { variant: 'default', error: false, class: 'border-shine-1' },
      {
        variant: 'default',
        error: true,
        class: 'border-1 border-mauveine-300',
      },
      {
        variant: 'transparent',
        error: true,
        class: 'border-mauveine-100 border-b-1',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      disabled: false,
    },
  },
);

const inputClass = cva(
  'pointer-events-auto box-content block w-0 grow font-light outline-none  border-none',
  {
    variants: {
      variant: {
        default:
          'bg-black placeholder:text-zinc-500 placeholder:text-zinc-500 placeholder:italic rounded-lg',
        transparent: 'bg-transparent text-white placeholder:text-white',
      },
      size: {
        default: 'py-3 h-5',
        small: 'py-2 h-4 text-xs',
      },
      error: {
        false: null,
        true: '',
      },
      disabled: {
        false: null,
        true: 'cursor-not-allowed pointer-events-none',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        size: 'default',
        class: 'px-4',
      },
      {
        variant: 'default',
        size: 'small',
        class: 'px-3',
      },
      {
        variant: 'transparent',
        size: 'default',
        class: 'px-1',
      },
      {
        variant: 'transparent',
        size: 'small',
        class: 'px-1',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      disabled: false,
    },
  },
);

const iconClass = cva('pointer-events-auto shrink-0 cursor-pointer', {
  variants: {
    variant: {
      default: null,
      transparent: null,
    },
    size: {
      default: 'h-5 w-5 mr-4',
      small: 'h-4 w-4 mr-3',
    },
    error: {
      false: null,
      true: null,
    },
    disabled: {
      false: null,
      true: 'cursor-not-allowed pointer-events-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
});

const labelClass = cva('text-mauveine-50 mb-1.5 line-clamp-1 block', {
  variants: {
    variant: {
      default: null,
      transparent: null,
    },
    size: {
      default: 'text-xs',
      small: 'text-2xs',
    },
    error: {
      false: null,
      true: 'text-mauveine-300',
    },
    disabled: {
      false: null,
      true: 'text-zinc-500',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
});

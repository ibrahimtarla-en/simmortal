'use client';
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from 'radix-ui';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxChars?: number;
  error?: boolean;
  className?: string;
  overlay?: React.ReactNode;
  disabled?: boolean;
}

const MAX_HEIGHT = 120;

function TextArea({
  value,
  onChange,
  placeholder,
  maxChars,
  error,
  className,
  overlay,
  disabled = false,
}: TextAreaProps) {
  const t = useTranslations('Elements.TextArea');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  function autoResize() {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = 'auto';

    const newHeight = Math.max(textAreaRef.current.scrollHeight, MAX_HEIGHT);
    textAreaRef.current.style.height = newHeight + 'px';
  }

  useEffect(() => {
    autoResize();
  }, [value]);
  return (
    <div
      onClick={() => textAreaRef.current?.focus()}
      className={cn(
        'border-shine-1 cursor-text overflow-clip rounded-lg bg-black p-5 pr-2',
        className,
        error && 'border-mauveine-300 border-1',
      )}>
      <ScrollArea.Root
        className="w-full leading-normal"
        style={{ height: MAX_HEIGHT }}
        type="auto"
        onWheel={(e) => {
          e.stopPropagation();
        }}>
        <ScrollArea.Viewport className="h-full w-auto pr-3 text-sm">
          <textarea
            ref={textAreaRef}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              onChange?.(e.target.value);
            }}
            className={cn('w-full pr-3', 'placeholder:text-zinc-500 placeholder:italic')}
            style={{ verticalAlign: 'top' }}
          />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="my-2 mr-2 flex w-1 touch-none rounded-full bg-zinc-500 transition-colors select-none"
          orientation="vertical">
          <ScrollArea.Thumb className="bg-mauveine-500 relative flex-1 rounded-full before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[22px] before:-translate-x-1/2 before:-translate-y-1/2 before:transform before:content-['']" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      {maxChars && (
        <div className="text-2xs mt-2 mr-2 flex justify-end text-zinc-500">
          <div className="inline-block">
            <span
              className={cn(
                'font-medium',
                (value?.length ?? 0) > maxChars ? 'text-mauveine-300' : '',
              )}>
              {value?.length ?? 0}&nbsp;
            </span>
            /&nbsp;{maxChars}&nbsp;{t('max')}
          </div>
        </div>
      )}
      {overlay && <div className="absolute inset-0">{overlay}</div>}
    </div>
  );
}

export default TextArea;

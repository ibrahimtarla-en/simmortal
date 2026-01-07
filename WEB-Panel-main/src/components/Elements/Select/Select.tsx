'use client';
import React, { useMemo } from 'react';
import { Select as RadixSelect, ScrollArea } from 'radix-ui';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import { cn } from '@/utils/cn';

interface SelectProps {
  placeholder?: string;
  options?: { value: string; label: string; displayLabel?: string; searchValue?: string }[];
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  className?: string;
  maxItemsDisplayed?: number;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  contentClassName?: string;
  compact?: boolean;
}

function Select({
  placeholder,
  value,
  onChange,
  id,
  className,
  label,
  options = [],
  maxItemsDisplayed = 5,
  error,
  errorMessage,
  wrapperClassName,
  disabled,
  contentClassName,
  compact = false,
}: SelectProps) {
  const scrollable = useMemo(
    () => maxItemsDisplayed < options.length,
    [maxItemsDisplayed, options.length],
  );

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const displayValue = selectedOption?.displayLabel || selectedOption?.label;

  return (
    <div className={wrapperClassName}>
      <RadixSelect.Root value={value} onValueChange={onChange}>
        {label && (
          <label
            htmlFor={id}
            style={{ lineHeight: 1 }}
            className={cn(
              'text-mauveine-50 mb-1.5 line-clamp-1 block text-xs',
              error && 'text-mauveine-300',
              disabled && 'text-zinc-500',
            )}>
            {label}
          </label>
        )}
        <RadixSelect.Trigger
          id={id}
          disabled={disabled}
          className={cn(
            'border-shine-1 inline-flex h-11 w-full cursor-pointer items-center justify-between rounded-lg bg-black px-4 py-3 leading-0 font-light data-[placeholder]:text-zinc-500',
            compact ? 'gap-1' : 'gap-4',
            error && 'border-mauveine-300 border-1',
            disabled && 'cursor-not-allowed text-zinc-500',
            className,
          )}>
          {displayValue ? (
            <span>{displayValue}</span>
          ) : (
            <RadixSelect.Value placeholder={placeholder} className="" />
          )}
          <RadixSelect.Icon
            className={cn(
              'aspect-square h-full text-white',
              error && 'text-mauveine-300',
              disabled && 'text-zinc-500',
            )}>
            <ArrowDown />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className={cn(
              'border-shine-1 z-999 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg bg-black font-light',
              contentClassName,
            )}
            sideOffset={12}
            position="popper">
            <ScrollArea.Root
              className={cn('w-full p-2', scrollable ? `pr-5` : 'h-full')}
              style={{
                height: scrollable
                  ? `calc(${maxItemsDisplayed}*var(--spacing)*9 + var(--spacing)*4)`
                  : '',
              }}
              type="auto"
              onWheel={(e) => {
                e.stopPropagation();
              }}>
              <RadixSelect.Viewport asChild>
                <ScrollArea.Viewport className="h-full w-auto" style={{ overflowY: undefined }}>
                  {options.map((option) => (
                    <RadixSelect.Item
                      key={option.value}
                      value={option.value}
                      textValue={option.searchValue || option.label}
                      className={cn(
                        'data-[state=checked]:text-mauveine-300 relative flex cursor-pointer rounded-lg px-2 py-1.5 outline-0 hover:bg-zinc-700 hover:outline-0',
                      )}>
                      <RadixSelect.ItemText className="text-white">
                        {option.label}
                      </RadixSelect.ItemText>
                    </RadixSelect.Item>
                  ))}
                </ScrollArea.Viewport>
              </RadixSelect.Viewport>
              <ScrollArea.Scrollbar
                className="my-2 mr-2 flex w-1 touch-none rounded-full bg-zinc-500 transition-colors select-none"
                orientation="vertical">
                <ScrollArea.Thumb className="bg-mauveine-500 relative flex-1 rounded-full before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:transform before:content-['']" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </RadixSelect.Content>
        </RadixSelect.Portal>
        {error && errorMessage && (
          <div className="text-mauveine-300 text-2xs mt-0.5 leading-none font-light">
            {errorMessage}
          </div>
        )}
      </RadixSelect.Root>
    </div>
  );
}

export default Select;

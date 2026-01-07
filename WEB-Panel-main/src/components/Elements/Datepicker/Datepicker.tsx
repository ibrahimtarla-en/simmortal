'use client';
import { useMemo, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import CalendarIcon from '@/assets/icons/calendar.svg';
import { cn } from '@/utils/cn';
import { exists } from '@/utils/exists';
import Input, { InputProps } from '../Input/Input';
import { useLocale } from 'next-intl';
import { pickPreferredLocale } from '@/utils/localization/preferredLocale';
import { formatDate } from '@/utils/date';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DatePickerProps extends InputProps {
  pastOnly?: boolean;
  equalSizeToInput?: boolean;
  onDateChange?: (date: Date | undefined) => void;
  popperPosition?: 'left' | 'right' | 'center';
  popperWrapperClassName?: string;
  date?: Date;
}

function DatePicker({
  pastOnly = false,
  equalSizeToInput = false,
  onDateChange,
  popperPosition = 'right',
  popperWrapperClassName,
  date,
  ...props
}: DatePickerProps) {
  const locale = useLocale();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [internalDate, setInternalDate] = useState<Date | undefined>(date);
  const [isComponentFocused, setIsComponentFocused] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputValue = useMemo(() => {
    const dateToUse = date ?? internalDate;
    if (!exists(dateToUse)) {
      return '';
    }
    return isInputFocused
      ? (dateToUse?.toISOString().split('T')[0] ?? '')
      : formatDate(dateToUse.toISOString(), 'DD MMM YYYY', locale);
  }, [isInputFocused, date, internalDate, locale]);

  const handleFocus = (event: React.FocusEvent) => {
    // Check if the new focus target is still within our component
    if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
      setIsComponentFocused(false);
    }
  };

  const dropFocus = () => {
    wrapperRef.current?.querySelectorAll('*').forEach((el) => {
      (el as HTMLElement).blur();
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="group relative z-1"
      tabIndex={0}
      onFocus={() => setIsComponentFocused(true)}
      onBlur={handleFocus}>
      <Input
        type={isInputFocused ? 'date' : 'text'}
        tabIndex={undefined}
        {...props}
        value={inputValue}
        className={cn('pointer-none select-none', props.className)}
        icon={<CalendarIcon />}
        readOnly={!isInputFocused}
        onFocus={() => {
          setIsInputFocused(true);
        }}
        onBlur={(e) => {
          setIsInputFocused(false);
          handleFocus(e);
        }}
        onChange={(e) => {
          const inputDate = new Date(e.currentTarget.value);
          if (!isNaN(inputDate.getTime())) {
            setInternalDate(inputDate);
            onDateChange?.(inputDate);
          }
        }}
      />
      <div
        className={cn(
          'bg-gradient-card-fill border-shine-1 absolute top-18 hidden max-w-[calc(100vw-2rem)] rounded-lg px-3 py-5 font-sans text-base font-medium',
          isComponentFocused && 'block',
          equalSizeToInput && '!w-full',
          popperPosition === 'left' && 'left-0',
          popperPosition === 'right' && 'right-0',
          popperPosition === 'center' && 'left-1/2 -translate-x-1/2 transform',
          popperWrapperClassName,
        )}>
        <Calendar
          locale={pickPreferredLocale(locale)}
          className="mx-auto"
          maxDate={pastOnly ? new Date() : undefined}
          onChange={(value: Value) => {
            const newDate = createDateFromValue(value);
            onDateChange?.(newDate);
            setInternalDate(newDate);
            dropFocus();
          }}
          value={date ?? internalDate}
        />
      </div>
    </div>
  );
}

export default DatePicker;

function createDateFromValue(value: Value): Date | undefined {
  let date: Date;
  if (!exists(value)) {
    return undefined;
  } else if (value instanceof Date) {
    date = value;
  } else if (!exists(value[0])) {
    return undefined;
  } else {
    date = value[0];
  }

  // Create a new Date in UTC (timezoneless/GMT)
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

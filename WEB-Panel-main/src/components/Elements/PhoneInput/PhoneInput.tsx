'use client';
import React, { useMemo } from 'react';
import {
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  CountryCode,
} from 'libphonenumber-js';
import Select from '@/components/Elements/Select/Select';
import Input from '@/components/Elements/Input/Input';
import { cn } from '@/utils/cn';
import { useLocale } from 'next-intl';

interface PhoneInputProps {
  phoneNumber?: string;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  selectedCountry?: CountryCode;
  onCountryChange?: (country: CountryCode) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  inputMode?: 'tel';
}

function PhoneInput({
  phoneNumber = '',
  onPhoneNumberChange,
  selectedCountry = 'US',
  onCountryChange,
  onValidationChange,
  placeholder,
  error,
  errorMessage,
  wrapperClassName,
  disabled,
  icon,
  inputMode = 'tel',
}: PhoneInputProps) {
  const locale = useLocale();
  const countries = useMemo(() => getCountries(), []);

  const countryOptions = useMemo(() => {
    const displayNames = new Intl.DisplayNames([locale], {
      type: 'region',
    });

    return countries
      .map((country) => {
        const callingCode = getCountryCallingCode(country);
        const countryName = displayNames.of(country) || country;
        // Get flag emoji
        const flag = getFlagEmoji(country);
        return {
          value: country,
          label: `${flag} ${countryName} (+${callingCode})`,
          displayLabel: `${flag} +${callingCode}`,
          searchValue: countryName, // Use country name for keyboard search
          sortName: countryName, // Store for sorting
        };
      })
      .sort((a, b) => {
        // Sort alphabetically by country name
        return a.sortName.localeCompare(b.sortName, locale);
      });
  }, [countries, locale]);

  const handleCountryChange = (country: string) => {
    const countryCode = country as CountryCode;
    onCountryChange?.(countryCode);

    // Validate phone number with new country
    if (phoneNumber) {
      try {
        const isValid = isValidPhoneNumber(phoneNumber, countryCode);
        onValidationChange?.(isValid);
      } catch {
        onValidationChange?.(false);
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanPhoneNumber(e.target.value);
    onPhoneNumberChange?.(cleaned);

    // Validate phone number
    if (cleaned) {
      try {
        const isValid = isValidPhoneNumber(cleaned, selectedCountry);
        onValidationChange?.(isValid);
      } catch {
        onValidationChange?.(false);
      }
    } else {
      onValidationChange?.(false);
    }
  };

  return (
    <div className={cn('flex w-full gap-2', wrapperClassName)}>
      <Select
        value={selectedCountry}
        onChange={handleCountryChange}
        options={countryOptions}
        wrapperClassName="w-30 relative"
        disabled={disabled}
        error={error}
        maxItemsDisplayed={6}
        contentClassName="z-999999999 !w-64"
        compact
      />
      <Input
        inputMode={inputMode}
        type="tel"
        wrapperClassName="flex-1"
        pattern="[0-9\s\-\(\)]+"
        placeholder={placeholder}
        error={error}
        errorMessage={errorMessage}
        disabled={disabled}
        icon={icon}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
      />
    </div>
  );
}

export default PhoneInput;

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Clean phone number input
const cleanPhoneNumber = (value: string) => {
  if (!value) return value;

  // Remove invalid characters (keep only digits, spaces, parentheses, and hyphens)
  const cleaned = value.replace(/[^0-9\s\-\(\)]/g, '');

  return cleaned;
};

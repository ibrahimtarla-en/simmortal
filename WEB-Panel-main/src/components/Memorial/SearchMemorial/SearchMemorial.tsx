'use client';
import Input from '@/components/Elements/Input/Input';
import { searchMemorials } from '@/services/server/memorial';
import { PublishedMemorial } from '@/types/memorial';
import { exists } from '@/utils/exists';
import { useLocale, useTranslations } from 'next-intl';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Search from '@/assets/icons/search.svg';
import Views from '@/assets/icons/views.svg';
import MemorialPortrait from '../MemorialPortrait/MemorialPortrait';
import { formatDate } from '@/utils/date';
import { useDebounce } from '@/hooks';
import { cn } from '@/utils/cn';

const MAX_LIVE_SEARCH_RESULTS = 3;

interface SearchMemorialProps {
  value: string;
  onTextChange: (text: string) => void;
  onIconClicked?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onResultClicked?: (memorial: PublishedMemorial) => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  hideIcon?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  wrapperClassName?: string;
  compact?: boolean;
  resultDirection?: 'upwards' | 'downwards';
}
export interface SearchMemorialRef {
  focus: () => void;
  blur: () => void;
}

const SearchMemorial = forwardRef<SearchMemorialRef, SearchMemorialProps>(
  (
    {
      onIconClicked,
      onKeyDown,
      onResultClicked,
      value,
      onTextChange,
      label,
      error,
      errorMessage,
      disabled,
      hideIcon = false,
      onFocus,
      onBlur,
      wrapperClassName,
      compact = false,
      resultDirection = 'downwards',
    },
    ref: React.Ref<SearchMemorialRef>,
  ) => {
    const tCommon = useTranslations('Common');
    const tStats = useTranslations('VisitMemorial.MemorialStats');
    const locale = useLocale();

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchResults, setSearchResults] = useState<PublishedMemorial[] | null>(null);

    const handleSearch = useCallback((query: string) => {
      setIsSearchActive(true);
      searchMemorials(query, MAX_LIVE_SEARCH_RESULTS).then((results) => {
        setSearchResults(results);
        setIsSearchActive(false);
      });
    }, []);
    const debouncedMemorialSearch = useDebounce(handleSearch, 300);

    const handleFocus = (event: React.FocusEvent) => {
      // Check if the new focus target is still within our component
      if (!containerRef.current?.contains(event.relatedTarget as Node)) {
        setIsSearchFocused(false);
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
        setIsSearchFocused(false);
      },
    }));

    useEffect(() => {
      if (value.length >= 1) {
        debouncedMemorialSearch(value);
      } else {
        setSearchResults(null);
      }
    }, [value, debouncedMemorialSearch]);

    useEffect(() => {
      if (isSearchFocused) {
        onFocus?.();
      } else {
        onBlur?.();
      }
    }, [isSearchFocused, onFocus, onBlur]);

    return (
      <div className={cn('relative w-full', wrapperClassName)} ref={containerRef}>
        <Input
          placeholder={tCommon('search')}
          wrapperClassName="w-full"
          icon={!hideIcon && <Search />}
          value={value}
          onTextChange={onTextChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={handleFocus}
          onKeyDown={onKeyDown}
          onIconClicked={onIconClicked}
          label={label}
          error={error}
          errorMessage={errorMessage}
          disabled={disabled}
          ref={inputRef}
        />
        {isSearchFocused &&
          exists(searchResults) &&
          searchResults.length > 0 &&
          value.length >= 1 && (
            <div
              className={cn(
                'border-shine-1 absolute left-0 z-9999 w-full rounded-md bg-black p-3',
                resultDirection === 'downwards' && 'top-full mt-3',
                resultDirection === 'upwards' && 'bottom-full mb-3',
              )}>
              {searchResults.map((memorial, index) => (
                <div key={memorial.id}>
                  <button
                    type="button"
                    key={memorial.slug}
                    onClick={() => {
                      onResultClicked?.(memorial);
                    }}
                    onTouchStart={() => {
                      onResultClicked?.(memorial);
                    }}
                    className={cn(
                      'mb-0 flex h-35 w-full items-center gap-2.5 p-2 not-first:mt-5 last:pb-0',
                      onResultClicked && 'cursor-pointer',
                      compact && 'mb-0 h-20 py-1 not-first:mt-0',
                    )}>
                    <div className="h-full pb-[2%]">
                      <MemorialPortrait
                        tribute={memorial.tribute}
                        imageUrl={memorial.imagePath}
                        frame={memorial.frame}
                        name={memorial.name}
                        sizes="10rem"
                        className="aspect-square h-full"
                      />
                    </div>
                    <div
                      className={cn(
                        'flex flex-col text-left text-xs',
                        compact && 'text-2xs pb-[2%]',
                      )}>
                      <p className="line-clamp-1 font-serif text-lg font-semibold">
                        {memorial.name}
                      </p>
                      <p>
                        {formatDate(memorial.dateOfBirth, 'YYYY', locale)} -{' '}
                        {formatDate(memorial.dateOfDeath, 'YYYY', locale)}
                      </p>
                      <p className={cn('mt-6 font-serif', compact && 'mt-1')}>
                        <Views
                          className={cn('inline h-4.5 w-4.5', compact && 'h-3 w-3')}
                          width={18}
                          height={18}
                        />
                        &nbsp;
                        {memorial.stats.views}&nbsp;{tStats('views')}
                      </p>
                    </div>
                  </button>
                  {index !== searchResults.length - 1 && <hr className="border-zinc-500" />}
                </div>
              ))}
            </div>
          )}
        {isSearchFocused &&
          value.length >= 1 &&
          exists(searchResults) &&
          searchResults.length === 0 &&
          !isSearchActive && (
            <div className="border-shine-1 absolute top-full left-0 z-9999 mt-3 w-full rounded-md bg-black p-3 py-6 text-center text-lg font-semibold">
              {tCommon('noResults', { query: value })}
            </div>
          )}
      </div>
    );
  },
);
SearchMemorial.displayName = 'SearchMemorial';
export default SearchMemorial;

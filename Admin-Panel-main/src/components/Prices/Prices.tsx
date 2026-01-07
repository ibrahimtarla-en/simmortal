'use client';
import { MemorialDecoration, MemorialTribute } from '@/types/memorial';
import React from 'react';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { getTribute } from '@/utils/tribute';
import { getMemorialDecoration } from '@/utils/decoration';
import {
  getDecorationPrices,
  getTributePrices,
  updateDecorationPrice,
  updateTributePrice,
} from '@/services/server/shop';
import { useLoadingModal } from '@/hooks/useLoadingModal';

interface PricesProps {
  decorationPrices: Record<MemorialDecoration, string>;
  tributePrices: Record<MemorialTribute, string | null>;
}

function Prices({ decorationPrices, tributePrices }: PricesProps) {
  const [decorations, setDecorations] = React.useState(decorationPrices);
  const [tributes, setTributes] = React.useState(tributePrices);
  const { showLoading, hideLoading } = useLoadingModal();

  const formatDisplayName = (key: string): string => {
    return key
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const parsePriceToCents = (price: string | null): number => {
    if (!price) return 0;
    // Remove $ sign and parse as float, then convert to cents
    const dollars = parseFloat(price.replace('$', ''));
    return isNaN(dollars) ? 0 : Math.round(dollars * 100);
  };

  const handleDecorationPriceChange = async (
    decoration: MemorialDecoration,
    newPriceInCents: number,
  ) => {
    try {
      showLoading();
      await updateDecorationPrice(decoration, newPriceInCents);
      setDecorations(await getDecorationPrices());
    } catch (error) {
      console.error('Error updating decoration price:', error);
    } finally {
      hideLoading();
    }
  };

  const handleTributePriceChange = async (tribute: MemorialTribute, newPriceInCents: number) => {
    try {
      showLoading();
      await updateTributePrice(tribute, newPriceInCents);
      setTributes(await getTributePrices());
    } catch (error) {
      console.error('Error updating tribute price:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Decorations Section */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold">Decoration Prices</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(Object.entries(decorations) as [MemorialDecoration, string][]).map(
            ([decoration, price]) => {
              if (decoration === 'no-decoration') return null;
              return (
                <div
                  key={decoration}
                  className="flex flex-col items-center space-y-3 rounded-lg border p-4">
                  <div className="relative h-24 w-24">
                    <Image
                      sizes="96px"
                      src={getMemorialDecoration(decoration)}
                      alt={formatDisplayName(decoration)}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-center text-sm font-medium">
                    {formatDisplayName(decoration)}
                  </h3>
                  <PricingItem
                    priceInCents={parsePriceToCents(price)}
                    onPriceChange={(newPrice) => handleDecorationPriceChange(decoration, newPrice)}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Tributes Section */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold">Tribute Prices</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(Object.entries(tributes) as [MemorialTribute, string | null][]).map(
            ([tribute, price]) => {
              if (tribute === 'default') return null;
              return (
                <div
                  key={tribute}
                  className="flex flex-col items-center space-y-3 rounded-lg border p-4">
                  <div className="relative h-24 w-24">
                    <Image
                      sizes="96px"
                      src={getTribute(tribute)}
                      alt={formatDisplayName(tribute)}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-center text-sm font-medium">{formatDisplayName(tribute)}</h3>
                  <PricingItem
                    priceInCents={parsePriceToCents(price)}
                    onPriceChange={(newPrice) => handleTributePriceChange(tribute, newPrice)}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

export default Prices;

interface PricingItemProps {
  priceInCents: number;
  onPriceChange: (newPriceInCents: number) => void;
}

const PricingItem = ({ priceInCents, onPriceChange }: PricingItemProps) => {
  // Track the display value separately to allow user to type freely
  const [displayValue, setDisplayValue] = React.useState<string>((priceInCents / 100).toFixed(2));
  const [currentCents, setCurrentCents] = React.useState<number>(priceInCents);

  // Update display value when priceInCents prop changes
  React.useEffect(() => {
    setDisplayValue((priceInCents / 100).toFixed(2));
    setCurrentCents(priceInCents);
  }, [priceInCents]);

  const isPriceChanged = currentCents !== priceInCents;

  const handlePriceInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    // Allow empty string, integers, or decimals with max 2 decimal places
    const priceRegex = /^(\d+(\.\d{0,2})?)?$/;

    if (!priceRegex.test(value)) {
      e.currentTarget.value = value.slice(0, -1); // Remove last invalid character
    } else {
      setDisplayValue(value);

      // Update currentCents immediately for button state
      if (value === '' || value === '.') {
        setCurrentCents(0);
      } else {
        const dollars = parseFloat(value);
        if (!isNaN(dollars)) {
          setCurrentCents(Math.round(dollars * 100));
        }
      }
    }
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (value === '' || value === '.') {
      // Empty or just decimal - reset to 0.00
      setDisplayValue('0.00');
      setCurrentCents(0);
      return;
    }

    // Parse the value and convert to cents
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) {
      const cents = Math.round(dollars * 100);
      setCurrentCents(cents);

      // Format display value to always show 2 decimal places
      setDisplayValue((cents / 100).toFixed(2));
    }
  };

  const handleUpdate = () => {
    onPriceChange(currentCents);
  };

  const handleReset = () => {
    setDisplayValue((priceInCents / 100).toFixed(2));
    setCurrentCents(priceInCents);
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative w-full max-w-[140px]">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
          $
        </span>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={displayValue}
          onInput={handlePriceInput}
          onBlur={handlePriceBlur}
          className="pl-6 text-center"
        />
      </div>
      <div className="flex w-full max-w-[140px] gap-2">
        <Button
          size="sm"
          onClick={handleUpdate}
          disabled={!isPriceChanged}
          className="flex-1 cursor-pointer">
          Update
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          disabled={!isPriceChanged}
          className="flex-1 cursor-pointer">
          Reset
        </Button>
      </div>
    </div>
  );
};

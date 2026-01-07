import Button from '@/components/Elements/Button/Button';
import { cn } from '@/utils/cn';
import React from 'react';
import Trash from '@/assets/icons/trash.svg';
import Plus from '@/assets/icons/plus.svg';
import Minus from '@/assets/icons/minus.svg';

interface DonationCountProps {
  count: number;
  setCount: (count: number) => void;
  price: number;
}

const formatPrice = (price: number) => {
  return price.toFixed(2);
};

// TODO: get price from backend
function DonationCount({ count, setCount, price }: DonationCountProps) {
  return (
    <div className={cn('relative')}>
      <div className="flex flex-row items-center gap-4">
        <span className="text-md">${formatPrice(price * count)}</span>
        {count > 0 && (
          <div className="flex flex-row items-center gap-3">
            <Button
              icon={count > 1 ? <Minus /> : <Trash />}
              onClick={() => setCount(count > 0 ? count - 1 : 0)}
            />
            <span className="text-lg">{count}</span>
            <Button icon={<Plus />} onClick={() => setCount(count + 1)} />
          </div>
        )}
        {count === 0 && (
          <Button size="small" onClick={() => setCount(count + 1)}>
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

export default DonationCount;

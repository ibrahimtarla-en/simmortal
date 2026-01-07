import React from 'react';
import Prices from '@/components/Prices/Prices';
import { getDecorationPrices, getTributePrices } from '@/services/server/shop';

async function PricesPage() {
  const [decorationPrices, tributePrices] = await Promise.all([
    getDecorationPrices(),
    getTributePrices(),
  ]);

  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Prices</h1>
      <Prices decorationPrices={decorationPrices} tributePrices={tributePrices} />
    </>
  );
}

export default PricesPage;

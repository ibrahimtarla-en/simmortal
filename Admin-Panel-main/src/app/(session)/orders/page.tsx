import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { getOpenOrders } from '@/services/server/shop';

async function OrdersPage() {
  const orders = await getOpenOrders();
  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Open Orders</h1>
      <DataTable columns={columns} data={orders} />
    </>
  );
}

export default OrdersPage;

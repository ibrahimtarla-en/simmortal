import OrderDetails from '@/components/OrderDetails/OrderDetails';
import { getOrderById } from '@/services/server/shop';
import { DynamicRouteParams } from '@/types/util';
import React from 'react';

async function OrderDetailPage({ params }: DynamicRouteParams<{ id: string }>) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return <div className="my-10 text-center text-lg">Order not found</div>;
  }

  return <OrderDetails order={order} />;
}

export default OrderDetailPage;

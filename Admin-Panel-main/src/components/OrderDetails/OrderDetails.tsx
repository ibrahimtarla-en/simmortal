'use client';
import React from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { DetailedOrder, OrderStatus } from '@/types/shop';
import { updateOrderStatus } from '@/services/server/shop';
import { CheckCircle2, CopyIcon, ExternalLinkIcon } from 'lucide-react';

export interface ContactFormDetailsProps {
  order: DetailedOrder;
}

function OrderDetails({ order }: ContactFormDetailsProps) {
  const [disabled, setDisabled] = React.useState(false);
  const router = useRouter();
  const handleClose = async (status: OrderStatus) => {
    try {
      setDisabled(true);
      await updateOrderStatus(order.id, status);
      window.alert(`Order marked as ${status}.`);
      router.refresh();
    } catch {
      window.alert('Failed to update order status. Please try again.');
      setDisabled(false);
    }
  };

  return (
    <section className="grid grid-cols-2 gap-8 py-10">
      <div className="col-span-2 mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">Order Details</h2>
        {order.status === OrderStatus.PAID && (
          <Button
            disabled={disabled}
            className="bg-mauveine-700 hover:bg-mauveine-500 ml-auto cursor-pointer"
            onClick={() => handleClose(OrderStatus.COMPLETED)}>
            Complete Order
          </Button>
        )}
        {order.status === OrderStatus.CREATED && (
          <Button
            disabled={disabled}
            className="bg-mauveine-700 hover:bg-mauveine-500 ml-auto cursor-pointer"
            onClick={() => handleClose(OrderStatus.PAID)}>
            Mark as Paid
          </Button>
        )}
        {order.status === OrderStatus.COMPLETED && (
          <Button className="bg-mauveine-600 ml-auto cursor-pointer hover:bg-zinc-600" disabled>
            Order Completed
          </Button>
        )}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Status:</div> {getStatusIndicator(order.status)}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">ID:</div> {order.id}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Name:</div>
        {order.firstName} {order.lastName}
      </div>

      <div>
        <div className="mb-2 font-serif text-xl">Email:</div> {order.email}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Phone Number:</div> {order.phoneNumber}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Address:</div>
        <div>{order.address}</div>
        <div>
          {order.city}, {order.state} {order.postCode}
        </div>
        <div>
          {order.country}, {order.state}
        </div>
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Items:</div>
        <div>
          {order.itemName ?? 'Unknown Item'} x {order.quantity}
        </div>
      </div>
      {order.memorialId && (
        <div>
          <div className="mb-2 font-serif text-xl">Order for memorial:</div>
          <a
            href={`/memorials/${order.memorialId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 underline">
            <ExternalLinkIcon size={16} />
            {order.memorialId}
          </a>
        </div>
      )}
      <div>
        <div className="mb-2 font-serif text-xl">Stripe Payment ID:</div>
        <div className="flex items-center gap-2">
          {order.stripePaymentId && (
            <CopyIcon
              size={12}
              className="cursor-pointer"
              onClick={() => {
                if (order.stripePaymentId) {
                  navigator.clipboard.writeText(order.stripePaymentId);
                }
              }}
            />
          )}
          {order.stripePaymentId ?? '-'}
        </div>
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Stripe Customer ID:</div>
        <div className="flex items-center gap-2">
          {order.stripeCustomerId && (
            <CopyIcon
              size={12}
              className="cursor-pointer"
              onClick={() => {
                if (order.stripeCustomerId) {
                  navigator.clipboard.writeText(order.stripeCustomerId);
                }
              }}
            />
          )}
          {order.stripeCustomerId ?? '-'}
        </div>
      </div>
      <div className="col-span-2">
        <div className="mb-2 font-serif text-xl">Message:</div>
        {order.message ?? '-'}
      </div>
    </section>
  );
}

export default OrderDetails;

function getStatusIndicator(status: OrderStatus) {
  let colorClass = 'text-gray-500';

  if (status === 'created') {
    colorClass = 'text-yellow-500';
  } else if (status === 'paid') {
    colorClass = 'text-blue-500';
  } else if (status === 'completed') {
    colorClass = 'text-green-500';
  }

  return (
    <div className="flex items-center">
      <CheckCircle2 className={`mr-2 h-4 w-4 ${colorClass}`} />
      <span className={`font-medium capitalize ${colorClass}`}>{status}</span>
    </div>
  );
}

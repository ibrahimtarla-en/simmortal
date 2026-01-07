'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, Link2, MoreHorizontal } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { DetailedOrder } from '@/types/shop';
import Link from 'next/link';

export const columns: ColumnDef<DetailedOrder>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY'),
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        onClick={(e) => {
          e.stopPropagation();
        }}
        href={`/users/${row.original.userId}`}
        className="line-clamp-1 text-ellipsis"
        target="_blank">
        {row.original.userId} <Link2 className="mb-1 ml-1 inline-block" size={12} />
      </Link>
    ),
  },
  {
    accessorKey: 'itemName',
    id: 'summary',
    header: 'Order Summary',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col">
          <span>
            {order.quantity} x {order.itemName ?? 'Unknown Item'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Total Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.original.totalPrice;
      return <span> {price ? `$${price.toFixed(2)}` : '-'}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
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
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
              className="cursor-pointer">
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.location.href = `/orders/${order.id}`;
              }}>
              View Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

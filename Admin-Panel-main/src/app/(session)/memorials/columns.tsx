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
import { CheckCircle2, MoreHorizontal } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { AdminMemorial, MemorialStatus } from '@/types/memorial';
import { getWebsiteDomain } from '@/services/env';
import { addFeaturedMemorial, removeFeaturedMemorial } from '@/services/server/memorial';
import { formatDate } from '@/utils/date';

export const columns: ColumnDef<AdminMemorial>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Memorial ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
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
    accessorKey: 'stats.views',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'isFeatured',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Featured
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.isFeatured ? <CheckCircle2 /> : '-'),
  },
  {
    accessorKey: 'isPremium',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Premium
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.isPremium ? <CheckCircle2 /> : '-'),
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
      let colorClass = '';
      switch (status) {
        case MemorialStatus.PUBLISHED:
          colorClass = 'text-green-600 bg-green-100';
          break;
        case MemorialStatus.DRAFT:
          colorClass = 'text-yellow-600 bg-yellow-100';
          break;
        case MemorialStatus.REMOVED:
          colorClass = 'text-red-600 bg-red-100';
          break;
        default:
          colorClass = 'text-gray-600 bg-gray-100';
      }
      return (
        <span
          className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${colorClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const memorial = row.original;

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
              onClick={() => navigator.clipboard.writeText(memorial.id)}
              className="cursor-pointer">
              Copy memorial ID
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = `/memorials/${memorial.id}`)}>
              View memorial details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open(`${getWebsiteDomain()}/memorial/${memorial.slug}`, '_blank');
              }}>
              View on website
            </DropdownMenuItem>
            {memorial.status === MemorialStatus.PUBLISHED && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => {
                  if (memorial.isFeatured) {
                    await removeFeaturedMemorial(memorial.id);
                  } else {
                    await addFeaturedMemorial(memorial.id);
                  }
                  window.alert('Featured status updated');
                  window.location.reload();
                }}>
                {memorial.isFeatured ? 'Unfeature memorial' : 'Feature memorial'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

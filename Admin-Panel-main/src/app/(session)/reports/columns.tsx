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
import { Eye, Link2, MoreHorizontal } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import {
  AdminMemorialFlag,
  MemorialFlagReason,
  MemorialFlagStatus,
  MemorialFlagType,
} from '@/types/memorial';
import { getDomain, getWebsiteDomain } from '@/services/env';
import { formatDate } from '@/utils/date';
import Link from 'next/link';
import { handleMemorialFlag } from '@/services/server/memorial';

export const columns: ColumnDef<AdminMemorialFlag>[] = [
  {
    accessorKey: 'actor.name',
    id: 'reporter',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Reporter
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original.actor.id}`}
        target="_blank"
        className="ml-3 flex items-center gap-2 underline">
        {row.original.actor.name} <Link2 className="h-4 w-4" />
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Report Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      switch (row.original.type) {
        case MemorialFlagType.MEMORIAL_REPORT:
          return 'Memorial';
        case MemorialFlagType.MEMORY_REPORT:
          return 'Memory';
        case MemorialFlagType.CONDOLENCE_REPORT:
          return 'Condolence';
        case MemorialFlagType.DONATION_REPORT:
          return 'Donation';
      }
    },
  },
  {
    id: 'preview',
    header: 'Preview',
    cell: ({ row, table }) => {
      const flag = row.original;
      if (flag.type === MemorialFlagType.MEMORIAL_REPORT) {
        return null;
      }
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // @ts-expect-error - meta is custom property
            table.options.meta?.onPreview(flag);
          }}>
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'memorialName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Memorial
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={getWebsiteDomain() + row.original.memorialUrl}
        target="_blank"
        className="flex items-center gap-2 underline">
        {row.original.memorialName} <Link2 className="h-4 w-4" />
      </Link>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Report Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY'),
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.reason ? reasonRecord[row.original.reason] : '-'),
  },
  {
    accessorKey: 'memorialOwner.name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Memorial Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original.memorialOwner.id}`}
        target="_blank"
        className="flex items-center gap-2 underline">
        {row.original.memorialOwner.name} <Link2 className="h-4 w-4" />
      </Link>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const flag = row.original;

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
              onClick={() => navigator.clipboard.writeText(flag.id)}
              className="cursor-pointer">
              Copy flag ID
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open(`${getWebsiteDomain()}${flag.memorialUrl}`, '_blank');
              }}>
              View Memorial
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open(`${getDomain()}/users/${flag.actor.id}`, '_blank');
              }}>
              View Reporter
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open(`${getDomain()}/users/${flag.memorialOwner.id}`, '_blank');
              }}>
              View Memorial Owner
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={async () => {
                await handleMemorialFlag(flag.id, MemorialFlagStatus.REJECTED);
                window.alert('Report rejected');
                window.location.reload();
              }}>
              Reject Report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer font-black text-red-500"
              onClick={async () => {
                await handleMemorialFlag(flag.id, MemorialFlagStatus.APPROVED);
                window.alert('Memorial removed');
                window.location.reload();
              }}>
              REMOVE MEMORIAL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const reasonRecord: Record<MemorialFlagReason, string> = {
  dislike: "I don't like it",
  bullying: 'Bullying or unwanted contact',
  harmful: 'Suicide, self-injury or eating disorders',
  violence: 'Violence, hate or explotation',
  promoting: 'Selling or promoting restricted items',
  explicit: 'Nudity or sexual content',
  scam: 'Scam, fraud or spam',
  'false-info': 'False or misleading information',
  copyright: 'Copyright or trademark infringement',
  illegal: 'Unlawful content',
};

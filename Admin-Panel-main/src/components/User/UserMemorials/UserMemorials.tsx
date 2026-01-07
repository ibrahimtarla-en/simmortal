'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemorialStatus, OwnedMemorialPreview } from '@/types/memorial';
import Link from 'next/link';
import { getWebsiteDomain } from '@/services/env';
import { LinkIcon } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { useRouter } from 'next/navigation';

interface UserMemorialsProps {
  memorials: OwnedMemorialPreview[];
}

function UserMemorials({ memorials }: UserMemorialsProps) {
  const router = useRouter();
  if (memorials.length === 0) {
    return <p className="text-center text-gray-500">No memorials found.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Memorial ID</TableHead>
          <TableHead>Memorial Name</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Memorial Status</TableHead>
          <TableHead className="text-right">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memorials.map((memorial) => (
          <TableRow
            key={memorial.id}
            className="h-7 cursor-pointer"
            onClick={() => router.push(`/memorials/${memorial.id}`)}>
            <TableCell className="w-85">{memorial.id}</TableCell>
            <TableCell>{memorial.name}</TableCell>
            <TableCell>{formatDate(memorial.createdAt, 'DD MMM YYYY')}</TableCell>
            <TableCell>{memorial.status}</TableCell>
            <TableCell className="w-[50px] text-center">
              {memorial.status === MemorialStatus.PUBLISHED && (
                <Link
                  href={`${getWebsiteDomain()}/memorial/${memorial.slug}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}>
                  <LinkIcon className="mx-auto h-4 w-4 text-blue-500 hover:text-blue-700" />
                </Link>
              )}
              {memorial.status !== MemorialStatus.PUBLISHED && (
                <span className="text-gray-500">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default UserMemorials;

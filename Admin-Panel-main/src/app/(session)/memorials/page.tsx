import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { getPublishedMemorials } from '@/services/server/memorial';

async function MemorialsPage() {
  const memorials = await getPublishedMemorials();
  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Memorials</h1>
      <DataTable columns={columns} data={memorials} />
    </>
  );
}

export default MemorialsPage;

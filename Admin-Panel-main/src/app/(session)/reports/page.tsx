import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { getOpenMemorialFlags } from '@/services/server/flag';

async function MemorialsPage() {
  const flags = await getOpenMemorialFlags();
  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Reports</h1>
      <DataTable columns={columns} data={flags} />
    </>
  );
}

export default MemorialsPage;

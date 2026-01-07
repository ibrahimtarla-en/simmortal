import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { getOpenContactForms } from '@/services/server/contact';

async function page() {
  const contactForms = await getOpenContactForms();
  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Open Contact Requests</h1>
      <DataTable columns={columns} data={contactForms} />
    </>
  );
}

export default page;

import { getUsers } from '@/services/server/user';
import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';

async function UsersPage() {
  const users = await getUsers();
  return (
    <>
      <h1 className="mb-5 py-10 font-serif text-3xl">Users</h1>
      <DataTable columns={columns} data={users} />
    </>
  );
}

export default UsersPage;

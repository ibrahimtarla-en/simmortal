import UserDetails from '@/components/User/UserDetails/UserDetails';
import UserMemorials from '@/components/User/UserMemorials/UserMemorials';
import { getOwnedMemorialPreviews } from '@/services/server/memorial';
import { getUser, getUserCustomerId } from '@/services/server/user';
import { DynamicRouteParams } from '@/types/util';
import React from 'react';

async function UserDetailsPage({ params }: DynamicRouteParams<{ id: string }>) {
  const { id } = await params;
  const [user, memorials, customerId] = await Promise.all([
    getUser(id),
    getOwnedMemorialPreviews(id),
    getUserCustomerId(id),
  ]);

  if (!user) {
    return <div className="my-10 text-center text-lg">User not found</div>;
  }

  return (
    <div>
      <UserDetails user={user} customerId={customerId} />
      <UserMemorials memorials={memorials || []} />
    </div>
  );
}

export default UserDetailsPage;

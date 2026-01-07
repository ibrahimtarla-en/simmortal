'use client';
import { AdminUserDetails, UserAccountStatus } from '@/types/user';
import Image from 'next/image';
import React from 'react';
import LogoIcon from '@/assets/brand/logo-icon.svg';
import { CheckCircle2Icon, CopyIcon, ExternalLinkIcon } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { Button } from '../../ui/button';
import { updateUserStatus } from '@/services/server/user';
import { useRouter } from 'next/navigation';
import { getEnv } from '@/services/env';

interface UserDetailsProps {
  user: AdminUserDetails;
  customerId: string | null;
}

function UserDetails({ user, customerId }: UserDetailsProps) {
  const router = useRouter();

  return (
    <section className="grid grid-cols-[200px_1fr] gap-20 py-10">
      <div className="flex flex-col gap-5">
        <div className="flex aspect-square items-center justify-center overflow-clip rounded-lg border-4 border-y-zinc-800">
          {user.profilePictureUrl && (
            <Image src={user.profilePictureUrl} alt="User Avatar" width={200} height={200} />
          )}
          {!user.profilePictureUrl && <LogoIcon className="text-muted-foreground h-24 w-24" />}
        </div>
        <h2 className="font-serif font-bold">User ID:</h2>
        <div className="flex items-center gap-2 text-xs">
          <CopyIcon
            className="h-5 w-5 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(user.userId)}
          />
          {user.userId}
        </div>
        <h2 className="font-serif font-bold">Customer ID (Stripe):</h2>
        <div className="flex items-center gap-2 text-xs">
          {customerId ? (
            <a
              href={`https://dashboard.stripe.com/acct_1S3uTmKd3nA2Us2U/${getEnv() === 'production' ? '' : 'test/'}customers/${customerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer hover:opacity-70">
              <ExternalLinkIcon className="h-5 w-5" />
              {customerId}
            </a>
          ) : (
            '-'
          )}
        </div>
        <h2 className="font-serif font-bold">Total Spent:</h2>
        <div className="text-sm font-semibold">${user.totalSpent}</div>
        {user.status === UserAccountStatus.ACTIVE && (
          <Button
            onClick={async () => {
              await updateUserStatus(user.userId, UserAccountStatus.SUSPENDED);
              window.alert('User has been suspended.');
              router.refresh();
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer bg-red-950 hover:bg-red-900">
            Suspend User
          </Button>
        )}
        {user.status === UserAccountStatus.SUSPENDED && (
          <Button
            onClick={async () => {
              await updateUserStatus(user.userId, UserAccountStatus.ACTIVE);
              window.alert('User has been reactivated.');
              router.refresh();
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer bg-green-950 hover:bg-green-900">
            Reactivate User
          </Button>
        )}
        {user.status === UserAccountStatus.DELETED && (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-not-allowed bg-zinc-600 hover:bg-zinc-500">
            Account Deleted
          </Button>
        )}
      </div>
      <div className="grid max-w-200 grow grid-cols-2 gap-8">
        <div>
          <div className="mb-2 font-serif text-lg">Name:</div>
          <div className="font-sans font-light">
            {user.firstName} {user.lastName}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Location:</div>
          <div className="font-sans font-light">{user.location ?? '-'}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Email:</div>
          <div className="font-sans font-light">{user.email}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Joined At:</div>
          <div className="font-sans font-light">{formatDate(user.joinedAt, 'DD MMM YYYY')}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Email Verified:</div>
          <div className="font-sans font-light">
            {user.emailVerified ? <CheckCircle2Icon /> : '-'}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Phone Number:</div>
          <div className="font-sans font-light">{user.phoneNumber ?? '-'}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Phone Number Verified:</div>
          <div className="font-sans font-light">
            {user.phoneNumberVerified ? <CheckCircle2Icon /> : '-'}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Birthday:</div>
          <div className="font-sans font-light">
            {user.dateOfBirth ? formatDate(user.dateOfBirth, 'DD MMM YYYY') : '-'}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Login Method:</div>
          <div className="font-sans font-light">{user.loginMethod}</div>
        </div>
        <div className="col-span-2 border-t border-zinc-700 pt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-2 font-serif text-lg">Memorials Created:</div>
              <div className="font-sans font-light">{user.memorialsCreated}</div>
            </div>
            <div>
              <div className="mb-2 font-serif text-lg">Memorials Published:</div>
              <div className="font-sans font-light">{user.memorialsPublished}</div>
            </div>
            <div>
              <div className="mb-2 font-serif text-lg">Premium Memorials:</div>
              <div className="font-sans font-light">{user.premiumMemorials}</div>
            </div>
            <div>
              <div className="mb-2 font-serif text-lg">Memories Created:</div>
              <div className="font-sans font-light">{user.memoriesCreated}</div>
            </div>
            <div>
              <div className="mb-2 font-serif text-lg">Condolences Created:</div>
              <div className="font-sans font-light">{user.condolencesCreated}</div>
            </div>
            <div>
              <div className="mb-2 font-serif text-lg">Donations Created:</div>
              <div className="font-sans font-light">{user.donationsCreated}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDetails;

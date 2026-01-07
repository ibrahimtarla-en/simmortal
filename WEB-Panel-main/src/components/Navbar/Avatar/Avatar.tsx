'use client';
import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { Nullable } from '@/types/util';
import { SimmortalsUser } from '@/types/user';

interface AvatarProps {
  className?: string;
  user: Nullable<SimmortalsUser>;
}

function Avatar({ className, user, ...props }: AvatarProps) {
  const avatarString = useMemo(() => {
    const firstNameInitial = user?.firstName?.toUpperCase()[0];
    const lastNameInitial = user?.lastName?.toUpperCase()[0];
    if (!firstNameInitial && !lastNameInitial) return 'U'; // Return U for User
    return `${firstNameInitial}${lastNameInitial}`;
  }, [user]);

  return (
    <div
      {...props}
      className={cn(
        'border-shine-1 block aspect-square h-11 shrink-0 rounded-full bg-black font-sans',
        className,
      )}>
      <div className="flex h-full w-full items-center justify-center rounded-full text-sm font-medium">
        {avatarString}
      </div>
    </div>
  );
}

export default Avatar;

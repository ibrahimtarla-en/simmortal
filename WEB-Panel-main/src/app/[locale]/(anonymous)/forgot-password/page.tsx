import { ForgotPassword, MemorialCarousel } from '@/components';
import { getFeaturedMemorials } from '@/services/server/memorial';
import { cn } from '@/utils/cn';
import React from 'react';

async function ForgotPasswordPage() {
  const featuredMemorials = await getFeaturedMemorials();
  return (
    <div className={cn('container py-27.5')}>
      <div
        className={cn(
          'relative flex w-full flex-row justify-center',
          'md:flex md:gap-22',
          'xl:gap-45',
        )}>
        <ForgotPassword />
        {featuredMemorials.length > 0 && (
          <div className={cn('hidden max-w-180', 'md:flex md:grow md:flex-col md:justify-center')}>
            <MemorialCarousel memorials={featuredMemorials} className="w-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

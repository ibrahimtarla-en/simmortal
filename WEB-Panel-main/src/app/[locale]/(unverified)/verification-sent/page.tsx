import { MemorialCarousel, VerificationSent } from '@/components';
import { getFeaturedMemorials } from '@/services/server/memorial';
import { cn } from '@/utils/cn';
import React from 'react';

async function VerificationSentPage() {
  const featuredMemorials = await getFeaturedMemorials();
  return (
    <div className={cn('py-27.5')}>
      <div
        className={cn(
          'relative flex w-full flex-row justify-center',
          'md:flex md:gap-22',
          'xl:gap-45',
        )}>
        <VerificationSent />
        <div className={cn('hidden max-w-180', 'md:flex md:grow md:flex-col md:justify-center')}>
          <MemorialCarousel memorials={featuredMemorials} className="w-auto" />
        </div>
      </div>
    </div>
  );
}

export default VerificationSentPage;

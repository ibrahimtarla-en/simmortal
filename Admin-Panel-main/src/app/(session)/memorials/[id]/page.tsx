import MemorialDetails from '@/components/Memorial/MemorialDetails/MemorialDetails';
import { getMemorialById } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import React from 'react';

async function MemorialDetailsPage({ params }: DynamicRouteParams<{ id: string }>) {
  const { id } = await params;
  const memorial = await getMemorialById(id);

  if (!memorial) {
    return <div className="my-10 text-center text-lg">Memorial not found</div>;
  }

  return (
    <div>
      <MemorialDetails memorial={memorial} />
    </div>
  );
}

export default MemorialDetailsPage;

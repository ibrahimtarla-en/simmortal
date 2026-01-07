'use client';
import { PublishedMemorial } from '@/types/memorial';
import React from 'react';
import MemorialInfo from '../../MemorialInfo/MemorialInfo';

interface EditPublishedMemorialProps {
  publishedMemorial: PublishedMemorial;
  isPremium: boolean;
}

function EditPublishedMemorial({ publishedMemorial, isPremium }: EditPublishedMemorialProps) {
  return (
    <section>
      <MemorialInfo
        memorial={publishedMemorial}
        className="mt-0"
        viewMode="edit"
        isPremium={isPremium}
      />
    </section>
  );
}

export default EditPublishedMemorial;

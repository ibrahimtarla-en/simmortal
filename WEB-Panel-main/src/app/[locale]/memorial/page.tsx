import {
  BrowseMemorials,
  CreateMemorialBanner,
  FeaturedCarousel,
  MemorialWall,
  SectionTransition,
} from '@/components';
import { getFeaturedMemorials } from '@/services/server/memorial';
import React from 'react';

async function BrowseMemorialsPage() {
  const featuredMemorials = await getFeaturedMemorials();

  return (
    <main>
      <section className="container">
        <BrowseMemorials />
      </section>
      <SectionTransition />
      <section className="container">
        <MemorialWall />
      </section>
      {featuredMemorials.length > 0 && (
        <section className="container">
          <FeaturedCarousel memorials={featuredMemorials} />
        </section>
      )}
      <section className="container">
        <CreateMemorialBanner />
      </section>
    </main>
  );
}

export default BrowseMemorialsPage;

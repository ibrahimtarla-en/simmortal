import MemorialInfo from '@/components/Memorial/MemorialInfo/MemorialInfo';
import { redirect } from '@/i18n/navigation';
import { getMemorialFlags, getPublishedMemorialBySlug } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';
import React from 'react';
import MemorialTabs from '@/components/Memorial/MemorialTabs/MemorialTabs';
import MemorialPublishedModal from '@/components/Memorial/CreateEditMemorial/MemorialPublishedModal';
import { ContributeType } from '@/types/memory';
import { Metadata } from 'next';
import { DEFAULT_METADATA } from '@/services/metadata';
import { getDomain, getEnv } from '@/services/env';
import { getWreathPrices } from '@/services/server/shop';

export async function generateMetadata({
  params,
}: DynamicRouteParams<{ slug: string }>): Promise<Metadata> {
  const [slug, locale] = await Promise.all([(await params).slug, getLocale()]);

  // fetch post information
  const memorial = await getPublishedMemorialBySlug(slug);
  if (!memorial) {
    return DEFAULT_METADATA;
  }
  return {
    title: memorial.name,
    robots: {
      index: getEnv() !== 'test' && !memorial.isUnlisted,
      follow: getEnv() !== 'test' && !memorial.isUnlisted,
    },
    openGraph: {
      title: memorial.name,
      description: memorial.about,
      siteName: 'Simmortals',
      url: `${getDomain()}/${locale}/memorial/${memorial.slug}`,
      images: [
        {
          url: getDomain() + memorial.imagePath,
          width: 1024,
          height: 1024,
          secureUrl: getDomain() + memorial.imagePath,
        },
      ],
      locale: locale,
      type: 'website',
    },
  };
}

async function CreateMemorialPage({ params, searchParams }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }, queryParams, locale] = await Promise.all([params, searchParams, getLocale()]);
  const { session_id, type } = queryParams;
  console.log(queryParams);
  if (!slug) {
    return redirect({ href: '/', locale });
  }
  const [memorial, flags, wreathPrices] = await Promise.all([
    getPublishedMemorialBySlug(slug),
    getMemorialFlags(slug),
    getWreathPrices(),
  ]);
  if (!memorial) {
    return redirect({ href: `/`, locale });
  }
  if (memorial.slug !== slug) {
    let premiumUrl = `/memorial/${memorial.slug}`;
    if (queryParams) {
      const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
      premiumUrl += `?${queryString}`;
    }
    return redirect({ href: premiumUrl, locale });
  }

  return (
    <main className="scroll-smooth">
      {session_id && <MemorialPublishedModal type={type as ContributeType} />}
      <MemorialInfo memorial={memorial} showCover />
      <div className="container">
        <MemorialTabs
          timeline={memorial.timeline}
          flags={flags}
          memorialSlug={memorial.slug}
          wreathPrices={wreathPrices}
        />
      </div>
    </main>
  );
}

export default CreateMemorialPage;

import { CreateEditCondolence } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getPublishedMemorialBySlug } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function CreateCondolencePage({ params }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);

  const memorial = await getPublishedMemorialBySlug(slug);
  if (!memorial) {
    return redirect({ href: '/', locale: locale });
  }
  return <CreateEditCondolence.About slug={slug} memorialName={memorial.name} />;
}

export default CreateCondolencePage;

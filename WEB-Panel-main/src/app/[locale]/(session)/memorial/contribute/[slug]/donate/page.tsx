import AddDonation from '@/components/Memorial/Donation/AddDonation/AddDonation';
import { redirect } from '@/i18n/navigation';
import { getPublishedMemorialBySlug } from '@/services/server/memorial';
import { getWreathPrices } from '@/services/server/shop';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function DonatePage({ params }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);

  const [memorial, prices] = await Promise.all([
    getPublishedMemorialBySlug(slug),
    getWreathPrices(),
  ]);
  if (!memorial || !prices) {
    return redirect({ href: '/', locale: locale });
  }
  return <AddDonation memorialSlug={slug} memorial={memorial} prices={prices} />;
}

export default DonatePage;

import { redirect } from '@/i18n/navigation';
import { validateCondolencePurchase } from '@/services/server/condolence';
import { validateDonationPurchase } from '@/services/server/donation';
import { validateMemoryPurchase } from '@/services/server/memory';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function PremiumSubscriptionSuccessPage({
  params,
  searchParams,
}: DynamicRouteParams<{
  slug: string;
}>) {
  const [{ slug }, { type, session_id, contribution_id }, locale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);
  if (!slug || !type || !session_id || !contribution_id) {
    return redirect({ href: '/', locale });
  }
  if (type === 'memory') {
    const result = await validateMemoryPurchase(
      slug,
      contribution_id as string,
      session_id as string,
    );
    return redirect({ href: result.redirectUrl, locale });
  }

  if (type === 'condolence') {
    const result = await validateCondolencePurchase(
      slug,
      contribution_id as string,
      session_id as string,
    );
    return redirect({ href: result.redirectUrl, locale });
  }
  if (type === 'donation') {
    const result = await validateDonationPurchase(
      slug,
      contribution_id as string,
      session_id as string,
    );
    return redirect({ href: result.redirectUrl, locale });
  }
}

export default PremiumSubscriptionSuccessPage;
